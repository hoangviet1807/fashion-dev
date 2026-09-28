"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { saveCart, syncCart } from "@/app/(site)/cart/actions";
import { useCartHydrated, useCartStore, type CartLine } from "@/lib/cart/store";

/** Credentials sign-in navigates client-side away from these, so the layout never remounts. */
const AUTH_PATHS = new Set(["/login", "/register", "/reset-password"]);
const SAVE_DELAY_MS = 400;

const toInput = (items: CartLine[]) => items.map(({ sku, quantity }) => ({ sku, quantity }));

async function runSync() {
  const { items, owner, attach, detach } = useCartStore.getState();
  const result = await syncCart({ items: toInput(items), owner });
  if (result.status === "synced") attach(result.userId, result.lines);
  else if (result.status === "guest" && owner) detach();
}

/** Merges the browser cart into the account cart on sign-in and keeps them in step. */
export function CartSync() {
  const hydrated = useCartHydrated();
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    const previous = previousPath.current;
    previousPath.current = pathname;
    const signedInJustNow = previous !== null && AUTH_PATHS.has(previous) && !AUTH_PATHS.has(pathname);
    if (previous === null || signedInJustNow) runSync().catch(() => {});
  }, [hydrated, pathname]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = useCartStore.subscribe((state, prev) => {
      // Owner changes come from attach / detach / rehydration and need no write-back.
      if (!state.owner || state.owner !== prev.owner || state.items === prev.items) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const { owner, items } = useCartStore.getState();
        if (owner) saveCart({ owner, items: toInput(items) }).catch(() => {});
      }, SAVE_DELAY_MS);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return null;
}
