import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";

export type CartItemInput = { sku: string; quantity: number };

export const MAX_CART_LINES = 50;
export const MAX_LINE_QUANTITY = 99;

export async function loadServerCart(userId: string): Promise<CartItemInput[]> {
  return getDb()
    .select({ sku: cartItems.sku, quantity: cartItems.quantity })
    .from(cartItems)
    .where(eq(cartItems.userId, userId));
}

export async function replaceServerCart(userId: string, items: CartItemInput[]) {
  await getDb().transaction(async (tx) => {
    await tx.delete(cartItems).where(eq(cartItems.userId, userId));
    if (items.length === 0) return;
    await tx.insert(cartItems).values(
      items.slice(0, MAX_CART_LINES).map(({ sku, quantity }) => ({
        userId,
        sku,
        quantity: Math.min(quantity, MAX_LINE_QUANTITY),
      })),
    );
  });
}

/** Adds quantities per SKU; the result is still capped by stock when quoted. */
export function mergeCartItems(...carts: CartItemInput[][]): CartItemInput[] {
  const merged = new Map<string, number>();
  for (const item of carts.flat()) {
    merged.set(item.sku, Math.min((merged.get(item.sku) ?? 0) + item.quantity, MAX_LINE_QUANTITY));
  }
  return [...merged].slice(0, MAX_CART_LINES).map(([sku, quantity]) => ({ sku, quantity }));
}
