import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserOrder, requireAccountUser } from "@/lib/account/queries";
import { formatOrderDate } from "@/lib/orders/status";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { OrderDetails } from "@/components/order/OrderDetails";
import { Chevron } from "@/components/shop/ShopBreadcrumb";

export default async function AccountOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAccountUser(`/account/orders/${id}`);
  const data = await getUserOrder(user, id);
  if (!data) notFound();
  const { order, items, refunded } = data;

  return (
    <div>
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-base text-text-60 hover:text-black">
        <span className="rotate-180">
          <Chevron direction="right" size={16} />
        </span>
        Tất cả đơn hàng
      </Link>

      <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-black xl:text-2xl">Đơn hàng #{order.number}</h2>
          <p className="mt-1 text-sm text-text-60 xl:text-base">Đặt lúc {formatOrderDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <OrderDetails order={order} items={items} refunded={refunded} />
    </div>
  );
}
