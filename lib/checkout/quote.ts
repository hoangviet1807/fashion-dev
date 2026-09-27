import { client } from "@/sanity/lib/client";
import { CHECKOUT_VARIANTS_QUERY } from "@/sanity/lib/queries";
import {
  SHIPPING_METHODS,
  cartDiscount,
  cartSubtotal,
  cartTotal,
  type ShippingMethodId,
} from "@/lib/cart-data";
import type { CartLine } from "@/lib/cart/store";
import { formatPrice } from "@/lib/money";

export type QuoteIssue = {
  sku: string;
  name: string;
  kind: "unavailable" | "insufficient_stock" | "price_changed";
  message: string;
};

export type Quote = {
  lines: CartLine[];
  issues: QuoteIssue[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
};

/** Uncached, non-CDN read so prices and stock are current. */
const freshClient = client.withConfig({ useCdn: false });

export async function fetchVariants(skus: string[]) {
  const products = await freshClient.fetch(
    CHECKOUT_VARIANTS_QUERY,
    { skus },
    { cache: "no-store" },
  );
  return new Map(
    products.flatMap((product) =>
      product.variants.map((variant) => [variant.sku, { product, variant }] as const),
    ),
  );
}

/**
 * Prices a cart from Sanity. Client-sent prices are never used; `seenPrices`
 * only lets us tell the customer which prices moved.
 */
export async function quoteCart(
  items: { sku: string; quantity: number }[],
  shipping: ShippingMethodId = "standard",
  seenPrices: Record<string, number> = {},
): Promise<Quote> {
  const requested = new Map<string, number>();
  for (const item of items) {
    requested.set(item.sku, (requested.get(item.sku) ?? 0) + item.quantity);
  }

  const variants = await fetchVariants([...requested.keys()]);

  const lines: CartLine[] = [];
  const issues: QuoteIssue[] = [];

  for (const [sku, quantity] of requested) {
    const match = variants.get(sku);
    if (!match || match.variant.stock <= 0) {
      issues.push({
        sku,
        name: match?.product.name ?? sku,
        kind: "unavailable",
        message: `${match?.product.name ?? "Một sản phẩm"} đã hết hàng và được xoá khỏi giỏ.`,
      });
      continue;
    }

    const { product, variant } = match;
    const allowed = Math.min(quantity, variant.stock);
    if (allowed < quantity) {
      issues.push({
        sku,
        name: product.name,
        kind: "insufficient_stock",
        message: `${product.name} (${variant.size}) chỉ còn ${variant.stock} sản phẩm.`,
      });
    }

    const seen = seenPrices[sku];
    if (seen !== undefined && seen !== product.price) {
      issues.push({
        sku,
        name: product.name,
        kind: "price_changed",
        message: `Giá của ${product.name} đã thay đổi từ ${formatPrice(seen)} thành ${formatPrice(product.price)}.`,
      });
    }

    lines.push({
      sku,
      slug: product.slug,
      name: product.name,
      image: product.image ?? "",
      price: product.price,
      color: variant.color,
      size: variant.size,
      quantity: allowed,
      stock: variant.stock,
    });
  }

  const subtotal = cartSubtotal(lines);
  const discount = cartDiscount(subtotal);
  const deliveryFee = SHIPPING_METHODS[shipping].fee;

  return {
    lines,
    issues,
    subtotal,
    discount,
    deliveryFee,
    total: cartTotal(subtotal, discount, deliveryFee),
  };
}
