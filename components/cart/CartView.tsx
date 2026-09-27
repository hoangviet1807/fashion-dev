"use client";

import { useMemo } from "react";
import { cartDiscount, cartSubtotal, cartTotal } from "@/lib/cart-data";
import { useCartHydrated, useCartStore } from "@/lib/cart/store";
import { Container } from "@/components/layout/Container";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";
import { Button } from "@/components/ui/Button";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { OrderSummary } from "@/components/cart/OrderSummary";

export function CartView() {
  const hydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const remove = useCartStore((state) => state.remove);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const discount = useMemo(() => cartDiscount(subtotal), [subtotal]);
  const total = useMemo(
    () => cartTotal(subtotal, discount),
    [subtotal, discount],
  );

  return (
    <div>
      <Container className="pb-20 xl:pb-[80px]">
        <hr className="border-line" />
        <div className="pt-5 xl:pt-6">
          <ShopBreadcrumb current="Giỏ hàng" />
        </div>

        <h1 className="mt-2 font-display text-[32px] leading-none uppercase text-black xl:mt-6 xl:text-[40px]">
          Giỏ hàng của bạn
        </h1>

        {!hydrated ? null : items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="text-base text-text-60">Giỏ hàng của bạn đang trống.</p>
            <Button href="/shop" className="px-10">
              Mua sắm
            </Button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-stretch gap-5 xl:mt-6 xl:flex-row xl:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-[20px] border border-line px-3.5 py-3.5 xl:gap-6 xl:px-6 xl:py-5">
              {items.map((item, index) => (
                <div key={item.sku}>
                  {index > 0 ? <hr className="mb-4 border-line xl:mb-6" /> : null}
                  <CartLineItem
                    item={item}
                    onQty={updateQty}
                    onRemove={remove}
                  />
                </div>
              ))}
            </div>

            <OrderSummary
              subtotal={subtotal}
              discount={discount}
              total={total}
            />
          </div>
        )}
      </Container>
    </div>
  );
}
