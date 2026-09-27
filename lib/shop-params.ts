import {
  COLORS,
  PRICE_BOUNDS,
  SIZES,
  isCategory,
  isDressStyle,
  type CategoryId,
  type DressStyleId,
} from "@/lib/catalog";
import type { ProductSort } from "@/lib/types/product";

export type ShopFacets = {
  color: string;
  size: string;
  price: [number, number];
};

export type ShopQuery = {
  style?: DressStyleId;
  category?: CategoryId;
  /** Set only after "Apply Filter"; color, size and price are applied together. */
  facets?: ShopFacets;
  sort: ProductSort;
  page: number;
};

export type ShopSearchParams = Record<string, string | string[] | undefined>;

const SORTS: ProductSort[] = ["most-popular", "low-price", "high-price"];

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
  const styleParam = first(params.style);
  const categoryParam = first(params.category);
  const category = isCategory(categoryParam) ? categoryParam : undefined;
  // Default to casual only when browsing by style; category-only keeps all styles.
  const style = isDressStyle(styleParam)
    ? styleParam
    : category
      ? undefined
      : "casual";

  const color = first(params.color);
  const size = first(params.size);
  const price = parsePrice(first(params.price));
  const facets =
    color &&
    size &&
    price &&
    COLORS.some((item) => item.id === color) &&
    (SIZES as readonly string[]).includes(size)
      ? { color, size, price }
      : undefined;

  const sortParam = first(params.sort) as ProductSort | undefined;
  const sort = sortParam && SORTS.includes(sortParam) ? sortParam : "most-popular";
  const page = Math.max(1, Math.floor(Number(first(params.page)) || 1));

  return { style, category, facets, sort, page };
}

export function buildShopHref(query: Partial<ShopQuery>) {
  const params = new URLSearchParams();
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
