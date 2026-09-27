"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useCartQuantity, useCartStore } from "@/lib/cart/store";
import { colorLabel, colorSwatch } from "@/lib/catalog";
import { productColors, productSizes } from "@/lib/product";
import type { Product } from "@/lib/types/product";

export function ProductPurchase({ product }: { product: Product }) {
  const swatches = productColors(product).map(colorSwatch);
  const sizes = productSizes(product);
  const [color, setColor] = useState(swatches[0]?.id ?? "");
  const [size, setSize] = useState(
    sizes.includes("Large") ? "Large" : (sizes[0] ?? ""),
  );
  const [qtyInput, setQty] = useState(1);
  const addToCart = useCartStore((state) => state.add);

  const variant = size
    ? product.variants.find((item) => item.color === color && item.size === size)
    : undefined;
  const inCart = useCartQuantity(variant?.sku);
  const available = variant ? Math.max(0, variant.stock - inCart) : 0;
  const qty = Math.max(1, Math.min(qtyInput, available));

  function onAdd() {
    if (!variant || available === 0) return;
    const added = addToCart(
      {
        sku: variant.sku,
        slug: product.slug,
        name: product.name,
        image: product.images[0],
        price: product.price,
        color: variant.color,
        size: variant.size,
        stock: variant.stock,
      },
      qty,
    );
    if (added > 0) setQty(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-base text-text-60">Chọn màu</p>
        <div className="mt-4 flex flex-wrap gap-4">
          {swatches.map((swatch) => {
            const selected = color === swatch.id;
            return (
              <button
                key={swatch.id}
                type="button"
                aria-label={colorLabel(swatch.id)}
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
        <p className="text-base text-text-60">Chọn kích cỡ</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {sizes.map((item) => {
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
            aria-label="Giảm số lượng"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="text-xl leading-none"
          >
            −
          </button>
          <span className="text-sm font-medium xl:text-base">{qty}</span>
          <button
            type="button"
            aria-label="Tăng số lượng"
            onClick={() => setQty(Math.min(qty + 1, Math.max(1, available)))}
            disabled={qty >= available}
            className="text-xl leading-none"
          >
            +
          </button>
        </div>
        <Button
          onClick={onAdd}
          disabled={!variant || available === 0}
          className="h-[44px] flex-1 px-6 text-sm xl:h-[52px] xl:text-base"
        >
          Thêm vào giỏ
        </Button>
      </div>
    </div>
  );
}
