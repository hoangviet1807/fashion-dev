import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Thanh toán | SHOP.CO",
  description: "Nhập thông tin liên hệ, địa chỉ giao hàng và thanh toán để hoàn tất đơn hàng tại SHOP.CO.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const { payment } = await searchParams;
  return <CheckoutView paymentFailed={payment === "failed"} />;
}
