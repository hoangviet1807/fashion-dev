"use client";

import Image from "next/image";
import Link from "next/link";
import { colorLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";
import type { CartLine } from "@/lib/cart/store";
import { Icon } from "@/components/ui/Icon";
import { STEPPER_BUTTON } from "@/components/ui/choice";

export function CartLineItem({
  item,
  onQty,
  onRemove,
}: {
  item: CartLine;
  onQty: (sku: string, quantity: number) => void;
  onRemove: (sku: string) => void;
}) {
  return (
    <div className="flex items-start gap-3.5 xl:gap-4">
      <Link
        href={`/product/${item.slug}`}
        className="relative size-[99px] shrink-0 overflow-hidden rounded-[8.66px] bg-product xl:size-[124px] xl:rounded-[8.66px]"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="124px"
        />
      </Link>

      <div className="flex min-h-[99px] min-w-0 flex-1 flex-col justify-between xl:min-h-[124px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/product/${item.slug}`}
              className="block truncate text-base font-bold leading-[22px] text-black xl:text-xl xl:leading-[27px]"
            >
              {item.name}
            </Link>
            <p className="mt-0.5 text-xs leading-[16px] xl:text-sm xl:leading-[19px]">
              <span className="text-black">Kích cỡ: </span>
              <span className="text-text-60">{item.size}</span>
            </p>
            <p className="text-xs leading-[16px] xl:text-sm xl:leading-[19px]">
              <span className="text-black">Màu: </span>
              <span className="text-text-60">{colorLabel(item.color)}</span>
            </p>
          </div>

          <button
            type="button"
            aria-label={`Xoá ${item.name}`}
            onClick={() => onRemove(item.sku)}
            className="relative isolate shrink-0 rounded-full transition-transform duration-200 before:absolute before:-inset-2 before:-z-10 before:rounded-full before:bg-discount-bg before:opacity-0 before:transition-opacity before:duration-200 before:content-[''] hover:before:opacity-100 active:scale-90 motion-reduce:active:scale-100"
          >
            <Icon src="/icons/trash.svg" size={24} />
          </button>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3 xl:mt-0">
          <span className="text-xl font-bold leading-none xl:text-2xl">
            {formatPrice(item.price)}
          </span>

          <div className="flex h-8 w-[105px] items-center justify-between rounded-[62px] bg-muted px-4 xl:h-10 xl:w-[126px] xl:px-5">
            <button
              type="button"
              aria-label="Giảm số lượng"
              onClick={() => onQty(item.sku, item.quantity - 1)}
              className={STEPPER_BUTTON}
            >
              −
            </button>
            <span className="text-sm font-medium">{item.quantity}</span>
            <button
              type="button"
              aria-label="Tăng số lượng"
              onClick={() => onQty(item.sku, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className={STEPPER_BUTTON}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
