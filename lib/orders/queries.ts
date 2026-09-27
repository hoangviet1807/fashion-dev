import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getOrderWithItems(id: string) {
  if (!UUID.test(id)) return null;

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id))
    .orderBy(asc(orderItems.id));

  return { order, items };
}
