import Form from "next/form";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Chevron } from "@/components/shop/ShopBreadcrumb";
import { TextField } from "@/components/ui/TextField";
import { recipientName } from "@/lib/address/format";
import { requirePermission } from "@/lib/admin/auth";
import {
  ADMIN_PAGE_SIZE,
  ORDER_FILTERS,
  listAdminOrders,
  parseOrderFilter,
  type OrderFilter,
} from "@/lib/admin/orders";
import { PAYMENT_METHODS } from "@/lib/checkout/schema";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUS_LABELS, formatOrderDate } from "@/lib/orders/status";

const PILL =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[62px] px-4 text-sm font-medium transition-colors";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function filterHref(filter: OrderFilter, q: string) {
  const params = new URLSearchParams();
  if (filter !== "todo") params.set("status", filter);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePermission("orders:view", "/admin/orders");
  const params = await searchParams;
  const filter = parseOrderFilter(first(params.status));
  const q = (first(params.q) ?? "").trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(first(params.page) ?? "", 10) || 1);

  const { items, total, counts } = await listAdminOrders({ filter, q, page });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <nav aria-label="Lọc đơn hàng" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 xl:mx-0 xl:px-0">
          {(Object.keys(ORDER_FILTERS) as OrderFilter[]).map((key) => {
            const active = key === filter;
            return (
              <Link
                key={key}
                href={filterHref(key, q)}
                aria-current={active ? "page" : undefined}
                className={`${PILL} ${active ? "bg-black text-white" : "bg-muted text-black hover:bg-black/[0.07]"}`}
              >
                {ORDER_FILTERS[key].label}
                <span className={active ? "text-white/60" : "text-text-60"}>{counts[key]}</span>
              </Link>
            );
          })}
        </nav>

        <Form action="/admin/orders" className="w-full xl:max-w-[360px]">
          {filter !== "todo" ? <input type="hidden" name="status" value={filter} /> : null}
          <TextField
            icon="/icons/search.svg"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Số đơn, email, SĐT, tên khách…"
          />
        </Form>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 flex flex-col items-center gap-2 rounded-[20px] border border-line px-5 py-16 text-center">
          <p className="text-base text-text-60">
            {q ? `Không có đơn hàng nào khớp “${q}”.` : "Không có đơn hàng nào trong mục này."}
          </p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {items.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/orders/${order.id}`}
                aria-label={`Đơn hàng #${order.number}, ${ORDER_STATUS_LABELS[order.status]}`}
                className="flex items-center gap-4 rounded-[20px] border border-line p-5 transition-colors hover:bg-black/[0.02] xl:px-6"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-6">
                  <div className="min-w-0 md:flex-1">
                    <p className="text-base font-bold text-black xl:text-xl">Đơn hàng #{order.number}</p>
                    <p className="mt-1 truncate text-sm text-text-60">
                      {recipientName(order.shippingAddress)} · {order.email}
                    </p>
                    <p className="mt-0.5 text-sm text-text-60">
                      {formatOrderDate(order.createdAt)} · {order.itemCount} sản phẩm ·{" "}
                      {PAYMENT_METHODS[order.paymentMethod].label}
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
      )}

      <AdminPagination page={Math.min(page, totalPages)} totalPages={totalPages} />
    </div>
  );
}
