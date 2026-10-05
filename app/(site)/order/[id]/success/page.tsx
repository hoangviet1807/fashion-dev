import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getOrderWithItems } from "@/lib/orders/queries";
import { OrderSuccessView } from "@/components/order/OrderSuccessView";

export const metadata: Metadata = {
  title: "Đơn hàng | SHOP.CO",
  robots: { index: false, follow: false },
};

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrderWithItems(id);
  if (!data) notFound();
  if (data.order.paymentMethod === "payos" && data.order.status === "pending_payment") {
    redirect(`/order/${id}/pay`);
  }

  return <OrderSuccessView order={data.order} items={data.items} />;
}
