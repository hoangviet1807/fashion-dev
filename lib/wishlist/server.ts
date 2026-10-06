import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { wishlistItems } from "@/lib/db/schema";
import { MAX_WISHLIST_ITEMS } from "@/lib/wishlist/shared";

/** Saved product slugs, newest first. */
export async function loadServerWishlist(userId: string): Promise<string[]> {
  const rows = await getDb()
    .select({ slug: wishlistItems.productSlug })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId))
    .orderBy(desc(wishlistItems.createdAt));
  return rows.map((row) => row.slug);
}

/** `slugs` is newest first; timestamps are spaced 1 ms apart to keep that order. */
export async function replaceServerWishlist(userId: string, slugs: string[]) {
  const now = Date.now();
  await getDb().transaction(async (tx) => {
    await tx.delete(wishlistItems).where(eq(wishlistItems.userId, userId));
    if (slugs.length === 0) return;
    await tx.insert(wishlistItems).values(
      slugs.slice(0, MAX_WISHLIST_ITEMS).map((productSlug, index) => ({
        userId,
        productSlug,
        createdAt: new Date(now - index),
      })),
    );
  });
}
