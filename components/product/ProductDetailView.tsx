"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductPageSettings } from "@/lib/data/content";
import { discountPercent } from "@/lib/product";
import type { Product, ProductSummary } from "@/lib/types/product";
import { Container } from "@/components/layout/Container";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Rating } from "@/components/ui/Rating";
import { Price } from "@/components/ui/Price";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

const thousands = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });

/** 950 → "950", 1250 → "1,3k". */
function formatSold(count: number) {
  return count < 1000 ? String(count) : `${thousands.format(count / 1000)}k`;
}

export function ProductDetailView({
  product,
  related,
  settings,
}: {
  product: Product;
  related: ProductSummary[];
  settings: ProductPageSettings;
}) {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const breadcrumb: { label: string; href?: string }[] = [
    { label: "Trang chủ", href: "/" },
    { label: "Cửa hàng", href: "/shop" },
    { label: "Nam", href: "/shop?style=casual" },
    { label: product.categoryTitle },
  ];

  return (
    <div>
      <Container>
        <hr className="border-line" />
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1 pt-5 text-sm xl:pt-6 xl:text-base"
        >
          {breadcrumb.map((crumb, index) => {
            const last = index === breadcrumb.length - 1;
            return (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 ? (
                  <span className="relative size-4 rotate-[-90deg] overflow-clip">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/icons/chevron.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="size-full"
                    />
                  </span>
                ) : null}
                {crumb.href && !last ? (
                  <Link href={crumb.href} className="capitalize text-text-60">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={`capitalize ${last ? "text-black" : "text-text-60"}`}>
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>

        <div className="flex flex-col gap-5 pt-6 pb-2 xl:flex-row xl:items-start xl:gap-10 xl:pt-9">
          <ProductGallery
            images={product.images}
            name={product.name}
            activeIndex={galleryIndex}
            onSelect={setGalleryIndex}
          />

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[24px] leading-[28px] uppercase xl:text-[40px] xl:leading-[48px]">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm leading-none text-text-60 xl:mt-3.5">
              <Rating value={product.rating} />
              {product.reviewCount > 0 ? <span>({product.reviewCount} đánh giá)</span> : null}
              {product.soldCount > 0 ? (
                <>
                  <span aria-hidden className="h-3.5 w-px bg-line" />
                  <span>
                    Đã bán <span className="font-medium text-black">{formatSold(product.soldCount)}</span>
                  </span>
                </>
              ) : null}
              {product.code ? (
                <>
                  <span aria-hidden className="h-3.5 w-px bg-line" />
                  <span>
                    Mã: <span className="font-medium text-black">{product.code}</span>
                  </span>
                </>
              ) : null}
            </div>
            <div className="mt-3 xl:mt-3.5">
              <Price
                price={product.price}
                originalPrice={product.compareAtPrice}
                discount={discountPercent(product)}
                size="detail"
              />
            </div>
            <p className="mt-5 text-sm leading-[20px] text-text-60 xl:mt-5 xl:text-base xl:leading-[22px]">
              {product.description}
            </p>
            <hr className="my-6 border-line" />
            <ProductPurchase product={product} settings={settings} />
          </div>
        </div>

        <ProductTabs product={product} />
      </Container>

      {related.length > 0 ? (
        <section className="pt-12 pb-12 xl:pt-16 xl:pb-16">
          <Container>
            <RevealGroup stagger={0.1}>
              <RevealItem>
                <SectionHeading className="mb-8 xl:mb-14">
                  Có thể bạn cũng thích
                </SectionHeading>
              </RevealItem>
              <RevealGroup
                nested
                className="flex gap-4 overflow-x-auto pb-2 scrollbar-none xl:grid xl:grid-cols-4 xl:gap-5 xl:overflow-visible xl:pb-0"
              >
                {related.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </RevealGroup>
            </RevealGroup>
          </Container>
        </section>
      ) : null}
    </div>
  );
}
