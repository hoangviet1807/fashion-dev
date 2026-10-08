"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EASE_OUT } from "@/components/motion/Reveal";
import { useCartNotice } from "@/lib/cart/notice";
import { colorLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";

const AUTO_HIDE_MS = 4000;

export function AddedToCartToast() {
  const notice = useCartNotice((state) => state.notice);
  const dismiss = useCartNotice((state) => state.dismiss);
  const pathname = usePathname();
  const hovered = useRef(false);
  const timer = useRef<number>(undefined);

  function schedule() {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (!hovered.current) dismiss();
    }, AUTO_HIDE_MS);
  }

  useEffect(() => {
    if (!notice) return;
    schedule();
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice]);

  useEffect(() => {
    dismiss();
  }, [pathname, dismiss]);

  useEffect(() => {
    if (!notice) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [notice, dismiss]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex justify-end sm:inset-x-auto sm:right-6 sm:top-6 xl:right-[100px]"
    >
      <AnimatePresence>
        {notice ? (
          <motion.div
            key={notice.id}
            role="status"
            className="pointer-events-auto w-full rounded-[20px] border border-line bg-white p-4 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.28)] sm:w-[380px] xl:p-5"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            onMouseEnter={() => {
              hovered.current = true;
              window.clearTimeout(timer.current);
            }}
            onMouseLeave={() => {
              hovered.current = false;
              schedule();
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-medium xl:text-base">
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-black">
                  <Icon src="/icons/check.svg" size={12} />
                </span>
                Đã thêm vào giỏ hàng!
              </p>
              <button
                type="button"
                aria-label="Đóng thông báo"
                onClick={dismiss}
                className="relative isolate shrink-0 rounded-full transition-transform duration-200 before:absolute before:-inset-1.5 before:-z-10 before:rounded-full before:bg-black/0 before:transition-colors before:duration-200 before:content-[''] hover:before:bg-black/[0.06] active:scale-90 motion-reduce:active:scale-100"
              >
                <Icon src="/icons/close-black.svg" size={16} />
              </button>
            </div>

            <div className="mt-4 flex items-start gap-3.5">
              <div className="relative size-[72px] shrink-0 overflow-hidden rounded-[8.66px] bg-product">
                <Image
                  src={notice.line.image}
                  alt={notice.line.name}
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold leading-[22px]">{notice.line.name}</p>
                <p className="mt-0.5 text-xs leading-[16px] text-text-60 xl:text-sm xl:leading-[19px]">
                  {colorLabel(notice.line.color)} / {notice.line.size}
                </p>
                <p className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-base font-bold">{formatPrice(notice.line.price)}</span>
                  <span className="text-sm text-text-60">x{notice.quantity}</span>
                </p>
              </div>
            </div>

            <Button
              href="/cart"
              fullWidth
              className="mt-4 h-[44px] px-6 text-sm xl:h-[48px]"
            >
              Xem giỏ hàng
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
