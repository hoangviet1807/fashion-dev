import Link from "next/link";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { DeleteReviewButton } from "@/components/admin/DeleteReviewButton";
import { Rating } from "@/components/ui/Rating";
import { requirePermission } from "@/lib/admin/auth";
import { ADMIN_PAGE_SIZE } from "@/lib/admin/orders";
import { listAdminReviews } from "@/lib/admin/reviews";
import { formatOrderDate } from "@/lib/orders/status";

const PILL =
  "inline-flex h-9 shrink-0 items-center rounded-[62px] px-4 text-sm font-medium transition-colors";

const FILTERS = [
  { value: null, label: "Tất cả" },
  { value: 2, label: "1–2 sao" },
  { value: 3, label: "3 sao trở xuống" },
] as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminReviewsPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePermission("reviews:moderate", "/admin/reviews");
  const params = await searchParams;
  const rawMax = Number(first(params.max));
  const maxRating = rawMax === 2 || rawMax === 3 ? rawMax : null;
  const page = Math.max(1, Number.parseInt(first(params.page) ?? "", 10) || 1);

  const { items, total } = await listAdminReviews({ page, maxRating });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div>
      <nav aria-label="Lọc đánh giá" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 xl:mx-0 xl:px-0">
        {FILTERS.map(({ value, label }) => {
          const active = value === maxRating;
          return (
            <Link
              key={label}
              href={value ? `/admin/reviews?max=${value}` : "/admin/reviews"}
              aria-current={active ? "page" : undefined}
              className={`${PILL} ${active ? "bg-black text-white" : "bg-muted text-black hover:bg-black/[0.07]"}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <div className="mt-5 rounded-[20px] border border-line px-5 py-16 text-center">
          <p className="text-base text-text-60">Chưa có đánh giá nào.</p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-3 xl:gap-4">
          {items.map((review) => (
            <li
              key={review.id}
              className="flex flex-col gap-3 rounded-[20px] border border-line p-5 md:flex-row md:items-start xl:px-6"
            >
              <div className="min-w-0 flex-1">
                <Rating value={review.rating} size="review" showValue={false} />
                <p className="mt-3 text-base font-bold text-black">
                  {review.name?.trim() || "Khách hàng"}{" "}
                  <span className="font-normal text-text-60">· {review.email}</span>
                </p>
                <p className="mt-2 whitespace-pre-line break-words text-base text-text-60">{review.content}</p>
                <p className="mt-3 text-sm text-text-60">
                  <Link href={`/product/${review.slug}`} className="underline hover:text-black">
                    {review.slug}
                  </Link>
                  {review.orderId ? (
                    <>
                      {" · "}
                      <Link href={`/admin/orders/${review.orderId}`} className="underline hover:text-black">
                        Đơn #{review.orderNumber}
                      </Link>
                    </>
                  ) : null}
                  {" · "}
                  {formatOrderDate(review.createdAt)}
                  {review.updatedAt.getTime() - review.createdAt.getTime() > 1000 ? " (đã sửa)" : ""}
                </p>
              </div>
              <DeleteReviewButton id={review.id} />
            </li>
          ))}
        </ul>
      )}

      <AdminPagination page={Math.min(page, totalPages)} totalPages={totalPages} />
    </div>
  );
}
