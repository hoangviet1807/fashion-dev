import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountCard } from "@/components/account/AccountFields";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { OrderActions } from "@/components/admin/OrderActions";
import { OrderDetails } from "@/components/order/OrderDetails";
import { Chevron } from "@/components/shop/ShopBreadcrumb";
import { requirePermission } from "@/lib/admin/auth";
import { ORDER_EVENT_LABELS, getAdminOrder } from "@/lib/admin/orders";
import { can } from "@/lib/admin/roles";
import { PAYMENT_METHODS } from "@/lib/checkout/schema";
import type { Payment } from "@/lib/db/schema";
import { formatPrice } from "@/lib/money";
import { CANCELLABLE, DELIVERABLE, SHIPPABLE, isRefundable } from "@/lib/orders/fulfillment";
import { formatOrderDate } from "@/lib/orders/status";

const PAYMENT_STATUS_LABELS: Record<Payment["status"], string> = {
  pending: "Đang chờ",
  succeeded: "Thành công",
  failed: "Thất bại / huỷ",
};

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePermission("orders:view", `/admin/orders/${id}`);
  const data = await getAdminOrder(id);
  if (!data) notFound();
  const { order, items, refunded, payments, events } = data;

  const canFulfil = can(user.role, "orders:fulfil");
  const refundable =
    can(user.role, "orders:refund") && isRefundable(order) ? Math.max(0, order.total - refunded) : 0;

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-base text-text-60 hover:text-black">
        <span className="rotate-180">
          <Chevron direction="right" size={16} />
        </span>
        Tất cả đơn hàng
      </Link>

      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-black xl:text-2xl">Đơn hàng #{order.number}</h2>
          <p className="mt-1 text-sm text-text-60 xl:text-base">
            Đặt lúc {formatOrderDate(order.createdAt)}
            {order.userId ? " · Khách có tài khoản" : " · Khách vãng lai"}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-5 xl:mt-6">
        <OrderActions
          orderNumber={order.number}
          status={order.status}
          paymentMethod={order.paymentMethod}
          currency={order.currency}
          total={order.total}
          carrier={order.carrier}
          trackingNumber={order.trackingNumber}
          canShip={canFulfil && SHIPPABLE.includes(order.status)}
          canDeliver={canFulfil && DELIVERABLE.includes(order.status)}
          canCancel={can(user.role, "orders:cancel") && CANCELLABLE.includes(order.status)}
          refundable={refundable}
        />
      </div>

      <div className="mt-5 flex flex-col items-stretch gap-5 xl:mt-6 xl:flex-row xl:items-start">
        <AccountCard title="Thanh toán">
          {payments.length === 0 ? (
            <p className="text-base text-text-60">
              {order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)." : "Chưa có giao dịch."}
              {order.paidAt ? ` Đã thu tiền lúc ${formatOrderDate(order.paidAt)}.` : ""}
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {payments.map((payment) => (
                <li key={payment.id} className="flex items-start justify-between gap-4 text-base">
                  <div className="min-w-0">
                    <p className="font-medium text-black">
                      {PAYMENT_METHODS[payment.provider].label} · {PAYMENT_STATUS_LABELS[payment.status]}
                    </p>
                    <p className="mt-0.5 break-all text-sm text-text-60">
                      Mã tham chiếu {payment.reference}
                      {payment.providerTransactionId ? ` · Mã giao dịch ${payment.providerTransactionId}` : ""}
                    </p>
                    <p className="mt-0.5 text-sm text-text-60">{formatOrderDate(payment.createdAt)}</p>
                  </div>
                  <span className="shrink-0 font-bold text-black">
                    {formatPrice(payment.amount, payment.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {refunded > 0 ? (
            <p className="text-base text-discount">
              Đã hoàn {formatPrice(refunded, order.currency)} / {formatPrice(order.total, order.currency)}
            </p>
          ) : null}
        </AccountCard>

        <AccountCard title="Lịch sử">
          <ol className="flex flex-col gap-4">
            {events.map((event) => (
              <li key={event.id} className="text-base">
                <p className="font-medium text-black">{ORDER_EVENT_LABELS[event.type]}</p>
                {event.note ? <p className="mt-0.5 break-words text-sm text-text-60">{event.note}</p> : null}
                <p className="mt-0.5 text-sm text-text-60">
                  {formatOrderDate(event.createdAt)} · {event.actorName ?? event.actorEmail ?? "Dòng lệnh / hệ thống"}
                </p>
              </li>
            ))}
            {order.paidAt && order.paymentMethod !== "cod" ? (
              <li className="text-base">
                <p className="font-medium text-black">Đã thanh toán</p>
                <p className="mt-0.5 text-sm text-text-60">{formatOrderDate(order.paidAt)}</p>
              </li>
            ) : null}
            <li className="text-base">
              <p className="font-medium text-black">Đặt hàng</p>
              <p className="mt-0.5 text-sm text-text-60">{formatOrderDate(order.createdAt)}</p>
            </li>
          </ol>
        </AccountCard>
      </div>

      <OrderDetails order={order} items={items} refunded={refunded} />
    </div>
  );
}
