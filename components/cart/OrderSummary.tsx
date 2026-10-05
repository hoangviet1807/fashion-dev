"use client";

import { FormEvent, useState, useTransition } from "react";
import { DELIVERY_FEE } from "@/lib/cart-data";
import { useCartStore } from "@/lib/cart/store";
import { couponLabel } from "@/lib/coupons/discount";
import { formatPrice } from "@/lib/money";
import { applyPromo } from "@/app/(site)/cart/actions";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Icon } from "@/components/ui/Icon";

export function OrderSummary({
  subtotal,
  discount,
  total,
  deliveryFee = DELIVERY_FEE,
  children,
  action,
}: {
  subtotal: number;
  discount: number;
  total: number;
  deliveryFee?: number;
  /** Rendered between the heading and the totals. */
  children?: React.ReactNode;
  /** Replaces the default "Go to Checkout" button. */
  action?: React.ReactNode;
}) {
  const items = useCartStore((state) => state.items);
  const coupon = useCartStore((state) => state.coupon);
  const setCoupon = useCartStore((state) => state.setCoupon);
  const [promoError, setPromoError] = useState<string>();
  const [applying, startApplying] = useTransition();

  function onPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (applying) return;
    setPromoError(undefined);

    if (coupon) {
      setCoupon(null);
      return;
    }

    const code = String(new FormData(event.currentTarget).get("promo") ?? "");
    startApplying(async () => {
      try {
        const result = await applyPromo({
          code,
          items: items.map(({ sku, quantity }) => ({ sku, quantity })),
        });
        if (result.status === "applied") setCoupon(result.coupon);
        else setPromoError(result.message);
      } catch {
        setPromoError("Chưa kiểm tra được mã giảm giá. Vui lòng thử lại.");
      }
    });
  }

  const belowMinimum = coupon !== null && subtotal < coupon.minSubtotal;

  return (
    <aside className="w-full rounded-[20px] border border-line p-5 xl:max-w-[505px] xl:px-6 xl:py-5">
      <h2 className="text-xl font-bold text-black xl:text-2xl">Tóm tắt đơn hàng</h2>

      {children}

      <div className="mt-4 flex flex-col gap-5 xl:mt-6">
        <div className="flex items-center justify-between text-base xl:text-xl">
          <span className="text-text-60">Tạm tính</span>
          <span className="font-bold text-black">{formatPrice(subtotal)}</span>
        </div>
        {coupon ? (
          <div className="flex items-center justify-between text-base xl:text-xl">
            <span className="text-text-60">Giảm giá ({couponLabel(coupon)})</span>
            <span className="font-bold text-discount">-{formatPrice(discount)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between text-base xl:text-xl">
          <span className="text-text-60">Phí vận chuyển</span>
          <span className="font-bold text-black">{formatPrice(deliveryFee)}</span>
        </div>

        <hr className="border-line" />

        <div className="flex items-center justify-between">
          <span className="text-base text-black xl:text-xl">Tổng cộng</span>
          <span className="text-xl font-bold text-black xl:text-2xl">{formatPrice(total)}</span>
        </div>
      </div>

      <form onSubmit={onPromo} noValidate className="mt-5 xl:mt-6">
        <div className="flex gap-3">
          <TextField
            key={coupon?.code ?? ""}
            icon="/icons/tag.svg"
            placeholder="Nhập mã giảm giá"
            name="promo"
            defaultValue={coupon?.code}
            autoComplete="off"
            error={promoError}
            className="h-12 min-w-0 flex-1"
          />
          <Button
            type="submit"
            disabled={applying}
            className="h-12 shrink-0 px-8 text-sm xl:px-9"
          >
            {coupon ? "Gỡ mã" : "Áp dụng"}
          </Button>
        </div>
        {promoError ? (
          <p id="promo-error" role="alert" className="mt-1.5 px-4 text-sm text-discount">
            {promoError}
          </p>
        ) : belowMinimum ? (
          <p className="mt-1.5 px-4 text-sm text-text-60">
            Đơn hàng tối thiểu {formatPrice(coupon.minSubtotal)} để dùng mã {coupon.code}.
          </p>
        ) : null}
      </form>

      {action ?? (
        <Button
          href="/checkout"
          fullWidth
          className="mt-4 h-[54px] gap-3 text-sm xl:mt-6 xl:h-[60px] xl:text-base"
        >
          Thanh toán
          <Icon
            src="/icons/arrow-right.svg"
            size={20}
            className="-rotate-90 brightness-0 invert"
          />
        </Button>
      )}
    </aside>
  );
}
