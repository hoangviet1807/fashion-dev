"use client";

import { useCallback, useState } from "react";
import { ProductPerks } from "@/components/product/ProductPerks";
import { SizeGuideDialog } from "@/components/product/SizeGuideDialog";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { STEPPER_BUTTON, chipClasses, swatchClasses } from "@/components/ui/choice";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { toAnalyticsItem, trackEcommerce } from "@/lib/analytics";
import { useCartNotice } from "@/lib/cart/notice";
import { useCartQuantity, useCartStore } from "@/lib/cart/store";
import { colorLabel, colorSwatch } from "@/lib/catalog";
import type { ProductPageSettings } from "@/lib/data/content";
import { productColors, productSizes } from "@/lib/product";
import type { Product } from "@/lib/types/product";

const PREFERRED_SIZE = "L";

function inStock(product: Product, color: string, size: string) {
  return product.variants.some(
    (item) => item.color === color && item.size === size && item.stock > 0,
  );
}

function pickSize(product: Product, sizes: string[], color: string, current?: string) {
  const available = sizes.filter((item) => inStock(product, color, item));
  if (current && available.includes(current)) return current;
  if (available.includes(PREFERRED_SIZE)) return PREFERRED_SIZE;
  return available[0] ?? current ?? sizes[0] ?? "";
}

export function ProductPurchase({
  product,
  settings,
}: {
  product: Product;
  settings: ProductPageSettings;
}) {
  const swatches = productColors(product).map(colorSwatch);
  const sizes = productSizes(product);
  const [color, setColor] = useState(swatches[0]?.id ?? "");
  const [size, setSize] = useState(() => pickSize(product, sizes, swatches[0]?.id ?? ""));
  const [guideOpen, setGuideOpen] = useState(false);
  const closeGuide = useCallback(() => setGuideOpen(false), []);
  const [qtyInput, setQty] = useState(1);
  const addToCart = useCartStore((state) => state.add);
  const showNotice = useCartNotice((state) => state.show);

  const variant = size
    ? product.variants.find((item) => item.color === color && item.size === size)
    : undefined;
  const inCart = useCartQuantity(variant?.sku);
  const available = variant ? Math.max(0, variant.stock - inCart) : 0;
  const qty = Math.max(1, Math.min(qtyInput, available));

  function onAdd() {
    if (!variant || available === 0) return;
    const line = {
      sku: variant.sku,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      color: variant.color,
      size: variant.size,
    };
    const added = addToCart({ ...line, stock: variant.stock }, qty);
    if (added > 0) {
      setQty(1);
      showNotice(line, added);
      trackEcommerce("add_to_cart", {
        value: product.price * added,
        items: [
          toAnalyticsItem({ ...variant, name: product.name, price: product.price, quantity: added }),
        ],
      });
    }
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
                onClick={() => {
                  setColor(swatch.id);
                  setSize((current) => pickSize(product, sizes, swatch.id, current));
                }}
                className={`size-[37px] xl:size-[39px] ${swatchClasses(selected)}`}
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
        <div className="flex items-center justify-between gap-4">
          <p className="text-base text-text-60">Chọn kích cỡ</p>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="text-sm underline underline-offset-4 transition-colors hover:text-text-60"
          >
            Hướng dẫn chọn size
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {sizes.map((item) => {
            const selected = size === item;
            const soldOut = !inStock(product, color, item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                aria-label={soldOut ? `${item} (hết hàng)` : undefined}
                disabled={soldOut}
                onClick={() => setSize(item)}
                className={`relative h-[40px] min-w-[64px] overflow-hidden px-5 text-sm xl:h-[46px] xl:min-w-[72px] xl:px-6 xl:text-base ${
                  soldOut
                    ? "inline-flex cursor-not-allowed items-center justify-center rounded-[62px] bg-muted text-text-40"
                    : chipClasses(selected)
                }`}
              >
                {item}
                {soldOut ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-1/2 h-px w-[120%] -translate-x-1/2 -translate-y-1/2 -rotate-[20deg] bg-text-40"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      <SizeGuideDialog
        open={guideOpen}
        onClose={closeGuide}
        guide={settings.sizeGuide}
        activeSize={size}
      />

      <hr className="border-line" />

      <div className="flex gap-3 xl:gap-5">
        <div className="flex h-[44px] w-[110px] items-center justify-between rounded-[62px] bg-muted px-4 xl:h-[52px] xl:w-[170px] xl:px-5">
          <button
            type="button"
            aria-label="Giảm số lượng"
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className={STEPPER_BUTTON}
          >
            −
          </button>
          <span className="text-sm font-medium xl:text-base">{qty}</span>
          <button
            type="button"
            aria-label="Tăng số lượng"
            onClick={() => setQty(Math.min(qty + 1, Math.max(1, available)))}
            disabled={qty >= available}
            className={STEPPER_BUTTON}
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
        <WishlistButton slug={product.slug} name={product.name} variant="detail" />
      </div>

      <ProductPerks perks={settings.perks} />
    </div>
  );
}
