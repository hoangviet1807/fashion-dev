"use client";

import { motion } from "motion/react";
import { EASE_OUT } from "@/components/motion/Reveal";
import { formatPrice } from "@/lib/money";

export function FreeShippingProgress({
  subtotal,
  threshold,
  className = "",
}: {
  subtotal: number;
  threshold: number | null;
  className?: string;
}) {
  if (threshold === null) return null;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(1, subtotal / threshold);

  return (
    <div className={`rounded-[20px] bg-muted px-4 py-3.5 xl:px-5 ${className}`}>
      <p className="text-sm leading-5 text-black" aria-live="polite">
        {remaining > 0 ? (
          <>
            Mua thêm <span className="font-bold">{formatPrice(remaining)}</span> để được miễn phí
            vận chuyển tiêu chuẩn
          </>
        ) : (
          <>
            Đơn hàng của bạn được <span className="font-bold">miễn phí vận chuyển</span> tiêu chuẩn
          </>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Tiến độ miễn phí vận chuyển"
        aria-valuemin={0}
        aria-valuemax={threshold}
        aria-valuenow={Math.min(subtotal, threshold)}
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-black/10"
      >
        <motion.div
          className="h-full rounded-full bg-black"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        />
      </div>
    </div>
  );
}
