import { and, asc, count, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  orderEvents,
  orderItems,
  orders,
  payments,
  refunds,
  users,
  type Order,
} from "@/lib/db/schema";
import { getOrderWithItems } from "@/lib/orders/queries";

export const ADMIN_PAGE_SIZE = 20;

export const ORDER_FILTERS = {
  todo: { label: "Cần xử lý", statuses: ["paid", "awaiting_fulfillment"] },
  shipped: { label: "Đang giao", statuses: ["shipped"] },
  fulfilled: { label: "Hoàn tất", statuses: ["fulfilled"] },
  pending: { label: "Chờ thanh toán", statuses: ["pending_payment"] },
  closed: { label: "Đã huỷ / thất bại", statuses: ["cancelled", "payment_failed"] },
  all: { label: "Tất cả", statuses: null },
} as const satisfies Record<string, { label: string; statuses: Order["status"][] | null }>;

export type OrderFilter = keyof typeof ORDER_FILTERS;

export function parseOrderFilter(value: string | undefined): OrderFilter {
  return value && value in ORDER_FILTERS ? (value as OrderFilter) : "todo";
}

export const ORDER_EVENT_LABELS: Record<(typeof orderEvents.$inferSelect)["type"], string> = {
  shipped: "Đã giao cho đơn vị vận chuyển",
  tracking_updated: "Cập nhật mã vận đơn",
  delivered: "Đã giao thành công",
  cancelled: "Đã huỷ đơn",
  refunded: "Đã hoàn tiền",
};

/** `#100001` / `100001` matches the order number; anything else searches email, phone and name. */
function searchCondition(q: string): SQL | undefined {
  const term = q.trim();
  if (!term) return undefined;
  const number = /^#?(\d{1,9})$/.exec(term);
  if (number) return eq(orders.number, Number(number[1]));
  const like = `%${term.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
  return or(
    ilike(orders.email, like),
    ilike(orders.phone, like),
    ilike(
      sql`concat_ws(' ', ${orders.shippingAddress}->>'lastName', ${orders.shippingAddress}->>'firstName')`,
      like,
    ),
  );
}

function statusCondition(filter: OrderFilter): SQL | undefined {
  const statuses = ORDER_FILTERS[filter].statuses;
  return statuses ? inArray(orders.status, [...statuses]) : undefined;
}

export async function listAdminOrders({
  filter,
  q,
  page,
}: {
  filter: OrderFilter;
  q: string;
  page: number;
}) {
  const db = getDb();
  const search = searchCondition(q);
  const where = and(statusCondition(filter), search);

  const [items, [{ total }], statusCounts] = await Promise.all([
    db
      .select({
        id: orders.id,
        number: orders.number,
        status: orders.status,
        email: orders.email,
        shippingAddress: orders.shippingAddress,
        paymentMethod: orders.paymentMethod,
        currency: orders.currency,
        total: orders.total,
        createdAt: orders.createdAt,
        itemCount: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .where(where)
      .groupBy(orders.id)
      .orderBy(filter === "todo" ? asc(orders.createdAt) : desc(orders.createdAt))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE),
    db.select({ total: count() }).from(orders).where(where),
    db
      .select({ status: orders.status, total: count() })
      .from(orders)
      .where(search)
      .groupBy(orders.status),
  ]);

  const byStatus = new Map(statusCounts.map((row) => [row.status, row.total]));
  const counts = Object.fromEntries(
    Object.entries(ORDER_FILTERS).map(([key, { statuses }]) => [
      key,
      statuses
        ? statuses.reduce((sum, status) => sum + (byStatus.get(status) ?? 0), 0)
        : statusCounts.reduce((sum, row) => sum + row.total, 0),
    ]),
  ) as Record<OrderFilter, number>;

  return { items, total, counts };
}

export async function getAdminOrder(id: string) {
  const data = await getOrderWithItems(id);
  if (!data) return null;

  const db = getDb();
  const [paymentRows, refundRows, eventRows] = await Promise.all([
    db.select().from(payments).where(eq(payments.orderId, id)).orderBy(asc(payments.createdAt)),
    db.select().from(refunds).where(eq(refunds.orderId, id)).orderBy(asc(refunds.createdAt)),
    db
      .select({
        id: orderEvents.id,
        type: orderEvents.type,
        note: orderEvents.note,
        createdAt: orderEvents.createdAt,
        actorName: users.name,
        actorEmail: users.email,
      })
      .from(orderEvents)
      .leftJoin(users, eq(users.id, orderEvents.actorId))
      .where(eq(orderEvents.orderId, id))
      .orderBy(desc(orderEvents.createdAt), desc(orderEvents.id)),
  ]);

  return { ...data, payments: paymentRows, refunds: refundRows, events: eventRows };
}
