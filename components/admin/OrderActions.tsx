"use client";

import { useState, type FormEvent } from "react";
import {
  cancelOrderAction,
  deliverOrder,
  refundOrder,
  shipOrder,
} from "@/app/(site)/admin/actions";
import { AccountCard, AccountField, FieldGrid } from "@/components/account/AccountFields";
import { useAccountForm } from "@/components/account/useAccountForm";
import { FormNotice } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/Button";
import { cancelSchema, orderActionSchema, refundSchema, shipSchema } from "@/lib/admin/schema";
import type { Order } from "@/lib/db/schema";
import { formatPrice } from "@/lib/money";

type Props = {
  orderNumber: number;
  status: Order["status"];
  paymentMethod: Order["paymentMethod"];
  currency: string;
  total: number;
  carrier: string | null;
  trackingNumber: string | null;
  canShip: boolean;
  canDeliver: boolean;
  canCancel: boolean;
  /** Remaining amount that may still be refunded; 0 hides the refund form. */
  refundable: number;
};

type OnDone = (message?: string) => void;
type CardProps = Props & { onDone: OnDone };

export function OrderActions(props: Props) {
  const [flash, setFlash] = useState<string | null>(null);
  const onDone: OnDone = (message) => setFlash(message ?? null);
  const { canShip, canDeliver, canCancel, refundable } = props;

  if (!canShip && !canDeliver && !canCancel && refundable <= 0) {
    return flash ? <FormNotice tone="success">{flash}</FormNotice> : null;
  }

  return (
    <div className="flex flex-col gap-5">
      {flash ? <FormNotice tone="success">{flash}</FormNotice> : null}
      <div className="flex flex-col items-stretch gap-5 xl:flex-row xl:items-start">
        {canShip || canDeliver ? (
          <AccountCard title="Vận chuyển">
            {canShip ? <ShipForm {...props} onDone={onDone} /> : null}
            {canDeliver ? <DeliverForm {...props} onDone={onDone} /> : null}
          </AccountCard>
        ) : null}
        {refundable > 0 ? <RefundCard {...props} onDone={onDone} /> : null}
        {canCancel ? <CancelCard key={props.status} {...props} onDone={onDone} /> : null}
      </div>
    </div>
  );
}

function ErrorNotice({ notice }: { notice: { tone: "error" | "success"; text: string } | null }) {
  return notice?.tone === "error" ? <FormNotice tone="error">{notice.text}</FormNotice> : null;
}

function ShipForm({ orderNumber, status, carrier, trackingNumber, onDone }: CardProps) {
  const { errors, notice, pending, onSubmit, formRef } = useAccountForm({
    schema: shipSchema,
    action: shipOrder,
    extra: { orderNumber: String(orderNumber) },
    onSaved: (_, message) => onDone(message),
  });
  const shipped = status === "shipped";

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      <ErrorNotice notice={notice} />
      <FieldGrid>
        <AccountField
          name="carrier"
          placeholder="Đơn vị vận chuyển (GHN, GHTK…)"
          defaultValue={carrier ?? ""}
          errors={errors}
        />
        <AccountField
          name="trackingNumber"
          placeholder="Mã vận đơn"
          defaultValue={trackingNumber ?? ""}
          errors={errors}
        />
      </FieldGrid>
      <p className="px-1 text-sm text-text-60">
        {shipped
          ? "Cập nhật mã vận đơn không gửi lại email cho khách."
          : "Khách sẽ nhận email “Đơn hàng đang được giao” kèm mã vận đơn."}
      </p>
      <Button type="submit" fullWidth loading={pending}>
        {shipped ? "Cập nhật vận chuyển" : "Chuyển sang Đang giao"}
      </Button>
    </form>
  );
}

function DeliverForm({ orderNumber, paymentMethod, currency, total, onDone }: CardProps) {
  const { notice, pending, onSubmit, formRef } = useAccountForm({
    schema: orderActionSchema,
    action: deliverOrder,
    extra: { orderNumber: String(orderNumber) },
    onSaved: (_, message) => onDone(message),
  });

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      <ErrorNotice notice={notice} />
      {paymentMethod === "cod" ? (
        <p className="px-1 text-sm text-text-60">
          Đơn COD: chỉ đánh dấu hoàn tất khi đơn vị vận chuyển đã thu{" "}
          <strong className="text-black">{formatPrice(total, currency)}</strong>.
        </p>
      ) : null}
      <Button type="submit" variant="secondary" fullWidth loading={pending}>
        Đánh dấu đã giao (Hoàn tất)
      </Button>
    </form>
  );
}

function RefundCard({ orderNumber, currency, paymentMethod, refundable, onDone }: CardProps) {
  const { errors, notice, pending, onSubmit, formRef } = useAccountForm({
    schema: refundSchema,
    action: refundOrder,
    extra: { orderNumber: String(orderNumber) },
    onSaved: (form, message) => {
      form.reset();
      onDone(message);
    },
  });

  return (
    <AccountCard title="Hoàn tiền">
      <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
        <ErrorNotice notice={notice} />
        <p className="px-1 text-sm text-text-60">
          {paymentMethod === "cod"
            ? "Chuyển khoản hoặc trả tiền mặt cho khách trước, sau đó ghi nhận tại đây."
            : paymentMethod === "payos"
              ? "Chuyển khoản trả lại khách từ tài khoản nhận tiền trước, sau đó ghi nhận tại đây."
              : "Hoàn tiền trên cổng quản trị của cổng thanh toán trước, sau đó ghi nhận tại đây."}{" "}
          Còn có thể hoàn tối đa <strong className="text-black">{formatPrice(refundable, currency)}</strong>.
        </p>
        <AccountField
          name="amount"
          placeholder="Số tiền hoàn (₫)"
          defaultValue={String(refundable)}
          errors={errors}
        />
        <AccountField name="reason" placeholder="Lý do (khách trả hàng, hết hàng…)" errors={errors} />
        <Button type="submit" fullWidth loading={pending}>
          Ghi nhận hoàn tiền
        </Button>
      </form>
    </AccountCard>
  );
}

function CancelCard({ orderNumber, status, paymentMethod, onDone }: CardProps) {
  const { errors, notice, pending, onSubmit, formRef } = useAccountForm({
    schema: cancelSchema,
    action: cancelOrderAction,
    extra: { orderNumber: String(orderNumber) },
    onSaved: (_, message) => onDone(message),
  });

  function confirmSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Huỷ đơn hàng #${orderNumber}? Không thể hoàn tác.`)) {
      event.preventDefault();
      return;
    }
    onSubmit(event);
  }

  return (
    <AccountCard title="Huỷ đơn">
      <form ref={formRef} noValidate onSubmit={confirmSubmit} className="flex flex-col gap-3">
        <ErrorNotice notice={notice} />
        {paymentMethod !== "cod" ? (
          <p className="px-1 text-sm text-text-60">
            Khách đã thanh toán online — nhớ hoàn tiền và ghi nhận ở mục Hoàn tiền sau khi huỷ.
          </p>
        ) : null}
        <AccountField name="reason" placeholder="Lý do huỷ" errors={errors} />
        <label className="flex cursor-pointer items-center gap-3 px-1 py-1 text-base text-black">
          <input
            type="checkbox"
            name="restock"
            defaultChecked={status !== "shipped"}
            className="size-4 shrink-0 accent-black"
          />
          Nhập lại kho các sản phẩm trong đơn
        </label>
        <Button type="submit" variant="secondary" fullWidth loading={pending}>
          Huỷ đơn hàng
        </Button>
      </form>
    </AccountCard>
  );
}
