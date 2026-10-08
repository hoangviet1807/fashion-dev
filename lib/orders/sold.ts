import { and, eq, inArray, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { CONFIRMED_ORDER_STATUSES } from "@/lib/orders/status";

/** Units of a product in confirmed orders; cached briefly since it only feeds a display counter. */
export function getSoldCount(slug: string): Promise<number> {
  return unstable_cache(
    async () => {
      const [row] = await getDb()
        .select({ sold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int` })
        .from(orderItems)
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(and(eq(orderItems.slug, slug), inArray(orders.status, CONFIRMED_ORDER_STATUSES)));
      return row?.sold ?? 0;
    },
    ["product-sold", slug],
    { revalidate: 600 },
  )();
}
