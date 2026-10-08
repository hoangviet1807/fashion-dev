import { client } from "@/sanity/lib/client";
import { CHECKOUT_VARIANTS_QUERY, FREE_SHIPPING_QUERY } from "@/sanity/lib/queries";
import {
  cartSubtotal,
  cartTotal,
  deliveryFeeFor,
  type ShippingMethodId,
} from "@/lib/cart-data";
import type { CartLine } from "@/lib/cart/store";
import type { AppliedCoupon } from "@/lib/coupons/discount";
import { checkCoupon } from "@/lib/coupons/server";
import { formatPrice } from "@/lib/money";

export type QuoteIssue =
  | {
      sku: string;
      name: string;
      kind: "unavailable" | "insufficient_stock" | "price_changed";
      message: string;
    }
  | { kind: "coupon"; message: string };

export type Quote = {
  lines: CartLine[];
  issues: QuoteIssue[];
  /** Null when no code was given or it no longer applies (see `issues`). */
  coupon: (AppliedCoupon & { id: string }) | null;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
};

/** Uncached, non-CDN read so prices and stock are current. */
const freshClient = client.withConfig({ useCdn: false });

/** Current free-shipping threshold in VND, or null when shipping is always charged. */
export async function fetchFreeShippingThreshold(): Promise<number | null> {
  const value = await freshClient.fetch(FREE_SHIPPING_QUERY, {}, { cache: "no-store" });
  return typeof value === "number" && value > 0 ? value : null;
}

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
  couponCode?: string | null,
): Promise<Quote> {
  const requested = new Map<string, number>();
  for (const item of items) {
    requested.set(item.sku, (requested.get(item.sku) ?? 0) + item.quantity);
  }

  const [variants, freeShippingFrom] = await Promise.all([
    fetchVariants([...requested.keys()]),
    fetchFreeShippingThreshold(),
  ]);

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
  const deliveryFee = deliveryFeeFor(shipping, subtotal, freeShippingFrom);

  let coupon: Quote["coupon"] = null;
  let discount = 0;
  if (couponCode && lines.length > 0) {
    const check = await checkCoupon(couponCode, subtotal);
    if (check.ok) {
      coupon = check.coupon;
      discount = check.discount;
    } else {
      issues.push({ kind: "coupon", message: `${check.message} Mã đã được gỡ khỏi giỏ hàng.` });
    }
  }

  return {
    lines,
    issues,
    coupon,
    subtotal,
    discount,
    deliveryFee,
    total: cartTotal(subtotal, discount, deliveryFee),
  };
}
