"use client";

import { create } from "zustand";
import type { CartLine } from "@/lib/cart/store";

export type CartNotice = {
  /** Changes on every add so repeated adds of the same SKU restart the popup. */
  id: number;
  line: Omit<CartLine, "quantity" | "stock">;
  quantity: number;
};

type CartNoticeState = {
  notice: CartNotice | null;
  show: (line: CartNotice["line"], quantity: number) => void;
  dismiss: () => void;
};

export const useCartNotice = create<CartNoticeState>()((set) => ({
  notice: null,
  show: (line, quantity) => set({ notice: { id: Date.now(), line, quantity } }),
  dismiss: () => set({ notice: null }),
}));
