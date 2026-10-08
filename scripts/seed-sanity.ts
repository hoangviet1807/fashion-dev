/**
 * Seeds the sample catalog into the configured Sanity dataset.
 * Run with `pnpm seed` (uses your logged-in Sanity CLI token). Safe to re-run:
 * documents are matched by slug/name and updated in place.
 */
import { createReadStream } from "node:fs";
import { basename, join } from "node:path";
import { getCliClient } from "sanity/cli";
import {
  BRANDS,
  CATEGORIES,
  DEFAULT_DESCRIPTION,
  DEFAULT_DETAILS,
  DRESS_STYLES,
  NEW_ARRIVALS,
  PRODUCT_BRANDS,
  PRODUCT_FAQS,
  PRODUCTS,
  TESTIMONIALS,
  TOP_SELLING,
  VARIANT_SIZES,
} from "./seed-data";

const client = getCliClient({ apiVersion: "2026-09-27" });
const PUBLIC_DIR = join(process.cwd(), "public");

function stockFor(sku: string) {
  let hash = 0;
  for (const char of sku) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return 5 + (hash % 20);
}

const assetIds = new Map<string, string>();

async function uploadImage(relativePath: string) {
  const cached = assetIds.get(relativePath);
  if (cached) return cached;
  const asset = await client.assets.upload(
    "image",
    createReadStream(join(PUBLIC_DIR, relativePath)),
    { filename: basename(relativePath) },
  );
  assetIds.set(relativePath, asset._id);
  return asset._id;
}

function imageField(assetId: string, key?: string) {
  return {
    ...(key ? { _key: key } : {}),
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
  };
}

function ref(id: string, key?: string) {
  return { ...(key ? { _key: key } : {}), _type: "reference", _ref: id };
}

/** Finds a published document by `field == value`, then patches it or creates a new one. */
async function upsert(
  type: string,
  field: string,
  value: string,
  fields: Record<string, unknown>,
) {
  const existingId = await client.fetch<string | null>(
    `*[_type == $type && ${field} == $value && !(_id in path("drafts.**"))][0]._id`,
    { type, value },
  );
  if (existingId) {
    await client.patch(existingId).set(fields).commit();
    return existingId;
  }
  const created = await client.create({ _type: type, ...fields });
  return created._id;
}

async function seedTaxonomy(
  type: "category" | "dressStyle",
  items: { slug: string; title: string }[],
) {
  const ids = new Map<string, string>();
  for (const item of items) {
    const id = await upsert(type, "slug.current", item.slug, {
      title: item.title,
      slug: { _type: "slug", current: item.slug },
    });
    ids.set(item.slug, id);
  }
  console.log(`✓ ${items.length} ${type} documents`);
  return ids;
}

async function main() {
  const categoryIds = await seedTaxonomy("category", CATEGORIES);
  const styleIds = await seedTaxonomy("dressStyle", DRESS_STYLES);

  const brandIds = new Map<string, string>();
  for (const [index, brand] of BRANDS.entries()) {
    const id = await upsert("brand", "name", brand.name, {
      name: brand.name,
      slug: { _type: "slug", current: brand.slug },
      logo: imageField(await uploadImage(brand.logo)),
      order: index,
    });
    brandIds.set(brand.slug, id);
  }
  console.log(`✓ ${BRANDS.length} brands`);

  for (const [index, testimonial] of TESTIMONIALS.entries()) {
    await upsert("testimonial", "name", testimonial.name, { ...testimonial, order: index });
  }
  console.log(`✓ ${TESTIMONIALS.length} testimonials`);

  const productIds = new Map<string, string>();
  for (const [index, product] of PRODUCTS.entries()) {
    const imageIds = await Promise.all(product.images.map(uploadImage));
    const variants = product.colors.flatMap((color) =>
      VARIANT_SIZES.map((size) => {
        const sku = `${product.slug}-${color}-${size}`.toUpperCase();
        return { _key: sku, _type: "productVariant", sku, color, size, stock: stockFor(sku) };
      }),
    );

    const id = await upsert("product", "slug.current", product.slug, {
      name: product.name,
      slug: { _type: "slug", current: product.slug },
      images: imageIds.map((assetId, i) => imageField(assetId, `image-${i}`)),
      description: DEFAULT_DESCRIPTION,
      price: product.price,
      ...(product.compareAtPrice ? { compareAtPrice: product.compareAtPrice } : {}),
      ...(product.discount ? { discount: product.discount } : {}),
      category: ref(categoryIds.get(product.category)!),
      brand: ref(brandIds.get(PRODUCT_BRANDS[product.slug])!),
      dressStyles: product.styles.map((style) => ref(styleIds.get(style)!, style)),
      popularity: PRODUCTS.length - index,
      variants,
      details: DEFAULT_DETAILS,
    });
    productIds.set(product.slug, id);
  }

  for (const product of PRODUCTS) {
    if (!product.related) continue;
    await client
      .patch(productIds.get(product.slug)!)
      .set({
        relatedProducts: product.related.map((slug) => ref(productIds.get(slug)!, slug)),
      })
      .commit();
  }
  console.log(`✓ ${PRODUCTS.length} products`);

  await client.createIfNotExists({ _id: "siteSettings", _type: "siteSettings" });
  await client
    .patch("siteSettings")
    .set({
      newArrivals: NEW_ARRIVALS.map((slug) => ref(productIds.get(slug)!, slug)),
      topSelling: TOP_SELLING.map((slug) => ref(productIds.get(slug)!, slug)),
      productFaqs: PRODUCT_FAQS.map((faq, i) => ({ _key: `faq-${i}`, _type: "faq", ...faq })),
    })
    .commit();
  console.log("✓ site settings");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
