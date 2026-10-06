import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import {
  HOME_COLLECTIONS_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  PRODUCT_SLUGS_QUERY,
  PRODUCTS_BY_SLUGS_QUERY,
  RELATED_PRODUCTS_QUERY,
  SHOP_PRODUCTS_QUERY,
} from "@/sanity/lib/queries";
import type { SHOP_PRODUCTS_QUERY_RESULT } from "@/sanity.types";
import { discountPercent, sortSizes } from "@/lib/product";
import { getProductReviews, type ProductReviews } from "@/lib/reviews/server";
import { searchTerms } from "@/lib/search";
import type {
  Product,
  ProductFilters,
  ProductListing,
  ProductSummary,
} from "@/lib/types/product";

const DEFAULT_PAGE_SIZE = 9;

type ProductCard = SHOP_PRODUCTS_QUERY_RESULT["items"][number];

function toSummary(card: ProductCard): ProductSummary {
  const summary = {
    id: card._id,
    slug: card.slug,
    name: card.name,
    image: card.image ?? "",
    price: card.price,
    compareAtPrice: card.compareAtPrice ?? undefined,
    discount: card.discount ?? undefined,
    rating: card.rating ?? 0,
    category: card.category,
    styles: card.styles ?? [],
    colors: card.colors,
    sizes: sortSizes(card.sizes),
  };
  return { ...summary, discount: discountPercent(summary) };
}

function toSummaries(cards: ProductCard[] | null | undefined) {
  return (cards ?? []).map(toSummary);
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<ProductListing> {
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const start = (Math.max(1, filters.page ?? 1) - 1) * pageSize;
  const { terms, altTerms } = searchTerms(filters.q);

  const { data } = await sanityFetch({
    query: SHOP_PRODUCTS_QUERY,
    params: {
      terms,
      altTerms,
      sale: filters.sale ?? false,
      brand: filters.brand ?? null,
      category: filters.category ?? null,
      style: filters.style ?? null,
      color: filters.color ?? null,
      size: filters.size ?? null,
      minPrice: filters.price?.[0] ?? null,
      maxPrice: filters.price?.[1] ?? null,
      sort: filters.sort ?? "most-popular",
      start,
      end: start + pageSize,
    },
    tags: ["product", "category", "dressStyle", "brand"],
    stega: false,
  });

  return { items: toSummaries(data.items), total: data.total };
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  const { data } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
    tags: [`product:${slug}`, "category", "siteSettings"],
    stega: false,
  });
  if (!data) return undefined;

  const summary = toSummary(data);
  const images = data.images.filter((image): image is string => Boolean(image));
  const reviews = await loadReviews(slug);

  return {
    ...summary,
    rating: reviews ? reviews.summary.average : summary.rating,
    description: data.description ?? "",
    categoryTitle: data.categoryTitle ?? data.category,
    brand: data.brand ?? undefined,
    images: images.length > 0 ? images : [summary.image],
    reviewCount: reviews ? reviews.summary.count : (data.reviewCount ?? 0),
    variants: data.variants,
    details: {
      material: data.details?.material ?? [],
      fit: data.details?.fit ?? [],
      featuresIntro: data.details?.featuresIntro ?? "",
      features: data.details?.features ?? [],
    },
    faqs: data.faqs ?? [],
    reviews: reviews?.page ?? { items: [], total: 0 },
  };
}

/** Reviews live in Postgres; the page still renders (with Sanity's rating) if it is unreachable. */
async function loadReviews(slug: string): Promise<ProductReviews | null> {
  try {
    return await getProductReviews(slug);
  } catch (error) {
    console.error(`[reviews] Failed to load reviews for ${slug}`, error);
    return null;
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  const { data } = await sanityFetch({
    query: PRODUCT_SLUGS_QUERY,
    perspective: "published",
    tags: ["product"],
    stega: false,
  });
  return data;
}

export async function getRelated(product: Product): Promise<ProductSummary[]> {
  const { data } = await sanityFetch({
    query: RELATED_PRODUCTS_QUERY,
    params: { slug: product.slug },
    tags: ["product"],
    stega: false,
  });
  return toSummaries(data);
}

/** Summaries in the order of `slugs`; unknown slugs are skipped. */
export async function getProductsBySlugs(slugs: string[]): Promise<ProductSummary[]> {
  if (slugs.length === 0) return [];
  const cards = await client.fetch(PRODUCTS_BY_SLUGS_QUERY, { slugs });
  const bySlug = new Map(toSummaries(cards).map((item) => [item.slug, item]));
  return slugs.flatMap((slug) => bySlug.get(slug) ?? []);
}

export type CollectionId = "newArrivals" | "topSelling";

export async function getCollection(
  id: CollectionId,
): Promise<ProductSummary[]> {
  const { data } = await sanityFetch({
    query: HOME_COLLECTIONS_QUERY,
    tags: ["siteSettings", "product"],
    stega: false,
  });
  return toSummaries(data?.[id]);
}
