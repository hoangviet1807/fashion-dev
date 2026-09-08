"use client";

import { useEffect, type ComponentProps } from "react";
import { FiltersPanel } from "@/components/shop/FiltersPanel";

type PanelProps = ComponentProps<typeof FiltersPanel>;

export function FilterSheet({
  open,
  onClose,
  ...panelProps
}: PanelProps & {
  open: boolean;
  onClose: () => void;
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close filters"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-sheet-title"
        className="absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-[20px] bg-white"
      >
        <div className="flex justify-center pt-3">
          <span className="h-1.5 w-12 rounded-full bg-muted" />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <h2 id="filters-sheet-title" className="text-xl font-bold">
            Filters
          </h2>
          <button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="inline-flex size-6 items-center justify-center overflow-clip"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/close-black.svg"
              alt=""
              width={24}
              height={24}
              className="size-full brightness-0"
            />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 pb-6">
          <FiltersPanel {...panelProps} />
        </div>
      </div>
    </div>
  );
}
