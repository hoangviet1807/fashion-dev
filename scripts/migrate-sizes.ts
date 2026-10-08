/**
 * One-off: renames variant sizes to short codes (Small → S, X-Large → XL, XX-Large → 2XL…).
 * Run with `pnpm migrate:sizes`. SKUs are left untouched. Only variants still using an
 * old name are patched, so re-running it is a no-op. Published and draft documents are
 * both updated. Order history in Postgres is handled by drizzle migration 0010.
 */
import { getCliClient } from "sanity/cli";
import { LEGACY_SIZES } from "../lib/catalog";

const client = getCliClient({ apiVersion: "2026-09-27" });

type ProductDoc = {
  _id: string;
  name?: string;
  variants?: { _key: string; size?: string }[];
};

async function main() {
  const products = await client.fetch<ProductDoc[]>(
    `*[_type == "product" && count(variants[size in $legacy]) > 0] { _id, name, variants[] { _key, size } }`,
    { legacy: Object.keys(LEGACY_SIZES) },
    { perspective: "raw" },
  );

  if (products.length === 0) {
    console.log("✓ All variant sizes already use short codes");
    return;
  }

  const transaction = client.transaction();
  let variants = 0;
  for (const product of products) {
    const set: Record<string, string> = {};
    for (const variant of product.variants ?? []) {
      const next = variant.size ? LEGACY_SIZES[variant.size] : undefined;
      if (!next) continue;
      set[`variants[_key=="${variant._key}"].size`] = next;
      variants++;
    }
    transaction.patch(product._id, (patch) => patch.set(set));
    console.log(`  ${product.name ?? product._id}: ${Object.keys(set).length} variants`);
  }
  await transaction.commit();
  console.log(`✓ Renamed sizes on ${variants} variants in ${products.length} product documents`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
