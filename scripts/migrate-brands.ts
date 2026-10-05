/**
 * One-off for the brand filter (`/shop?brand=...`): gives every brand a slug and
 * assigns the sample brand from `seed-data.ts` to seeded products that have none.
 * Run with `pnpm migrate:brands`. Existing slugs and brand choices are kept, so
 * re-running it is a no-op. Published and draft documents are both updated.
 */
import { getCliClient } from "sanity/cli";
import { BRANDS, PRODUCT_BRANDS } from "./seed-data";

const client = getCliClient({ apiVersion: "2026-09-27" });

type BrandDoc = { _id: string; name?: string; slug?: string };
type ProductDoc = { _id: string; slug?: string };

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function publishedId(id: string) {
  return id.replace(/^drafts\./, "");
}

async function main() {
  const brands = await client.fetch<BrandDoc[]>(
    `*[_type == "brand"] { _id, name, "slug": slug.current }`,
    {},
    { perspective: "raw" },
  );

  const transaction = client.transaction();
  const brandIdBySlug = new Map<string, string>();
  let changes = 0;

  for (const brand of brands) {
    const slug = brand.slug ?? (brand.name ? slugify(brand.name) : undefined);
    if (!slug) continue;
    brandIdBySlug.set(slug, publishedId(brand._id));
    if (!brand.slug) {
      transaction.patch(brand._id, (patch) => patch.set({ slug: { _type: "slug", current: slug } }));
      console.log(`  brand ${brand.name}: slug → ${slug}`);
      changes++;
    }
  }

  const missing = BRANDS.filter((brand) => !brandIdBySlug.has(brand.slug));
  if (missing.length > 0) {
    console.warn(`! Brands not found in the dataset: ${missing.map((b) => b.name).join(", ")}`);
  }

  const products = await client.fetch<ProductDoc[]>(
    `*[_type == "product" && !defined(brand) && slug.current in $slugs] { _id, "slug": slug.current }`,
    { slugs: Object.keys(PRODUCT_BRANDS) },
    { perspective: "raw" },
  );

  for (const product of products) {
    const brandSlug = product.slug ? PRODUCT_BRANDS[product.slug] : undefined;
    const brandId = brandSlug ? brandIdBySlug.get(brandSlug) : undefined;
    if (!brandId) continue;
    transaction.patch(product._id, (patch) =>
      patch.set({ brand: { _type: "reference", _ref: brandId } }),
    );
    console.log(`  product ${product.slug}: brand → ${brandSlug}`);
    changes++;
  }

  if (changes === 0) {
    console.log("✓ Brands are already migrated");
    return;
  }
  await transaction.commit();
  console.log(`✓ Updated ${changes} documents`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
