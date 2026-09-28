import Link from "next/link";
import { listUserOrders, requireAccountUser } from "@/lib/account/queries";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS_LABELS, formatOrderDate } from "@/lib/orders/status";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { Button } from "@/components/ui/Button";
import { Chevron } from "@/components/shop/ShopBreadcrumb";

export default async function AccountOrdersPage() {
  const user = await requireAccountUser("/account/orders");
  const orders = await listUserOrders(user);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[20px] border border-line px-5 py-16 text-center">
        <p className="text-base text-text-60">Bạn chưa có đơn hàng nào.</p>
        <Button href="/shop" className="px-10">
          Mua sắm
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3 xl:gap-4">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/account/orders/${order.id}`}
            aria-label={`Đơn hàng #${order.number}, ${ORDER_STATUS_LABELS[order.status]}`}
            className="flex items-center gap-4 rounded-[20px] border border-line p-5 transition-colors hover:bg-black/[0.02] xl:px-6"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-6">
              <div className="min-w-0 md:flex-1">
                <p className="text-base font-bold text-black xl:text-xl">Đơn hàng #{order.number}</p>
                <p className="mt-1 text-sm text-text-60">
                  {formatOrderDate(order.createdAt)} · {order.itemCount} sản phẩm
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
              <span className="text-base font-bold text-black md:w-[140px] md:text-right xl:text-xl">
                {formatPrice(order.total, order.currency)}
              </span>
            </div>
            <Chevron direction="right" size={16} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
