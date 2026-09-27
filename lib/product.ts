import { SIZES } from "@/lib/catalog";
import type { Product } from "@/lib/types/product";

const SIZE_ORDER: readonly string[] = SIZES;

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
}

export function productColors(product: Pick<Product, "variants">): string[] {
  return [...new Set(product.variants.map((variant) => variant.color))];
}

export function productSizes(product: Pick<Product, "variants">): string[] {
  return sortSizes([...new Set(product.variants.map((variant) => variant.size))]);
}

export function discountPercent(
  product: Pick<Product, "price" | "compareAtPrice" | "discount">,
): number | undefined {
  if (product.discount !== undefined) return product.discount;
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
    return undefined;
  }
  return Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );
}
