"use client";

import Image from "next/image";

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
              aria-label={`View image ${index + 1}`}
              aria-pressed={selected}
              className={`relative h-[106px] flex-1 overflow-hidden rounded-[20px] bg-product xl:h-[167px] xl:w-[152px] xl:flex-none ${
                selected ? "ring-1 ring-black" : ""
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 1280px) 33vw, 152px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      <div className="relative order-1 aspect-[358/290] w-full overflow-hidden rounded-[20px] bg-product xl:order-2 xl:h-[530px] xl:w-[444px] xl:aspect-auto xl:shrink-0">
        <Image
          src={active}
          alt={name}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 444px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
