"use client";

import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mergeWishlists } from "@/lib/wishlist/shared";

type WishlistState = {
  /** Product slugs, newest first. */
  slugs: string[];
  /** Signed-in user this list mirrors in the database; null for a guest list. */
  owner: string | null;
  /** Returns whether the product is saved afterwards. */
  toggle: (slug: string) => boolean;
  /** Drops slugs of products that no longer exist. */
  keepOnly: (slugs: string[]) => void;
  /** Adopts the saved list of `owner` without echoing it back to the database. */
  attach: (owner: string, slugs: string[]) => void;
  /** Forgets the signed-in list locally (on sign-out); the saved copy is kept. */
  detach: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      owner: null,

      toggle: (slug) => {
        const saved = get().slugs.includes(slug);
        set((state) => ({
          slugs: saved
            ? state.slugs.filter((item) => item !== slug)
            : mergeWishlists([slug], state.slugs),
        }));
        return !saved;
      },

      keepOnly: (slugs) => {
        const keep = new Set(slugs);
        const current = get().slugs;
        if (current.every((slug) => keep.has(slug))) return;
        set({ slugs: current.filter((slug) => keep.has(slug)) });
      },

      attach: (owner, slugs) => set({ owner, slugs }),

      detach: () => set({ owner: null, slugs: [] }),
    }),
    {
      name: "shopco-wishlist",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ slugs: state.slugs, owner: state.owner }),
      // Rehydrated after mount so server and first client render agree.
      skipHydration: true,
    },
  ),
);

function subscribeHydration(callback: () => void) {
  return useWishlistStore.persist.onFinishHydration(callback);
}

/** False on the server and until localStorage has been read on the client. */
export function useWishlistHydrated() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useWishlistStore.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    if (!useWishlistStore.persist.hasHydrated()) {
      void useWishlistStore.persist.rehydrate();
    }
  }, []);

  return hydrated;
}

/** Whether a product is saved; false until hydrated. */
export function useIsWishlisted(slug: string) {
  const hydrated = useWishlistHydrated();
  const saved = useWishlistStore((state) => state.slugs.includes(slug));
  return hydrated && saved;
}
