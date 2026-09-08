"use client";

import { useMemo, useState } from "react";
import {
  cartDiscount,
  cartSubtotal,
  cartTotal,
  initialCartItems,
  type CartLine,
} from "@/lib/cart-data";
import { Container } from "@/components/layout/Container";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";
import { Button } from "@/components/ui/Button";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { OrderSummary } from "@/components/cart/OrderSummary";

export function CartView() {
  const [items, setItems] = useState<CartLine[]>(initialCartItems);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const discount = useMemo(() => cartDiscount(subtotal), [subtotal]);
  const total = useMemo(
    () => cartTotal(subtotal, discount),
    [subtotal, discount],
  );

  function setQty(id: string, quantity: number) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }

  function remove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div>
      <Container className="pb-20 xl:pb-[80px]">
        <hr className="border-line" />
        <div className="pt-5 xl:pt-6">
          <ShopBreadcrumb current="Cart" />
        </div>

        <h1 className="mt-2 font-display text-[32px] leading-none uppercase text-black xl:mt-6 xl:text-[40px]">
          Your cart
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p className="text-base text-text-60">Your shopping cart is empty.</p>
            <Button href="/shop" className="px-10">
              Shop
            </Button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-stretch gap-5 xl:mt-6 xl:flex-row xl:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-[20px] border border-line px-3.5 py-3.5 xl:gap-6 xl:px-6 xl:py-5">
              {items.map((item, index) => (
                <div key={item.id}>
                  {index > 0 ? <hr className="mb-4 border-line xl:mb-6" /> : null}
                  <CartLineItem
                    item={item}
                    onQty={setQty}
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
