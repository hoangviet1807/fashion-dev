"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PriceSlider } from "@/components/shop/PriceSlider";
import { Chevron } from "@/components/shop/ShopBreadcrumb";
import {
  CATEGORIES,
  COLORS,
  DRESS_STYLES,
  PRICE_BOUNDS,
  SIZES,
  type CategoryId,
  type DressStyleId,
} from "@/lib/shop-data";

type Expanded = {
  price: boolean;
  colors: boolean;
  size: boolean;
  style: boolean;
};

export function FiltersPanel({
  style,
  category,
  color,
  size,
  price,
  expanded,
  onToggle,
  onColor,
  onSize,
  onPrice,
  onApply,
  categoryHref,
  styleHref,
}: {
  style?: DressStyleId;
  category?: CategoryId;
  color: string;
  size: string;
  price: [number, number];
  expanded: Expanded;
  onToggle: (key: keyof Expanded) => void;
  onColor: (id: string) => void;
  onSize: (value: string) => void;
  onPrice: (value: [number, number]) => void;
  onApply: () => void;
  categoryHref: (id: CategoryId) => string;
  styleHref: (id: DressStyleId) => string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <hr className="border-line" />

      <div className="flex flex-col">
        {CATEGORIES.map((item) => (
          <Link
            key={item.id}
            href={categoryHref(item.id)}
            className={`flex items-center justify-between py-2 text-base ${
              category === item.id ? "font-medium text-black" : "text-text-60"
            }`}
          >
            {item.label}
            <Chevron direction="right" />
          </Link>
        ))}
      </div>

      <hr className="border-line" />

      <section>
        <button
          type="button"
          className="flex w-full items-center justify-between"
          onClick={() => onToggle("price")}
          aria-expanded={expanded.price}
        >
          <span className="text-xl font-bold">Price</span>
          <Chevron direction={expanded.price ? "up" : "down"} />
        </button>
        {expanded.price ? (
          <div className="pt-4">
            <PriceSlider
              min={PRICE_BOUNDS.min}
              max={PRICE_BOUNDS.max}
              value={price}
              onChange={onPrice}
            />
          </div>
        ) : null}
      </section>

      <hr className="border-line" />

      <section>
        <button
          type="button"
          className="flex w-full items-center justify-between"
          onClick={() => onToggle("colors")}
          aria-expanded={expanded.colors}
        >
          <span className="text-xl font-bold">Colors</span>
          <Chevron direction={expanded.colors ? "up" : "down"} />
        </button>
        {expanded.colors ? (
          <div className="grid grid-cols-5 gap-2.5 pt-4">
            {COLORS.map((swatch) => {
              const selected = color === swatch.id;
              return (
                <button
                  key={swatch.id}
                  type="button"
                  aria-label={swatch.id}
                  aria-pressed={selected}
                  onClick={() => onColor(swatch.id)}
                  className="flex size-9 items-center justify-center rounded-full border border-black/20 xl:size-10"
                  style={{ backgroundColor: swatch.hex }}
                >
                  {selected ? (
                    <Icon
                      src="/icons/check.svg"
                      size={14}
                      className={swatch.check === "black" ? "brightness-0" : ""}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      <hr className="border-line" />

      <section>
        <button
          type="button"
          className="flex w-full items-center justify-between"
          onClick={() => onToggle("size")}
          aria-expanded={expanded.size}
        >
          <span className="text-xl font-bold">Size</span>
          <Chevron direction={expanded.size ? "up" : "down"} />
        </button>
        {expanded.size ? (
          <div className="flex flex-wrap gap-2 pt-4">
            {SIZES.map((item) => {
              const selected = size === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSize(item)}
                  className={`inline-flex h-[39px] items-center justify-center rounded-[62px] px-5 text-sm ${
                    selected
                      ? "bg-black font-medium text-white"
                      : "bg-muted text-text-60"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      <hr className="border-line" />

      <section>
        <button
          type="button"
          className="flex w-full items-center justify-between"
          onClick={() => onToggle("style")}
          aria-expanded={expanded.style}
        >
          <span className="text-xl font-bold">Dress Style</span>
          <Chevron direction={expanded.style ? "up" : "down"} />
        </button>
        {expanded.style ? (
          <div className="flex flex-col pt-2">
            {DRESS_STYLES.map((item) => (
              <Link
                key={item.id}
                href={styleHref(item.id)}
                className={`flex items-center justify-between py-2 text-base ${
                  style === item.id ? "font-medium text-black" : "text-text-60"
                }`}
              >
                {item.label}
                <Chevron direction="right" />
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <Button onClick={onApply} fullWidth className="px-6 text-sm xl:text-base">
        Apply Filter
      </Button>
    </div>
  );
}
