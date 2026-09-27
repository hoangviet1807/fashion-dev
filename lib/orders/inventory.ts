import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { getDb, type Transaction } from "@/lib/db";
import { inventoryReservations } from "@/lib/db/schema";
import { fetchVariants } from "@/lib/checkout/quote";
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

/**
 * Turns an order's reservations into real stock decrements in Sanity (published
 * and draft documents). Returns false if inventory could not be written.
 */
export async function commitReservations(orderId: string): Promise<boolean> {
  const writeClient = getWriteClient();
  if (!writeClient) {
    console.error(
      `[inventory] SANITY_API_WRITE_TOKEN is not set; stock for order ${orderId} was not decremented.`,
    );
    return false;
  }

  try {
    await getDb().transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(inventoryReservations)
        .where(
          and(
            eq(inventoryReservations.orderId, orderId),
            eq(inventoryReservations.status, "active"),
          ),
        )
        .for("update");
      if (rows.length === 0) return;

      const skus = rows.map((row) => row.sku);
      await lockSkus(tx, skus);

      const quantities = new Map<string, number>();
      for (const row of rows) {
        quantities.set(row.sku, (quantities.get(row.sku) ?? 0) + row.quantity);
      }

      const docs = await writeClient.fetch(INVENTORY_DOCS_QUERY, { skus });
      const mutation = writeClient.transaction();
      for (const doc of docs) {
        const dec: Record<string, number> = {};
        for (const variant of doc.variants) {
          const quantity = quantities.get(variant.sku);
          if (quantity) dec[`variants[_key=="${variant._key}"].stock`] = quantity;
        }
        if (Object.keys(dec).length > 0) mutation.patch(doc._id, (patch) => patch.dec(dec));
      }
      await mutation.commit({ visibility: "async" });

      await tx
        .update(inventoryReservations)
        .set({ status: "committed" })
        .where(
          inArray(
            inventoryReservations.id,
            rows.map((row) => row.id),
          ),
        );
    });
    return true;
  } catch (error) {
    console.error(`[inventory] Failed to commit stock for order ${orderId}`, error);
    return false;
  }
}
