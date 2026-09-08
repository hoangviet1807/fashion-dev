"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ProductDetail } from "@/lib/product-data";

export function ProductPurchase({ product }: { product: ProductDetail }) {
  const [color, setColor] = useState(product.defaultColor);
  const [size, setSize] = useState(product.defaultSize);
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-base text-text-60">Select Colors</p>
        <div className="mt-4 flex flex-wrap gap-4">
          {product.colorHex.map((swatch) => {
            const selected = color === swatch.id;
            return (
              <button
                key={swatch.id}
                type="button"
                aria-label={swatch.id}
                aria-pressed={selected}
                onClick={() => setColor(swatch.id)}
                className="flex size-[37px] items-center justify-center rounded-full border border-black/20 xl:size-[39px]"
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
      </div>

      <hr className="border-line" />

      <div>
        <p className="text-base text-text-60">Choose Size</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {product.pdpSizes.map((item) => {
            const selected = size === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => setSize(item)}
                className={`inline-flex h-[40px] items-center justify-center rounded-[62px] px-5 text-sm xl:h-[46px] xl:px-6 xl:text-base ${
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
      </div>

      <hr className="border-line" />

      <div className="flex gap-3 xl:gap-5">
        <div className="flex h-[44px] w-[110px] items-center justify-between rounded-[62px] bg-muted px-4 xl:h-[52px] xl:w-[170px] xl:px-5">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((value) => Math.max(1, value - 1))}
            className="text-xl leading-none"
          >
            −
          </button>
          <span className="text-sm font-medium xl:text-base">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((value) => value + 1)}
            className="text-xl leading-none"
          >
            +
          </button>
        </div>
        <Button className="h-[44px] flex-1 px-6 text-sm xl:h-[52px] xl:text-base">
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
