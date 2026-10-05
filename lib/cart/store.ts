"use client";

import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AppliedCoupon } from "@/lib/coupons/discount";

export type CartLine = {
  sku: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  /** Stock snapshot when added; the server re-checks at checkout. */
  stock: number;
};

type CartState = {
  items: CartLine[];
  /** Signed-in user this cart mirrors in the database; null for a guest cart. */
  owner: string | null;
  /** Promo code accepted by the server; re-validated at checkout. */
  coupon: AppliedCoupon | null;
  setCoupon: (coupon: AppliedCoupon | null) => void;
  /** Returns the quantity actually added after capping at stock. */
  add: (line: Omit<CartLine, "quantity">, quantity: number) => number;
  updateQty: (sku: string, quantity: number) => void;
  remove: (sku: string) => void;
  /** Overwrites the cart with server-verified lines. */
  replace: (lines: CartLine[]) => void;
  clear: () => void;
  /** Adopts the server cart of `owner` without echoing it back to the database. */
  attach: (owner: string, lines: CartLine[]) => void;
  /** Forgets the signed-in cart locally (on sign-out); the saved copy is kept. */
  detach: () => void;
  count: () => number;
};

function clampQty(quantity: number, stock: number) {
  return Math.max(1, Math.min(Math.floor(quantity), stock));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      owner: null,
      coupon: null,

      setCoupon: (coupon) => set({ coupon }),

      add: (line, quantity) => {
        const existing = get().items.find((item) => item.sku === line.sku);
        const current = existing?.quantity ?? 0;
        const added = Math.max(0, Math.min(Math.floor(quantity), line.stock - current));
        if (added === 0) return 0;

        set((state) => ({
          items: existing
            ? state.items.map((item) =>
                item.sku === line.sku
                  ? { ...item, ...line, quantity: current + added }
                  : item,
              )
            : [...state.items, { ...line, quantity: added }],
        }));
        return added;
      },

      updateQty: (sku, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.sku === sku
              ? { ...item, quantity: clampQty(quantity, item.stock) }
              : item,
          ),
        })),

      remove: (sku) =>
        set((state) => ({
          items: state.items.filter((item) => item.sku !== sku),
        })),

      replace: (lines) => set({ items: lines }),

      clear: () => set({ items: [], coupon: null }),

      attach: (owner, lines) => set({ owner, items: lines }),

      detach: () => set({ owner: null, items: [], coupon: null }),

      count: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "shopco-cart",
      version: 2,
      // v1 carts stored USD prices; they are dropped rather than shown as VND.
      migrate: (persisted, version) =>
        (version < 2 ? { items: [], owner: null } : persisted) as Pick<CartState, "items" | "owner">,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, owner: state.owner, coupon: state.coupon }),
      // Rehydrated after mount so server and first client render agree.
      skipHydration: true,
    },
  ),
);

function subscribeHydration(callback: () => void) {
  return useCartStore.persist.onFinishHydration(callback);
}

/** False on the server and until localStorage has been read on the client. */
export function useCartHydrated() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    if (!useCartStore.persist.hasHydrated()) {
      void useCartStore.persist.rehydrate();
    }
  }, []);

  return hydrated;
}

/** Total quantity in the cart; 0 until hydrated. */
export function useCartCount() {
  const hydrated = useCartHydrated();
  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  return hydrated ? count : 0;
}

/** Quantity of one SKU already in the cart; 0 until hydrated. */
export function useCartQuantity(sku: string | undefined) {
  const hydrated = useCartHydrated();
  const quantity = useCartStore(
    (state) => state.items.find((item) => item.sku === sku)?.quantity ?? 0,
  );
  return hydrated ? quantity : 0;
}
