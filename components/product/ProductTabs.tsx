"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/components/motion/Reveal";
import { ReviewsPanel } from "@/components/product/ProductReviews";
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
              className={`relative flex-1 border-b-2 border-transparent pb-5 text-center text-base transition-colors xl:pb-6 xl:text-xl ${
                active ? "font-medium text-black" : "text-text-60 hover:text-black"
              }`}
            >
              {item.label}
              {active ? (
                <motion.span
                  layoutId="product-tab-underline"
                  className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-black"
                  transition={{ type: "spring", stiffness: 420, damping: 38 }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
        >
          {tab === "details" ? <DetailsPanel product={product} /> : null}
          {tab === "reviews" ? <ReviewsPanel product={product} /> : null}
          {tab === "faqs" ? <FaqsPanel product={product} /> : null}
        </motion.div>
      </AnimatePresence>
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
