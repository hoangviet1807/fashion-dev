"use client";

import { useEffect, type ComponentProps } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
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
  const dragControls = useDragControls();

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
        <div key="filter-sheet" className="fixed inset-0 z-50 lg:hidden">
          <motion.button
            type="button"
            aria-label="Đóng bộ lọc"
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
            aria-labelledby="filters-sheet-title"
            className="absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-[20px] bg-white"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            <div
              className="flex cursor-grab touch-none justify-center pt-3 active:cursor-grabbing"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <span className="h-1.5 w-12 rounded-full bg-muted" />
            </div>
            <div
              className="flex touch-none items-center justify-between px-5 py-4"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <h2 id="filters-sheet-title" className="text-xl font-bold">
                Bộ lọc
              </h2>
              <button
                type="button"
                aria-label="Đóng bộ lọc"
                onClick={onClose}
                onPointerDown={(event) => event.stopPropagation()}
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
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
