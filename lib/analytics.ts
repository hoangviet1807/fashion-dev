import { sendGAEvent } from "@next/third-parties/google";
import { track } from "@vercel/analytics";
import { STORE_CURRENCY } from "@/lib/money";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export type AnalyticsItem = {
  sku: string;
  name: string;
  /** e.g. "black / Large" */
  variant?: string;
  price: number;
  quantity: number;
};

/** Accepts cart lines (`price`) and order items (`unitPrice`). */
export function toAnalyticsItem(line: {
  sku: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
}): AnalyticsItem {
  return {
    sku: line.sku,
    name: line.name,
    variant: `${line.color} / ${line.size}`,
    price: line.unitPrice ?? line.price ?? 0,
    quantity: line.quantity,
  };
}

type EcommerceEvent = {
  value: number;
  items: AnalyticsItem[];
  currency?: string;
  transactionId?: string;
  coupon?: string | null;
};

/**
 * GA4 recommended e-commerce events, mirrored to Vercel Analytics custom
 * events (which only accept flat values, so items are reduced to a count).
 */
export function trackEcommerce(
  name: "add_to_cart" | "begin_checkout" | "purchase",
  { value, items, currency = STORE_CURRENCY, transactionId, coupon }: EcommerceEvent,
) {
  if (typeof window === "undefined") return;
  try {
    if (GA_ID) {
      sendGAEvent("event", name, {
        currency,
        value,
        ...(transactionId ? { transaction_id: transactionId } : {}),
        ...(coupon ? { coupon } : {}),
        items: items.map((item) => ({
          item_id: item.sku,
          item_name: item.name,
          item_variant: item.variant,
          price: item.price,
          quantity: item.quantity,
        })),
      });
    }
    track(name, {
      value,
      currency,
      items: items.reduce((sum, item) => sum + item.quantity, 0),
      ...(transactionId ? { transaction_id: transactionId } : {}),
    });
  } catch (error) {
    console.error("[analytics] Failed to send event", error);
  }
}
