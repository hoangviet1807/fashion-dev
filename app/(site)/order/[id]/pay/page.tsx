import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { syncPayosPayment } from "@/lib/orders/payments";
import { getOrderWithItems } from "@/lib/orders/queries";
import { bankName } from "@/lib/payments/vietqr-banks";
import { BankTransferView } from "@/components/order/BankTransferView";

export const metadata: Metadata = {
  title: "Thanh toán đơn hàng | SHOP.CO",
  robots: { index: false, follow: false },
};

export default async function OrderPayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getOrderWithItems(id);
  if (!data) notFound();
  const { order, items } = data;

  if (order.paymentMethod !== "payos") redirect(`/order/${order.id}/success`);

  const result = await syncPayosPayment(order.id);
  if (!result) notFound();
  if (result.state === "paid") redirect(`/order/${order.id}/success`);

  const { payment } = result;
  const transfer = payment.transfer;
  const qrSvg =
    result.state === "pending" && transfer
      ? await QRCode.toString(transfer.qrCode, { type: "svg", margin: 0, errorCorrectionLevel: "M" })
      : null;

  return (
    <BankTransferView
      order={order}
      items={items}
      initialState={qrSvg ? "pending" : "expired"}
      amount={payment.amount}
      expiresAt={payment.expiresAt?.toISOString() ?? null}
      transfer={transfer}
      bank={transfer ? bankName(transfer.bin) : null}
      qrSvg={qrSvg}
    />
  );
}
