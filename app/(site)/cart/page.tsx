import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { getFreeShippingThreshold } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Giỏ hàng | SHOP.CO",
  description: "Xem lại giỏ hàng và tiến hành thanh toán tại SHOP.CO.",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  return <CartView freeShippingFrom={await getFreeShippingThreshold()} />;
}
