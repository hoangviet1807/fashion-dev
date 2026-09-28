"use server";

import { z } from "zod";
import { auth } from "@/auth";
import type { CartLine } from "@/lib/cart/store";
import {
  MAX_CART_LINES,
  loadServerCart,
  mergeCartItems,
  replaceServerCart,
} from "@/lib/cart/server";
import { checkoutLineSchema } from "@/lib/checkout/schema";
import { quoteCart } from "@/lib/checkout/quote";

const syncSchema = z.object({
  items: z.array(checkoutLineSchema).max(MAX_CART_LINES),
  /** User the browser cart was last synced with; null for a guest cart. */
  owner: z.string().nullable(),
});

export type CartSyncResult =
  | { status: "guest" }
  | { status: "synced"; userId: string; lines: CartLine[] }
  | { status: "error" };

/**
 * A guest cart (or one synced with another user) is added into the saved cart;
 * a cart already synced with this user is replaced by the saved one.
 */
export async function syncCart(input: z.input<typeof syncSchema>): Promise<CartSyncResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { status: "guest" };

  const parsed = syncSchema.safeParse(input);
  if (!parsed.success) return { status: "error" };
  const { items, owner } = parsed.data;

  try {
    const saved = await loadServerCart(userId);
    const requested = owner === userId ? saved : mergeCartItems(saved, items);
    if (requested.length === 0) return { status: "synced", userId, lines: [] };

    const quote = await quoteCart(requested);
    await replaceServerCart(userId, quote.lines);
    return { status: "synced", userId, lines: quote.lines };
  } catch (error) {
    console.error("[cart] Failed to sync cart", error);
    return { status: "error" };
  }
}

const saveSchema = z.object({
  owner: z.string().min(1),
  items: z.array(checkoutLineSchema).max(MAX_CART_LINES),
});

/** Mirrors the browser cart to the database; ignored if the session changed user. */
export async function saveCart(input: z.input<typeof saveSchema>): Promise<{ ok: boolean }> {
  const session = await auth();
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success || session?.user?.id !== parsed.data.owner) return { ok: false };

  try {
    await replaceServerCart(parsed.data.owner, parsed.data.items);
    return { ok: true };
  } catch (error) {
    console.error("[cart] Failed to save cart", error);
    return { ok: false };
  }
}
