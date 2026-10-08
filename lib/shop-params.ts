import {
  COLORS,
  PRICE_BOUNDS,
  SIZES,
  isCategory,
  normalizeSize,
  isDressStyle,
  type CategoryId,
  type DressStyleId,
} from "@/lib/catalog";
import { normalizeSearchQuery } from "@/lib/search";
import type { ProductSort } from "@/lib/types/product";

export type ShopFacets = {
  color: string;
  size: string;
  price: [number, number];
};

export type ShopQuery = {
  q?: string;
  sale?: boolean;
  /** Brand slug. */
  brand?: string;
  style?: DressStyleId;
  category?: CategoryId;
  /** Set only after "Apply Filter"; color, size and price are applied together. */
  facets?: ShopFacets;
  sort: ProductSort;
  page: number;
};

export type ShopSearchParams = Record<string, string | string[] | undefined>;

const SORTS: ProductSort[] = ["most-popular", "newest", "low-price", "high-price"];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePrice(value: string | undefined): [number, number] | undefined {
  const match = value?.match(/^(\d+)-(\d+)$/);
  if (!match) return undefined;
  const clamp = (n: number) => Math.min(PRICE_BOUNDS.max, Math.max(PRICE_BOUNDS.min, n));
  const min = clamp(Number(match[1]));
  const max = clamp(Number(match[2]));
  return min <= max ? [min, max] : [max, min];
}

export function parseShopParams(params: ShopSearchParams): ShopQuery {
  const q = normalizeSearchQuery(first(params.q));
  const sale = first(params.sale) === "1" || undefined;
  const brandParam = first(params.brand)?.toLowerCase();
  const brand = brandParam && /^[a-z0-9-]{1,96}$/.test(brandParam) ? brandParam : undefined;
  const styleParam = first(params.style);
  const categoryParam = first(params.category);
  const category = isCategory(categoryParam) ? categoryParam : undefined;
  const sortParam = first(params.sort) as ProductSort | undefined;
  const sort = sortParam && SORTS.includes(sortParam) ? sortParam : "most-popular";
  // Default to casual only on the plain style listing; any other scope or a chosen sort keeps all styles.
  const style = isDressStyle(styleParam)
    ? styleParam
    : category || q || sale || brand || sort !== "most-popular"
      ? undefined
      : "casual";

  const color = first(params.color);
  const sizeParam = first(params.size);
  const size = sizeParam && normalizeSize(sizeParam);
  const price = parsePrice(first(params.price));
  const facets =
    color &&
    size &&
    price &&
    COLORS.some((item) => item.id === color) &&
    (SIZES as readonly string[]).includes(size)
      ? { color, size, price }
      : undefined;

  const page = Math.max(1, Math.floor(Number(first(params.page)) || 1));

  return { q, sale, brand, style, category, facets, sort, page };
}

export function buildShopHref(query: Partial<ShopQuery>) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.sale) params.set("sale", "1");
  if (query.brand) params.set("brand", query.brand);
  if (query.style) params.set("style", query.style);
  if (query.category) params.set("category", query.category);
  if (query.facets) {
    params.set("color", query.facets.color);
    params.set("size", query.facets.size);
    params.set("price", `${query.facets.price[0]}-${query.facets.price[1]}`);
  }
  if (query.sort && query.sort !== "most-popular") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `/shop?${search}` : "/shop";
}
