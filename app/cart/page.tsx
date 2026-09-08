import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Cart | SHOP.CO",
  description: "Review your cart and proceed to checkout at SHOP.CO.",
};

export default function CartPage() {
  return <CartView />;
}
