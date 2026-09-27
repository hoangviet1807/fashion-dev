"use client";

import { FormEvent } from "react";
import {
  CART_DISCOUNT_PERCENT,
  DELIVERY_FEE,
} from "@/lib/cart-data";
import { formatPrice } from "@/lib/money";
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
  function onPromo(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <aside className="w-full rounded-[20px] border border-line p-5 xl:max-w-[505px] xl:px-6 xl:py-5">
      <h2 className="text-xl font-bold text-black xl:text-2xl">Tóm tắt đơn hàng</h2>

      {children}

      <div className="mt-4 flex flex-col gap-5 xl:mt-6">
        <div className="flex items-center justify-between text-base xl:text-xl">
          <span className="text-text-60">Tạm tính</span>
          <span className="font-bold text-black">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-base xl:text-xl">
          <span className="text-text-60">
            Giảm giá (-{CART_DISCOUNT_PERCENT}%)
          </span>
          <span className="font-bold text-discount">-{formatPrice(discount)}</span>
        </div>
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

      <form onSubmit={onPromo} className="mt-5 flex gap-3 xl:mt-6">
        <TextField
          icon="/icons/tag.svg"
          placeholder="Nhập mã giảm giá"
          name="promo"
          className="h-12 min-w-0 flex-1"
        />
        <Button type="submit" className="h-12 shrink-0 px-8 text-sm xl:px-9">
          Áp dụng
        </Button>
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
