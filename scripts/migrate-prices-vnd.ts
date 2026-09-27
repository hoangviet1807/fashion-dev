/**
 * One-off: converts catalog prices from USD to VND (×1000, e.g. 145 → 145.000₫).
 * Run with `pnpm migrate:prices-vnd`. Only products priced below 10,000 are
 * touched, so re-running it is a no-op. Published and draft documents are both updated.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-09-27" });
const USD_TO_VND = 1000;

type PricedProduct = { _id: string; name?: string; price: number; compareAtPrice?: number };

async function main() {
  const products = await client.fetch<PricedProduct[]>(
    `*[_type == "product" && defined(price) && price < 10000] { _id, name, price, compareAtPrice }`,
    {},
    { perspective: "raw" },
  );

  if (products.length === 0) {
    console.log("✓ All product prices are already in VND");
    return;
  }

  const transaction = client.transaction();
  for (const product of products) {
    const set: Record<string, number> = { price: product.price * USD_TO_VND };
    if (typeof product.compareAtPrice === "number" && product.compareAtPrice < 10000) {
      set.compareAtPrice = product.compareAtPrice * USD_TO_VND;
    }
    transaction.patch(product._id, (patch) => patch.set(set));
    console.log(`  ${product.name ?? product._id}: ${product.price} → ${set.price}`);
  }
  await transaction.commit();
  console.log(`✓ Converted ${products.length} product documents to VND`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
