import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orderItems, orders, refunds } from "@/lib/db/schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isOrderId(id: string) {
  return UUID.test(id);
}

export async function getOrderWithItems(id: string) {
  if (!isOrderId(id)) return null;

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return null;

  const [items, [{ refunded }]] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)).orderBy(asc(orderItems.id)),
    db
      .select({ refunded: sql<number>`coalesce(sum(${refunds.amount}), 0)::int` })
      .from(refunds)
      .where(eq(refunds.orderId, id)),
  ]);

  return { order, items, refunded };
}
