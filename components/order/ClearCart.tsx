"use client";

import { useEffect } from "react";
import { useCartHydrated, useCartStore } from "@/lib/cart/store";

export function ClearCart() {
  const hydrated = useCartHydrated();
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    if (hydrated) clear();
  }, [hydrated, clear]);

  return null;
}
