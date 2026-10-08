"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { SizeGuide } from "@/lib/data/content";

export function SizeGuideDialog({
  open,
  onClose,
  guide,
  activeSize,
}: {
  open: boolean;
  onClose: () => void;
  guide: SizeGuide;
  activeSize?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div key="size-guide" className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Đóng hướng dẫn chọn size"
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-guide-title"
            className="relative flex max-h-[90vh] w-full flex-col rounded-t-[20px] bg-white sm:max-w-[520px] sm:rounded-[20px]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
          >
            <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5">
              <h2 id="size-guide-title" className="text-xl font-bold">
                Hướng dẫn chọn size
              </h2>
              <button
                type="button"
                aria-label="Đóng hướng dẫn chọn size"
                onClick={onClose}
                className="inline-flex size-6 items-center justify-center overflow-clip"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/close-black.svg" alt="" width={24} height={24} className="size-full brightness-0" />
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto px-5 pb-6 sm:px-6">
              <table className="w-full border-collapse text-left text-sm xl:text-base">
                <thead>
                  <tr className="bg-muted">
                    <th scope="col" className="rounded-l-[12px] px-4 py-3 font-medium">Size</th>
                    <th scope="col" className="px-4 py-3 font-medium">Chiều cao (cm)</th>
                    <th scope="col" className="rounded-r-[12px] px-4 py-3 font-medium">Cân nặng (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {guide.rows.map((row) => (
                    <tr
                      key={row.size}
                      className={`border-b border-line last:border-0 ${row.size === activeSize ? "font-medium" : "text-text-60"}`}
                    >
                      <th scope="row" className="px-4 py-3 font-medium text-black">{row.size}</th>
                      <td className="px-4 py-3">{row.height ?? "—"}</td>
                      <td className="px-4 py-3">{row.weight ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {guide.note ? <p className="mt-4 text-sm text-text-60">{guide.note}</p> : null}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
