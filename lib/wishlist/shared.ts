export const MAX_WISHLIST_ITEMS = 100;

/** Newest first, without duplicates, capped at `MAX_WISHLIST_ITEMS`. */
export function mergeWishlists(...lists: string[][]): string[] {
  return [...new Set(lists.flat())].slice(0, MAX_WISHLIST_ITEMS);
}
