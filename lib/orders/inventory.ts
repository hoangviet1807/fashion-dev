import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { getDb, type Transaction } from "@/lib/db";
import { inventoryReservations } from "@/lib/db/schema";
import { fetchVariants } from "@/lib/checkout/quote";
import { crossesThreshold, notifyLowStock, type LowStockVariant } from "@/lib/inventory/low-stock";
import { INVENTORY_DOCS_QUERY } from "@/sanity/lib/queries";
import { getWriteClient } from "@/sanity/lib/write-client";

export type Shortage = { sku: string; name: string; available: number };

export class InsufficientStockError extends Error {
  constructor(public shortages: Shortage[]) {
    super("Insufficient stock");
  }
}

/** Serialises stock changes per SKU for the rest of the transaction. */
async function lockSkus(tx: Transaction, skus: string[]) {
  for (const sku of [...new Set(skus)].sort()) {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${sku}))`);
  }
}

async function activeReservations(tx: Transaction, skus: string[]) {
  const rows = await tx
    .select({
      sku: inventoryReservations.sku,
      quantity: sql<number>`sum(${inventoryReservations.quantity})::int`,
    })
    .from(inventoryReservations)
    .where(
      and(
        inArray(inventoryReservations.sku, skus),
        eq(inventoryReservations.status, "active"),
        gt(inventoryReservations.expiresAt, sql`now()`),
      ),
    )
    .groupBy(inventoryReservations.sku);
  return new Map(rows.map((row) => [row.sku, row.quantity]));
}

/**
 * Holds stock for an order. Available = Sanity stock − unexpired active
 * reservations. Throws InsufficientStockError when any line cannot be held.
 */
export async function reserveStock(
  tx: Transaction,
  orderId: string,
  lines: { sku: string; name: string; quantity: number }[],
  expiresAt: Date,
) {
  const skus = lines.map((line) => line.sku);
  await lockSkus(tx, skus);

  const [variants, reserved] = await Promise.all([
    fetchVariants(skus),
    activeReservations(tx, skus),
  ]);

  const shortages: Shortage[] = [];
  for (const line of lines) {
    const stock = variants.get(line.sku)?.variant.stock ?? 0;
    const available = Math.max(0, stock - (reserved.get(line.sku) ?? 0));
    if (available < line.quantity) {
      shortages.push({ sku: line.sku, name: line.name, available });
    }
  }
  if (shortages.length > 0) throw new InsufficientStockError(shortages);

  await tx.insert(inventoryReservations).values(
    lines.map((line) => ({
      orderId,
      sku: line.sku,
      quantity: line.quantity,
      expiresAt,
    })),
  );
}

export async function releaseReservations(tx: Transaction, orderId: string) {
  await tx
    .update(inventoryReservations)
    .set({ status: "released" })
    .where(
      and(
        eq(inventoryReservations.orderId, orderId),
        eq(inventoryReservations.status, "active"),
      ),
    );
}

type ReservationStatus = (typeof inventoryReservations.$inferSelect)["status"];

/**
 * Applies an order's reservations in `from` status to Sanity stock (published
 * and draft documents) and moves them to `to`. Returns the variants that fell
 * to the low-stock threshold, or null if inventory could not be written.
 */
async function moveStock(
  orderId: string,
  { from, to, direction }: { from: ReservationStatus; to: ReservationStatus; direction: "dec" | "inc" },
): Promise<LowStockVariant[] | null> {
  const writeClient = getWriteClient();
  if (!writeClient) {
    console.error(
      `[inventory] SANITY_API_WRITE_TOKEN is not set; stock for order ${orderId} was not ${direction === "dec" ? "decremented" : "restored"}.`,
    );
    return null;
  }

  try {
    return await getDb().transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(inventoryReservations)
        .where(
          and(eq(inventoryReservations.orderId, orderId), eq(inventoryReservations.status, from)),
        )
        .for("update");
      if (rows.length === 0) return [];

      const skus = rows.map((row) => row.sku);
      await lockSkus(tx, skus);

      const quantities = new Map<string, number>();
      for (const row of rows) {
        quantities.set(row.sku, (quantities.get(row.sku) ?? 0) + row.quantity);
      }

      const docs = await writeClient.fetch(INVENTORY_DOCS_QUERY, { skus });
      const mutation = writeClient.transaction();
      const crossed: LowStockVariant[] = [];
      for (const doc of docs) {
        const change: Record<string, number> = {};
        for (const variant of doc.variants) {
          const quantity = quantities.get(variant.sku);
          if (!quantity) continue;
          change[`variants[_key=="${variant._key}"].stock`] = quantity;

          const before = variant.stock ?? 0;
          const after = before - quantity;
          if (direction === "dec" && !doc._id.startsWith("drafts.") && crossesThreshold(before, after)) {
            crossed.push({
              name: doc.name ?? variant.sku,
              sku: variant.sku,
              color: variant.color ?? "",
              size: variant.size ?? "",
              stock: Math.max(0, after),
            });
          }
        }
        if (Object.keys(change).length > 0) {
          mutation.patch(doc._id, (patch) => patch[direction](change));
        }
      }
      await mutation.commit({ visibility: "async" });

      await tx
        .update(inventoryReservations)
        .set({ status: to })
        .where(
          inArray(
            inventoryReservations.id,
            rows.map((row) => row.id),
          ),
        );
      return crossed;
    });
  } catch (error) {
    console.error(
      `[inventory] Failed to ${direction === "dec" ? "commit" : "restore"} stock for order ${orderId}`,
      error,
    );
    return null;
  }
}

/**
 * Turns an order's reservations into real stock decrements in Sanity and emails
 * staff about variants that just ran low. Returns false if inventory could not
 * be written.
 */
export async function commitReservations(orderId: string): Promise<boolean> {
  const crossed = await moveStock(orderId, { from: "active", to: "committed", direction: "dec" });
  if (crossed === null) return false;
  if (crossed.length > 0) await notifyLowStock(crossed);
  return true;
}

/** Puts a cancelled order's sold units back into Sanity stock (once). */
export async function restockOrder(orderId: string): Promise<boolean> {
  const result = await moveStock(orderId, { from: "committed", to: "released", direction: "inc" });
  return result !== null;
}
