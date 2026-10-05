import { z } from "zod";
import type { ProductReview } from "@/lib/types/product";

export const REVIEWS_PAGE_SIZE = 6;
export const REVIEW_CONTENT_MIN = 10;
export const REVIEW_CONTENT_MAX = 1000;

export const REVIEW_SORTS = ["newest", "oldest", "highest", "lowest"] as const;
export type ReviewSort = (typeof REVIEW_SORTS)[number];

export const REVIEW_SORT_LABELS: Record<ReviewSort, string> = {
  newest: "Mới nhất",
  oldest: "Cũ nhất",
  highest: "Đánh giá cao nhất",
  lowest: "Đánh giá thấp nhất",
};

/** Star filter; null shows every rating. */
export type ReviewRatingFilter = 1 | 2 | 3 | 4 | 5 | null;

export type ReviewQuery = {
  sort: ReviewSort;
  rating: ReviewRatingFilter;
};

export type ReviewPage = {
  items: ProductReview[];
  /** Reviews matching the current star filter. */
  total: number;
};

export type ReviewSummary = {
  /** Rounded to one decimal; 0 when there are no reviews. */
  average: number;
  count: number;
};

export const slugSchema = z.string().trim().min(1).max(200);

export const reviewQuerySchema = z.object({
  slug: slugSchema,
  sort: z.enum(REVIEW_SORTS).default("newest"),
  rating: z.number().int().min(1).max(5).nullable().default(null),
  offset: z.number().int().min(0).max(10_000).default(0),
});

export const reviewSchema = z.object({
  rating: z.coerce
    .number({ error: "Vui lòng chọn số sao." })
    .int("Vui lòng chọn số sao.")
    .min(1, "Vui lòng chọn số sao.")
    .max(5, "Vui lòng chọn số sao."),
  content: z
    .string()
    .trim()
    .min(REVIEW_CONTENT_MIN, `Nội dung cần ít nhất ${REVIEW_CONTENT_MIN} ký tự.`)
    .max(REVIEW_CONTENT_MAX, `Nội dung tối đa ${REVIEW_CONTENT_MAX} ký tự.`),
});

export type ReviewFieldErrors = Partial<Record<keyof z.infer<typeof reviewSchema>, string>>;

export function toReviewFieldErrors(error: z.ZodError): ReviewFieldErrors {
  const errors: ReviewFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if ((key === "rating" || key === "content") && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}
