"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { saveWishlist, syncWishlist } from "@/app/(site)/wishlist/actions";
import { useWishlistHydrated, useWishlistStore } from "@/lib/wishlist/store";

/** Credentials sign-in navigates client-side away from these, so the layout never remounts. */
const AUTH_PATHS = new Set(["/login", "/register", "/reset-password"]);
const SAVE_DELAY_MS = 400;

async function runSync() {
  const { slugs, owner, attach, detach } = useWishlistStore.getState();
  const result = await syncWishlist({ slugs, owner });
  if (result.status === "synced") attach(result.userId, result.slugs);
  else if (result.status === "guest" && owner) detach();
}

/** Merges the browser wishlist into the account on sign-in and keeps them in step. */
export function WishlistSync() {
  const hydrated = useWishlistHydrated();
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
    const unsubscribe = useWishlistStore.subscribe((state, prev) => {
      // Owner changes come from attach / detach / rehydration and need no write-back.
      if (!state.owner || state.owner !== prev.owner || state.slugs === prev.slugs) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const { owner, slugs } = useWishlistStore.getState();
        if (owner) saveWishlist({ owner, slugs }).catch(() => {});
      }, SAVE_DELAY_MS);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return null;
}
