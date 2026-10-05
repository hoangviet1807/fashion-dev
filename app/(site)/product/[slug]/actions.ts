"use server";

import { revalidateTag } from "next/cache";
import type { z } from "zod";
import { auth } from "@/auth";
import { getAccountUser } from "@/lib/account/queries";
import {
  findPurchase,
  getOwnReview,
  getReviewSummary,
  listReviews,
  reviewsTag,
  saveReview,
  syncProductRating,
} from "@/lib/reviews/server";
import {
  reviewQuerySchema,
  reviewSchema,
  slugSchema,
  toReviewFieldErrors,
  type ReviewFieldErrors,
  type ReviewPage,
  type ReviewRatingFilter,
  type ReviewSummary,
} from "@/lib/reviews/shared";

export type LoadReviewsResult = { status: "ok"; page: ReviewPage } | { status: "error" };

export async function loadReviews(
  input: z.input<typeof reviewQuerySchema>,
): Promise<LoadReviewsResult> {
  const parsed = reviewQuerySchema.safeParse(input);
  if (!parsed.success) return { status: "error" };
  const { slug, sort, rating, offset } = parsed.data;
  try {
    const query = { sort, rating: rating as ReviewRatingFilter };
    return { status: "ok", page: await listReviews(slug, query, offset) };
  } catch (error) {
    console.error("[reviews] Failed to load reviews", error);
    return { status: "error" };
  }
}

const NOT_PURCHASED = "Chỉ khách hàng đã mua sản phẩm này mới có thể viết đánh giá.";
const GENERIC_ERROR = "Đã có lỗi xảy ra. Vui lòng thử lại.";

export type ReviewEligibility =
  | { status: "signed_out" }
  | { status: "not_purchased"; message: string }
  | {
      status: "eligible";
      name: string | null;
      existing: { rating: number; content: string } | null;
    }
  | { status: "error"; message: string };

async function currentUser() {
  const session = await auth();
  return session?.user?.id ? getAccountUser(session.user.id) : null;
}

export async function getReviewEligibility(slug: string): Promise<ReviewEligibility> {
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) return { status: "error", message: GENERIC_ERROR };

  try {
    const user = await currentUser();
    if (!user) return { status: "signed_out" };
    const orderId = await findPurchase(user, parsedSlug.data);
    if (!orderId) return { status: "not_purchased", message: NOT_PURCHASED };
    return {
      status: "eligible",
      name: user.name,
      existing: await getOwnReview(user.id, parsedSlug.data),
    };
  } catch (error) {
    console.error("[reviews] Failed to check eligibility", error);
    return { status: "error", message: GENERIC_ERROR };
  }
}

export type SubmitReviewResult =
  | { status: "saved"; message: string; summary: ReviewSummary; page: ReviewPage }
  | { status: "invalid"; fieldErrors: ReviewFieldErrors }
  | { status: "signed_out" }
  | { status: "error"; message: string };

export async function submitReview(input: {
  slug: string;
  rating: unknown;
  content: unknown;
}): Promise<SubmitReviewResult> {
  const parsedSlug = slugSchema.safeParse(input.slug);
  if (!parsedSlug.success) return { status: "error", message: GENERIC_ERROR };
  const slug = parsedSlug.data;

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "invalid", fieldErrors: toReviewFieldErrors(parsed.error) };
  }

  try {
    const user = await currentUser();
    if (!user) return { status: "signed_out" };
    const orderId = await findPurchase(user, slug);
    if (!orderId) return { status: "error", message: NOT_PURCHASED };

    const outcome = await saveReview({ userId: user.id, slug, orderId, ...parsed.data });
    const [summary, page] = await Promise.all([
      getReviewSummary(slug),
      listReviews(slug, { sort: "newest", rating: null }),
    ]);
    await syncProductRating(slug, summary);
    revalidateTag(reviewsTag(slug), { expire: 0 });

    return {
      status: "saved",
      message:
        outcome === "created" ? "Cảm ơn bạn đã đánh giá sản phẩm!" : "Đã cập nhật đánh giá của bạn.",
      summary,
      page,
    };
  } catch (error) {
    console.error("[reviews] Failed to save review", error);
    return { status: "error", message: GENERIC_ERROR };
  }
}
