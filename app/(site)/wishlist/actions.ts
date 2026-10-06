"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { getProductsBySlugs } from "@/lib/data/products";
import type { ProductSummary } from "@/lib/types/product";
import { loadServerWishlist, replaceServerWishlist } from "@/lib/wishlist/server";
import { MAX_WISHLIST_ITEMS, mergeWishlists } from "@/lib/wishlist/shared";

const slugsSchema = z.array(z.string().min(1).max(200)).max(MAX_WISHLIST_ITEMS);

const syncSchema = z.object({
  slugs: slugsSchema,
  /** User the browser wishlist was last synced with; null for a guest list. */
  owner: z.string().nullable(),
});

export type WishlistSyncResult =
  | { status: "guest" }
  | { status: "synced"; userId: string; slugs: string[] }
  | { status: "error" };

/**
 * A guest list (or one synced with another user) is added in front of the saved
 * list; a list already synced with this user is replaced by the saved one.
 */
export async function syncWishlist(input: z.input<typeof syncSchema>): Promise<WishlistSyncResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { status: "guest" };

  const parsed = syncSchema.safeParse(input);
  if (!parsed.success) return { status: "error" };
  const { slugs, owner } = parsed.data;

  try {
    const saved = await loadServerWishlist(userId);
    if (owner === userId) return { status: "synced", userId, slugs: saved };

    const merged = mergeWishlists(slugs, saved);
    if (merged.length !== saved.length) await replaceServerWishlist(userId, merged);
    return { status: "synced", userId, slugs: merged };
  } catch (error) {
    console.error("[wishlist] Failed to sync wishlist", error);
    return { status: "error" };
  }
}

const saveSchema = z.object({
  owner: z.string().min(1),
  slugs: slugsSchema,
});

/** Mirrors the browser wishlist to the database; ignored if the session changed user. */
export async function saveWishlist(input: z.input<typeof saveSchema>): Promise<{ ok: boolean }> {
  const session = await auth();
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success || session?.user?.id !== parsed.data.owner) return { ok: false };

  try {
    await replaceServerWishlist(parsed.data.owner, mergeWishlists(parsed.data.slugs));
    return { ok: true };
  } catch (error) {
    console.error("[wishlist] Failed to save wishlist", error);
    return { ok: false };
  }
}

export type WishlistProductsResult =
  | { status: "ok"; products: ProductSummary[] }
  | { status: "error" };

/** Product cards for the wishlist page, in wishlist order; deleted products are left out. */
export async function loadWishlistProducts(slugs: string[]): Promise<WishlistProductsResult> {
  const parsed = slugsSchema.safeParse(slugs);
  if (!parsed.success) return { status: "error" };

  try {
    return { status: "ok", products: await getProductsBySlugs(parsed.data) };
  } catch (error) {
    console.error("[wishlist] Failed to load wishlist products", error);
    return { status: "error" };
  }
}
