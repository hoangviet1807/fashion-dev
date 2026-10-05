"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { BankTransfer, Order, OrderItem } from "@/lib/db/schema";
import { formatPrice } from "@/lib/money";
import { cancelBankTransfer } from "@/app/(site)/order/[id]/pay/actions";
import { Container } from "@/components/layout/Container";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";
import { Button, buttonClasses } from "@/components/ui/Button";
import { OrderDetails } from "./OrderDetails";

const POLL_MS = 4000;

type State = "pending" | "expired";

function formatRemaining(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}

export function BankTransferView({
  order,
  items,
  initialState,
  amount,
  expiresAt,
  transfer,
  bank,
  qrSvg,
}: {
  order: Order;
  items: OrderItem[];
  initialState: State;
  amount: number;
  expiresAt: string | null;
  transfer: BankTransfer | null;
  bank: string | null;
  qrSvg: string | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>(initialState);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cancelling, startCancel] = useTransition();
  const polling = useRef(false);
  const deadline = expiresAt ? new Date(expiresAt).getTime() : null;

  const poll = useCallback(async () => {
    if (polling.current) return;
    polling.current = true;
    try {
      const response = await fetch(`/api/orders/${order.id}/payment`, { cache: "no-store" });
      if (!response.ok) return;
      const body = (await response.json()) as { state: "pending" | "paid" | "expired" };
      if (body.state === "paid") router.replace(`/order/${order.id}/success`);
      else if (body.state === "expired") setState("expired");
    } catch {
      // Network hiccup; the next tick retries.
    } finally {
      polling.current = false;
    }
  }, [order.id, router]);

  useEffect(() => {
    if (state !== "pending") return;
    const timer = setInterval(poll, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [state, poll]);

  useEffect(() => {
    if (state !== "pending" || deadline === null) return;
    let expiredPolled = false;
    const tick = () => {
      const left = deadline - Date.now();
      setRemaining(left);
      if (left <= 0 && !expiredPolled) {
        expiredPolled = true;
        void poll();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [state, deadline, poll]);

  function onCancel() {
    setNotice(null);
    startCancel(async () => {
      const result = await cancelBankTransfer(order.id);
      if (result === "paid") router.replace(`/order/${order.id}/success`);
      else if (result === "cancelled") router.push("/checkout");
      else setNotice("Chưa huỷ được thanh toán. Vui lòng thử lại.");
    });
  }

  const pending = state === "pending" && transfer && qrSvg;

  return (
    <div>
      <Container className="pb-20 xl:pb-[80px]">
        <hr className="border-line" />
        <div className="pt-5 xl:pt-6">
          <ShopBreadcrumb current={`Đơn hàng #${order.number}`} />
        </div>

        <h1 className="mt-2 font-display text-[32px] leading-none uppercase text-black xl:mt-6 xl:text-[40px]">
          {pending ? "Chuyển khoản ngân hàng" : "Thanh toán đã hết hạn"}
        </h1>
        <p className="mt-3 text-base text-text-60 xl:mt-4">
          {pending
            ? `Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán đơn hàng #${order.number}. Trang sẽ tự chuyển khi chúng tôi nhận được tiền.`
            : `Mã chuyển khoản cho đơn hàng #${order.number} đã hết hạn hoặc đã bị huỷ, sản phẩm đã được trả lại kho. Giỏ hàng của bạn vẫn được giữ — vui lòng đặt hàng lại.`}
        </p>

        {notice ? (
          <div
            role="alert"
            className="mt-5 rounded-[20px] bg-discount-bg px-5 py-4 text-sm text-discount xl:mt-6 xl:text-base"
          >
            {notice}
          </div>
        ) : null}

        {pending ? (
          <section
            aria-label="Thông tin chuyển khoản"
            className="mt-5 flex flex-col gap-6 rounded-[20px] border border-line p-5 xl:mt-6 xl:flex-row xl:items-center xl:gap-10 xl:px-6 xl:py-5"
          >
            <div className="flex flex-col items-center gap-3 xl:w-[280px] xl:shrink-0">
              <div
                role="img"
                aria-label={`Mã VietQR thanh toán ${formatPrice(amount)}`}
                className="size-[220px] rounded-[20px] border border-line bg-white p-4 xl:size-[260px] [&_svg]:size-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <p className="text-base text-text-60" aria-live="polite">
                Mã hết hạn sau{" "}
                <span className="font-bold text-black tabular-nums">
                  {remaining === null ? "--:--" : formatRemaining(remaining)}
                </span>
              </p>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <dl className="flex flex-col gap-4">
                {bank ? <TransferRow label="Ngân hàng" value={bank} /> : null}
                <TransferRow label="Chủ tài khoản" value={transfer.accountName} />
                <TransferRow label="Số tài khoản" value={transfer.accountNumber} copy={transfer.accountNumber} />
                <TransferRow label="Số tiền" value={formatPrice(amount)} copy={String(amount)} />
                <TransferRow label="Nội dung" value={transfer.description} copy={transfer.description} />
              </dl>
              <hr className="border-line" />
              <p className="text-sm text-text-60 xl:text-base">
                Nếu chuyển khoản thủ công, vui lòng nhập đúng số tiền và nội dung ở trên để đơn hàng được xác nhận tự động.
              </p>
              <div className="flex flex-col gap-3 md:flex-row">
                <a
                  href={transfer.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses({ className: "flex-1 px-6 text-sm xl:text-base" })}
                >
                  Mở trang thanh toán payOS
                </a>
                <Button
                  variant="secondary"
                  onClick={onCancel}
                  disabled={cancelling}
                  className="flex-1 px-6 text-sm xl:text-base"
                >
                  {cancelling ? "Đang huỷ…" : "Đổi phương thức thanh toán"}
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        <OrderDetails
          order={order}
          items={items}
          action={
            pending ? null : (
              <Button
                href="/checkout"
                fullWidth
                className="mt-5 h-[54px] text-sm xl:mt-6 xl:h-[60px] xl:text-base"
              >
                Đặt hàng lại
              </Button>
            )
          }
        />
      </Container>
    </div>
  );
}

function TransferRow({ label, value, copy }: { label: string; value: string; copy?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div className="flex items-center justify-between gap-4 text-base xl:text-xl">
      <dt className="shrink-0 text-text-60">{label}</dt>
      <dd className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <span className="break-words text-right font-bold text-black">{value}</span>
        {copy ? (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard
                ?.writeText(copy)
                .then(() => setCopied(true))
                .catch(() => {});
            }}
            className="shrink-0 rounded-[62px] border border-line px-3 py-1 text-sm font-medium text-black transition-colors hover:bg-black/[0.04]"
            aria-label={`Sao chép ${label.toLowerCase()}`}
          >
            {copied ? "Đã chép" : "Sao chép"}
          </button>
        ) : null}
      </dd>
    </div>
  );
}
