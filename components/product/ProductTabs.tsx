"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Rating } from "@/components/ui/Rating";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/lib/types/product";

type TabId = "details" | "reviews" | "faqs";

const TABS: { id: TabId; label: string }[] = [
  { id: "details", label: "Chi tiết sản phẩm" },
  { id: "reviews", label: "Đánh giá" },
  { id: "faqs", label: "Câu hỏi thường gặp" },
];

export function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<TabId>("reviews");

  return (
    <div className="pt-10 xl:pt-16">
      <div className="flex border-b border-line">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex-1 pb-5 text-center text-base xl:pb-6 xl:text-xl ${
                active
                  ? "border-b-2 border-black font-medium text-black"
                  : "text-text-60"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "details" ? <DetailsPanel product={product} /> : null}
      {tab === "reviews" ? <ReviewsPanel product={product} /> : null}
      {tab === "faqs" ? <FaqsPanel product={product} /> : null}
    </div>
  );
}

function DetailsPanel({ product }: { product: Product }) {
  const { details } = product;
  return (
    <div className="flex flex-col gap-8 pt-6 xl:pt-8">
      <section>
        <h3 className="text-xl font-bold">Chất liệu & bảo quản</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-text-60">
          {details.material.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="text-xl font-bold">Dáng & kích cỡ</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-text-60">
          {details.fit.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="text-xl font-bold">Đặc điểm thiết kế</h3>
        <p className="mt-3 text-base text-text-60">{details.featuresIntro}</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-text-60">
          {details.features.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ReviewsPanel({ product }: { product: Product }) {
  return (
    <div className="pt-6 xl:pt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-bold xl:text-2xl">
          Tất cả đánh giá{" "}
          <span className="text-base font-normal text-text-60">
            ({product.reviewCount})
          </span>
        </h3>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Lọc đánh giá"
            className="inline-flex size-10 items-center justify-center rounded-full bg-muted xl:size-12"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/filters.svg"
              alt=""
              width={20}
              height={20}
              className="size-5"
            />
          </button>
          <Button
            variant="secondary"
            className="hidden h-12 px-5 text-sm sm:inline-flex xl:px-6 xl:text-base"
          >
            Mới nhất
          </Button>
          <Button className="h-10 px-4 text-xs xl:h-12 xl:px-5 xl:text-base">
            Viết đánh giá
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:mt-8 xl:grid-cols-2 xl:gap-5">
        {product.reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-[20px] border border-line px-6 py-6 xl:px-8 xl:py-7"
          >
            <Rating value={review.rating} showValue={false} />
            <div className="mt-3.5 flex items-center gap-1">
              <h4 className="text-base font-bold xl:text-xl">{review.name}</h4>
              <Icon src="/icons/verified.svg" size={19} />
            </div>
            <p className="mt-2 text-sm leading-[22px] text-text-60 xl:text-base">
              &ldquo;{review.quote}&rdquo;
            </p>
            <p className="mt-4 text-sm font-medium text-text-60 xl:mt-6">
              {review.postedOn}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 flex justify-center xl:mt-9">
        <Button
          variant="secondary"
          className="h-[47px] w-full px-9 text-sm xl:h-[52px] xl:w-auto xl:text-base"
        >
          Xem thêm đánh giá
        </Button>
      </div>
    </div>
  );
}

function FaqsPanel({ product }: { product: Product }) {
  return (
    <div className="flex flex-col divide-y divide-line pt-2 xl:pt-4">
      {product.faqs.map((faq) => (
        <details key={faq.id} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium xl:text-xl">
            {faq.question}
            <span className="text-text-60 transition group-open:rotate-180">
              <Icon src="/icons/chevron.svg" size={16} />
            </span>
          </summary>
          <p className="mt-3 text-sm leading-[22px] text-text-60 xl:text-base">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
