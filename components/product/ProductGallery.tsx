"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/components/motion/Reveal";

export function ProductGallery({
  images,
  name,
  activeIndex,
  onSelect,
}: {
  images: string[];
  name: string;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const active = images[activeIndex] ?? images[0];

  return (
    <div className="flex w-full flex-col gap-3.5 xl:w-auto xl:flex-row xl:gap-3.5">
      <div className="order-2 flex gap-3 xl:order-1 xl:w-[152px] xl:shrink-0 xl:flex-col xl:gap-3.5">
        {images.map((src, index) => {
          const selected = index === activeIndex;
          return (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Xem ảnh ${index + 1}`}
              aria-pressed={selected}
              className="group relative h-[106px] flex-1 rounded-[20px] bg-product xl:h-[167px] xl:w-[152px] xl:flex-none"
            >
              <span className="absolute inset-0 overflow-hidden rounded-[20px]">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 1280px) 33vw, 152px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </span>
              {selected ? (
                <motion.span
                  layoutId="gallery-thumb-ring"
                  className="pointer-events-none absolute inset-0 z-10 rounded-[20px] ring-1 ring-black"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="relative order-1 aspect-[358/290] w-full overflow-hidden rounded-[20px] bg-product xl:order-2 xl:h-[530px] xl:w-[444px] xl:aspect-auto xl:shrink-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <Image
              src={active}
              alt={name}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 444px"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
