import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { ownedBy, type AccountUser } from "@/lib/account/queries";
import { getDb } from "@/lib/db";
import { orderItems, orders, reviews, users } from "@/lib/db/schema";
import { CONFIRMED_ORDER_STATUSES } from "@/lib/orders/status";
import { PRODUCT_RATING_DOCS_QUERY } from "@/sanity/lib/queries";
import { getWriteClient } from "@/sanity/lib/write-client";
import {
  REVIEWS_PAGE_SIZE,
  type ReviewPage,
  type ReviewQuery,
  type ReviewSort,
  type ReviewSummary,
} from "./shared";

/** Orders that count as a purchase (COD orders are confirmed before delivery). */
const PURCHASED_STATUSES = CONFIRMED_ORDER_STATUSES;

const FALLBACK_NAME = "Khách hàng";

const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function reviewsTag(slug: string) {
  return `reviews:${slug}`;
}

const ORDER_BY: Record<ReviewSort, ReturnType<typeof desc>[]> = {
  newest: [desc(reviews.createdAt), desc(reviews.id)],
  oldest: [asc(reviews.createdAt), asc(reviews.id)],
  highest: [desc(reviews.rating), desc(reviews.createdAt), desc(reviews.id)],
  lowest: [asc(reviews.rating), desc(reviews.createdAt), desc(reviews.id)],
};

export async function listReviews(
  slug: string,
  { sort, rating }: ReviewQuery,
  offset = 0,
): Promise<ReviewPage> {
  const db = getDb();
  const where = and(eq(reviews.productSlug, slug), rating ? eq(reviews.rating, rating) : undefined);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        content: reviews.content,
        createdAt: reviews.createdAt,
        name: users.name,
      })
      .from(reviews)
      .innerJoin(users, eq(users.id, reviews.userId))
      .where(where)
      .orderBy(...ORDER_BY[sort])
      .limit(REVIEWS_PAGE_SIZE)
      .offset(offset),
    db.select({ total: count() }).from(reviews).where(where),
  ]);

  return {
    total,
    items: rows.map((row) => ({
      id: row.id,
      name: row.name?.trim() || FALLBACK_NAME,
      rating: row.rating,
      quote: row.content,
      postedOn: `Đăng ngày ${dateFormat.format(row.createdAt)}`,
    })),
  };
}

export async function getReviewSummary(slug: string): Promise<ReviewSummary> {
  const [row] = await getDb()
    .select({
      average: sql<number>`coalesce(round(avg(${reviews.rating}), 1), 0)::float`,
      count: count(),
    })
    .from(reviews)
    .where(eq(reviews.productSlug, slug));
  return { average: row?.average ?? 0, count: row?.count ?? 0 };
}

export type ProductReviews = { summary: ReviewSummary; page: ReviewPage };

/** Summary + first page (newest) for the product page; invalidated by `reviewsTag`. */
export function getProductReviews(slug: string): Promise<ProductReviews> {
  return unstable_cache(
    async () => {
      const [summary, page] = await Promise.all([
        getReviewSummary(slug),
        listReviews(slug, { sort: "newest", rating: null }),
      ]);
      return { summary, page };
    },
    ["product-reviews", slug],
    { tags: [reviewsTag(slug)], revalidate: 300 },
  )();
}

/** Latest confirmed order of this product owned by the user, if any. */
export async function findPurchase(user: AccountUser, slug: string): Promise<string | null> {
  const [row] = await getDb()
    .select({ id: orders.id })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orderItems.slug, slug),
        inArray(orders.status, PURCHASED_STATUSES),
        ownedBy(user),
      ),
    )
    .orderBy(desc(orders.createdAt))
    .limit(1);
  return row?.id ?? null;
}

export async function getOwnReview(userId: string, slug: string) {
  const [row] = await getDb()
    .select({ rating: reviews.rating, content: reviews.content })
    .from(reviews)
    .where(and(eq(reviews.productSlug, slug), eq(reviews.userId, userId)))
    .limit(1);
  return row ?? null;
}

/** One review per user and product; writing again replaces it. */
export async function saveReview(input: {
  userId: string;
  slug: string;
  orderId: string;
  rating: number;
  content: string;
}): Promise<"created" | "updated"> {
  const [row] = await getDb()
    .insert(reviews)
    .values({
      productSlug: input.slug,
      userId: input.userId,
      orderId: input.orderId,
      rating: input.rating,
      content: input.content,
    })
    .onConflictDoUpdate({
      target: [reviews.productSlug, reviews.userId],
      set: {
        orderId: input.orderId,
        rating: input.rating,
        content: input.content,
        updatedAt: new Date(),
      },
    })
    .returning({ created: sql<boolean>`${reviews.createdAt} = ${reviews.updatedAt}` });
  return row?.created ? "created" : "updated";
}

/**
 * Copies the average into the Sanity product (published + draft) so cards and
 * listings, which read from Sanity, show the real rating.
 */
export async function syncProductRating(slug: string, summary: ReviewSummary): Promise<boolean> {
  const writeClient = getWriteClient();
  if (!writeClient) {
    console.error(`[reviews] SANITY_API_WRITE_TOKEN is not set; rating for ${slug} was not synced.`);
    return false;
  }
  try {
    const ids = await writeClient.fetch(PRODUCT_RATING_DOCS_QUERY, { slug });
    if (ids.length === 0) return true;
    const mutation = writeClient.transaction();
    for (const id of ids) {
      mutation.patch(id, (patch) =>
        patch.set({ rating: summary.average, reviewCount: summary.count }),
      );
    }
    await mutation.commit({ visibility: "async" });
    return true;
  } catch (error) {
    console.error(`[reviews] Failed to sync rating for ${slug}`, error);
    return false;
  }
}
