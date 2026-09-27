import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Giỏ hàng | SHOP.CO",
  description: "Xem lại giỏ hàng và tiến hành thanh toán tại SHOP.CO.",
};

export default function CartPage() {
  return <CartView />;
}
