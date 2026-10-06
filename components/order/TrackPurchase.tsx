"use client";

import { useEffect } from "react";
import { trackEcommerce, type AnalyticsItem } from "@/lib/analytics";

const STORAGE_KEY = "shopco-tracked-orders";
const MAX_REMEMBERED = 20;

/** Reports a confirmed order once per browser, however often the page is reloaded. */
export function TrackPurchase({
  orderNumber,
  total,
  currency,
  coupon,
  items,
}: {
  orderNumber: number;
  total: number;
  currency: string;
  coupon: string | null;
  items: AnalyticsItem[];
}) {
  useEffect(() => {
    let tracked: number[] = [];
    try {
      tracked = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {}
    if (!Array.isArray(tracked)) tracked = [];
    if (tracked.includes(orderNumber)) return;

    trackEcommerce("purchase", {
      value: total,
      currency,
      coupon,
      transactionId: String(orderNumber),
      items,
    });
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([orderNumber, ...tracked].slice(0, MAX_REMEMBERED)),
      );
    } catch {}
  }, [orderNumber, total, currency, coupon, items]);

  return null;
}
