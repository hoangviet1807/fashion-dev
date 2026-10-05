import { render } from "@react-email/render";
import { and, eq, gt, inArray, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { inventoryReservations, users } from "@/lib/db/schema";
import { LowStockEmail } from "@/lib/email/LowStockEmail";
import { sendEmail } from "@/lib/email/send";
import { siteUrl } from "@/lib/site-url";
import { client } from "@/sanity/lib/client";
import { LOW_STOCK_QUERY } from "@/sanity/lib/queries";
import { LOW_STOCK_THRESHOLD } from "./threshold";

export type LowStockVariant = { name: string; sku: string; color: string; size: string; stock: number };

export type LowStockProduct = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  variants: { sku: string; color: string; size: string; stock: number; reserved: number }[];
};

/** True when a sale takes a variant from above the threshold to at / below it. */
export function crossesThreshold(before: number, after: number) {
  return before > LOW_STOCK_THRESHOLD && after <= LOW_STOCK_THRESHOLD;
}

/** Uncached so the admin sees stock right after an order. */
const freshClient = client.withConfig({ useCdn: false });

/** Products with at least one variant at or below the threshold, plus units held by unpaid orders. */
export async function listLowStock(): Promise<LowStockProduct[]> {
  const products = await freshClient.fetch(
    LOW_STOCK_QUERY,
    { threshold: LOW_STOCK_THRESHOLD },
    { cache: "no-store" },
  );
  const skus = products.flatMap((product) => product.variants.map((variant) => variant.sku ?? ""));

  const reserved = new Map<string, number>();
  if (skus.length > 0) {
    const rows = await getDb()
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
    for (const row of rows) reserved.set(row.sku, row.quantity);
  }

  return products.map((product) => ({
    id: product._id,
    name: product.name ?? product.slug ?? product._id,
    slug: product.slug ?? "",
    image: product.image ?? null,
    variants: product.variants.map((variant) => ({
      sku: variant.sku ?? "",
      color: variant.color ?? "",
      size: variant.size ?? "",
      stock: variant.stock ?? 0,
      reserved: reserved.get(variant.sku ?? "") ?? 0,
    })),
  }));
}

/** `ADMIN_ALERT_EMAILS` (comma-separated), or every admin account when unset. */
async function alertRecipients(): Promise<string[]> {
  const configured = (process.env.ADMIN_ALERT_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  if (configured.length > 0) return configured;

  const admins = await getDb()
    .select({ email: users.email })
    .from(users)
    .where(and(eq(users.role, "admin"), isNotNull(users.email)));
  return admins.flatMap(({ email }) => (email ? [email] : []));
}

/** Emails staff once per variant each time it drops to the threshold; never throws. */
export async function notifyLowStock(variants: LowStockVariant[]) {
  try {
    const recipients = await alertRecipients();
    if (recipients.length === 0) {
      console.warn(
        `[inventory] Low stock (${variants.map((variant) => variant.sku).join(", ")}) but no ADMIN_ALERT_EMAILS or admin users to notify.`,
      );
      return;
    }
    const html = await render(
      LowStockEmail({
        variants,
        threshold: LOW_STOCK_THRESHOLD,
        inventoryUrl: `${siteUrl()}/admin/inventory`,
      }),
    );
    const subject =
      variants.length === 1
        ? `Sắp hết hàng: ${variants[0].name} (${variants[0].sku})`
        : `Sắp hết hàng: ${variants.length} biến thể`;
    await Promise.all(recipients.map((to) => sendEmail({ to, subject, html })));
  } catch (error) {
    console.error("[inventory] Failed to send low-stock alert", error);
  }
}
