import { count, desc, eq, lte } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders, reviews, users } from "@/lib/db/schema";
import { ADMIN_PAGE_SIZE } from "./orders";

/** Newest first; `maxRating` narrows to low ratings, which most often need a look. */
export async function listAdminReviews({ page, maxRating }: { page: number; maxRating: number | null }) {
  const db = getDb();
  const where = maxRating ? lte(reviews.rating, maxRating) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db
      .select({
        id: reviews.id,
        slug: reviews.productSlug,
        rating: reviews.rating,
        content: reviews.content,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        name: users.name,
        email: users.email,
        orderId: orders.id,
        orderNumber: orders.number,
      })
      .from(reviews)
      .innerJoin(users, eq(users.id, reviews.userId))
      .leftJoin(orders, eq(orders.id, reviews.orderId))
      .where(where)
      .orderBy(desc(reviews.createdAt), desc(reviews.id))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE),
    db.select({ total: count() }).from(reviews).where(where),
  ]);

  return { items, total };
}
