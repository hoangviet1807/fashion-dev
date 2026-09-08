"use client";

import { FormEvent } from "react";
import {
  CART_DISCOUNT_PERCENT,
  DELIVERY_FEE,
} from "@/lib/cart-data";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Icon } from "@/components/ui/Icon";

export function OrderSummary({
  subtotal,
  discount,
  total,
}: {
  subtotal: number;
  discount: number;
  total: number;
}) {
  function onPromo(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <aside className="w-full rounded-[20px] border border-line p-5 xl:max-w-[505px] xl:px-6 xl:py-5">
      <h2 className="text-xl font-bold text-black xl:text-2xl">Order Summary</h2>

      <div className="mt-4 flex flex-col gap-5 xl:mt-6">
        <div className="flex items-center justify-between text-base xl:text-xl">
          <span className="text-text-60">Subtotal</span>
          <span className="font-bold text-black">${subtotal}</span>
        </div>
        <div className="flex items-center justify-between text-base xl:text-xl">
          <span className="text-text-60">
            Discount (-{CART_DISCOUNT_PERCENT}%)
          </span>
          <span className="font-bold text-discount">-${discount}</span>
        </div>
        <div className="flex items-center justify-between text-base xl:text-xl">
          <span className="text-text-60">Delivery Fee</span>
          <span className="font-bold text-black">${DELIVERY_FEE}</span>
        </div>

        <hr className="border-line" />

        <div className="flex items-center justify-between">
          <span className="text-base text-black xl:text-xl">Total</span>
          <span className="text-xl font-bold text-black xl:text-2xl">${total}</span>
        </div>
      </div>

      <form onSubmit={onPromo} className="mt-5 flex gap-3 xl:mt-6">
        <TextField
          icon="/icons/tag.svg"
          placeholder="Add promo code"
          name="promo"
          className="h-12 min-w-0 flex-1"
        />
        <Button type="submit" className="h-12 shrink-0 px-8 text-sm xl:px-9">
          Apply
        </Button>
      </form>

      <Button
        fullWidth
        className="mt-4 h-[54px] gap-3 text-sm xl:mt-6 xl:h-[60px] xl:text-base"
      >
        Go to Checkout
        <Icon
          src="/icons/arrow-right.svg"
          size={20}
          className="-rotate-90 brightness-0 invert"
        />
      </Button>
    </aside>
  );
}
