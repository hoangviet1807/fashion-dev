"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getReviewEligibility,
  loadReviews,
  submitReview,
} from "@/app/(site)/product/[slug]/actions";
import { FormNotice } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/Button";
import { Dropdown, type DropdownOption } from "@/components/ui/Dropdown";
import { Icon } from "@/components/ui/Icon";
import { Rating } from "@/components/ui/Rating";
import {
  REVIEW_CONTENT_MAX,
  REVIEW_SORT_LABELS,
  REVIEW_SORTS,
  reviewSchema,
  toReviewFieldErrors,
  type ReviewFieldErrors,
  type ReviewPage,
  type ReviewQuery,
  type ReviewRatingFilter,
  type ReviewSort,
} from "@/lib/reviews/shared";
import type { Product } from "@/lib/types/product";

type Notice = { tone: "error" | "success"; text: string };

type Writer =
  | { status: "closed" }
  | { status: "checking" }
  | {
      status: "open";
      name: string | null;
      existing: { rating: number; content: string } | null;
    };

const RATING_FILTERS: DropdownOption<string>[] = [
  { value: "", label: "Tất cả số sao" },
  ...[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} sao` })),
];

const SORT_OPTIONS: DropdownOption<ReviewSort>[] = REVIEW_SORTS.map((sort) => ({
  value: sort,
  label: REVIEW_SORT_LABELS[sort],
}));

export function ReviewsPanel({ product }: { product: Product }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState<ReviewQuery>({ sort: "newest", rating: null });
  const [page, setPage] = useState<ReviewPage>(product.reviews);
  const [reviewCount, setReviewCount] = useState(product.reviewCount);
  const [loading, startLoading] = useTransition();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [writer, setWriter] = useState<Writer>({ status: "closed" });
  const requestId = useRef(0);

  function fetchPage(next: ReviewQuery, offset: number) {
    const id = ++requestId.current;
    startLoading(async () => {
      const result = await loadReviews({ slug: product.slug, ...next, offset }).catch(() => null);
      if (id !== requestId.current) return;
      if (!result || result.status !== "ok") {
        setNotice({ tone: "error", text: "Chưa tải được đánh giá. Vui lòng thử lại." });
        return;
      }
      setPage((current) => {
        if (offset === 0) return result.page;
        const seen = new Set(current.items.map((item) => item.id));
        return {
          total: result.page.total,
          items: [...current.items, ...result.page.items.filter((item) => !seen.has(item.id))],
        };
      });
    });
  }

  function changeQuery(next: Partial<ReviewQuery>) {
    const merged = { ...query, ...next };
    setQuery(merged);
    setNotice(null);
    fetchPage(merged, 0);
  }

  async function openWriter() {
    if (writer.status !== "closed") {
      setWriter({ status: "closed" });
      return;
    }
    setNotice(null);
    setWriter({ status: "checking" });
    const result = await getReviewEligibility(product.slug).catch(() => null);
    switch (result?.status) {
      case "signed_out":
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        setWriter({ status: "closed" });
        break;
      case "eligible":
        setWriter({ status: "open", name: result.name, existing: result.existing });
        break;
      case "not_purchased":
      case "error":
        setNotice({ tone: "error", text: result.message });
        setWriter({ status: "closed" });
        break;
      default:
        setNotice({ tone: "error", text: "Đã có lỗi xảy ra. Vui lòng thử lại." });
        setWriter({ status: "closed" });
    }
  }

  const filtered = query.rating !== null;
  const hasMore = page.items.length < page.total;

  return (
    <div className="pt-6 xl:pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-bold xl:text-2xl">
          {filtered ? `Đánh giá ${query.rating} sao` : "Tất cả đánh giá"}{" "}
          <span className="text-base font-normal text-text-60">
            ({filtered ? page.total : reviewCount})
          </span>
        </h3>
        <div className="flex items-center gap-2.5">
          <Dropdown
            label="Lọc theo số sao"
            trigger="icon"
            icon="/icons/filters.svg"
            value={query.rating === null ? "" : String(query.rating)}
            options={RATING_FILTERS}
            onChange={(value) =>
              changeQuery({
                rating: value ? (Number(value) as ReviewRatingFilter) : null,
              })
            }
          />
          <div className="hidden sm:block">
            <Dropdown
              label="Sắp xếp đánh giá"
              align="end"
              value={query.sort}
              options={SORT_OPTIONS}
              onChange={(sort) => changeQuery({ sort })}
            />
          </div>
          <Button
            onClick={openWriter}
            disabled={writer.status === "checking"}
            className="h-10 px-4 text-xs xl:h-12 xl:px-5 xl:text-base"
          >
            Viết đánh giá
          </Button>
        </div>
      </div>

      {notice ? (
        <div className="mt-6 xl:mt-8">
          <FormNotice tone={notice.tone}>{notice.text}</FormNotice>
        </div>
      ) : null}

      {writer.status === "open" ? (
        <ReviewForm
          slug={product.slug}
          name={writer.name}
          existing={writer.existing}
          onCancel={() => setWriter({ status: "closed" })}
          onSaved={(result) => {
            requestId.current++;
            setWriter({ status: "closed" });
            setQuery({ sort: "newest", rating: null });
            setPage(result.page);
            setReviewCount(result.summary.count);
            setNotice({ tone: "success", text: result.message });
            router.refresh();
          }}
        />
      ) : null}

      {page.items.length > 0 ? (
        <div
          className={`mt-6 grid grid-cols-1 gap-4 transition-opacity xl:mt-8 xl:grid-cols-2 xl:gap-5 ${loading ? "opacity-60" : ""}`}
          aria-busy={loading}
        >
          {page.items.map((review) => (
            <article
              key={review.id}
              className="rounded-[20px] border border-line px-6 py-6 xl:px-8 xl:py-7"
            >
              <Rating value={review.rating} showValue={false} />
              <div className="mt-3.5 flex items-center gap-1">
                <h4 className="text-base font-bold xl:text-xl">{review.name}</h4>
                <Icon src="/icons/verified.svg" size={19} />
              </div>
              <p className="mt-2 text-sm leading-[22px] whitespace-pre-line text-text-60 xl:text-base">
                &ldquo;{review.quote}&rdquo;
              </p>
              <p className="mt-4 text-sm font-medium text-text-60 xl:mt-6">
                {review.postedOn}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-base text-text-60 xl:mt-8">
          {filtered
            ? `Chưa có đánh giá ${query.rating} sao.`
            : "Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này."}
        </p>
      )}

      {hasMore ? (
        <div className="mt-6 flex justify-center xl:mt-9">
          <Button
            variant="secondary"
            onClick={() => fetchPage(query, page.items.length)}
            disabled={loading}
            className="h-[47px] w-full px-9 text-sm xl:h-[52px] xl:w-auto xl:text-base"
          >
            {loading ? "Đang tải…" : "Xem thêm đánh giá"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

const STAR_PATH =
  "M9.24494 0L11.8641 5.63996L18.0374 6.38815L13.4829 10.622L14.679 16.7243L9.24494 13.701L3.8109 16.7243L5.00697 10.622L0.452479 6.38815L6.62573 5.63996L9.24494 0Z";

type SavedReview = Extract<Awaited<ReturnType<typeof submitReview>>, { status: "saved" }>;

function ReviewForm({
  slug,
  name,
  existing,
  onCancel,
  onSaved,
}: {
  slug: string;
  name: string | null;
  existing: { rating: number; content: string } | null;
  onCancel: () => void;
  onSaved: (result: SavedReview) => void;
}) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [errors, setErrors] = useState<ReviewFieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const shown = hover || rating;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const content = String(new FormData(event.currentTarget).get("content") ?? "");

    const parsed = reviewSchema.safeParse({ rating, content });
    setNotice(null);
    if (!parsed.success) {
      setErrors(toReviewFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    startTransition(async () => {
      try {
        const result = await submitReview({ slug, ...parsed.data });
        switch (result.status) {
          case "saved":
            onSaved(result);
            break;
          case "invalid":
            setErrors(result.fieldErrors);
            break;
          case "signed_out":
            setNotice("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            break;
          case "error":
            setNotice(result.message);
            break;
        }
      } catch {
        setNotice("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    });
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="mt-6 flex flex-col gap-4 rounded-[20px] border border-line px-6 py-6 xl:mt-8 xl:px-8 xl:py-7"
    >
      <div>
        <h4 className="text-base font-bold xl:text-xl">
          {existing ? "Sửa đánh giá của bạn" : "Đánh giá của bạn"}
        </h4>
        <p className="mt-1 text-sm text-text-60">
          Hiển thị với tên {name?.trim() || "Khách hàng"}.
        </p>
      </div>
      {notice ? <FormNotice>{notice}</FormNotice> : null}

      <fieldset>
        <legend className="sr-only">Số sao</legend>
        <div className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                aria-describedby={errors.rating ? "rating-error" : undefined}
                className="peer sr-only"
              />
              <svg
                viewBox="0 0 18.49 18.49"
                aria-hidden
                className={`size-7 rounded-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black ${n <= shown ? "fill-star" : "fill-line"}`}
              >
                <path d={STAR_PATH} />
              </svg>
              <span className="sr-only">{n} sao</span>
            </label>
          ))}
        </div>
        {errors.rating ? (
          <p id="rating-error" className="mt-1.5 text-sm text-discount">
            {errors.rating}
          </p>
        ) : null}
      </fieldset>

      <div>
        <textarea
          name="content"
          rows={4}
          maxLength={REVIEW_CONTENT_MAX}
          defaultValue={existing?.content}
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm"
          aria-label="Nội dung đánh giá"
          aria-invalid={errors.content ? true : undefined}
          aria-describedby={errors.content ? "content-error" : undefined}
          className={`w-full resize-y rounded-[20px] bg-muted px-4 py-3 text-base text-black outline-none placeholder:text-text-40 ${errors.content ? "ring-1 ring-discount" : ""}`}
        />
        {errors.content ? (
          <p id="content-error" className="mt-1.5 px-4 text-sm text-discount">
            {errors.content}
          </p>
        ) : null}
      </div>

      <div className="flex gap-2.5">
        <Button
          type="submit"
          disabled={pending}
          className="h-10 px-4 text-xs xl:h-12 xl:px-5 xl:text-base"
        >
          {pending ? "Đang gửi…" : existing ? "Cập nhật đánh giá" : "Gửi đánh giá"}
        </Button>
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={pending}
          className="h-10 px-4 text-xs xl:h-12 xl:px-5 xl:text-base"
        >
          Huỷ
        </Button>
      </div>
    </form>
  );
}
