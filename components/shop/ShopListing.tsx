"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { FiltersPanel } from "@/components/shop/FiltersPanel";
import { FilterSheet } from "@/components/shop/FilterSheet";
import { PaginationBar } from "@/components/shop/PaginationBar";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";
import {
  categoryLabel,
  DEFAULT_COLOR,
  DEFAULT_PRICE,
  DEFAULT_SIZE,
  filterProducts,
  shopProducts,
  styleLabel,
  type CategoryId,
  type DressStyleId,
} from "@/lib/shop-data";

const PAGE_SIZE = 9;

export function ShopListing({
  style,
  category,
}: {
  style?: DressStyleId;
  category?: CategoryId;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expanded, setExpanded] = useState({
    price: true,
    colors: true,
    size: true,
    style: true,
  });
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [price, setPrice] = useState<[number, number]>(DEFAULT_PRICE);
  const [sort, setSort] = useState<"most-popular" | "low-price" | "high-price">(
    "most-popular",
  );
  const [page, setPage] = useState(1);
  const [applied, setApplied] = useState(false);

  const title = category ? categoryLabel(category) : styleLabel(style ?? "casual");

  const products = useMemo(
    () =>
      filterProducts(
        shopProducts,
        { style, category, color, size, price, sort },
        { applyFacets: applied },
      ),
    [applied, category, color, price, size, sort, style],
  );

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const start = products.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, products.length);

  const panelProps = {
    style,
    category,
    color,
    size,
    price,
    expanded,
    onToggle: (key: keyof typeof expanded) =>
      setExpanded((value) => ({ ...value, [key]: !value[key] })),
    onColor: (id: string) => setColor(id),
    onSize: (value: string) => setSize(value),
    onPrice: (value: [number, number]) => setPrice(value),
    onApply: () => {
      setApplied(true);
      setPage(1);
      setFiltersOpen(false);
    },
    categoryHref: (id: CategoryId) => {
      const params = new URLSearchParams();
      if (style) params.set("style", style);
      params.set("category", id);
      return `/shop?${params.toString()}`;
    },
    styleHref: (id: DressStyleId) => {
      const params = new URLSearchParams();
      params.set("style", id);
      if (category) params.set("category", category);
      return `/shop?${params.toString()}`;
    },
  };

  return (
    <div>
      <Container>
        <hr className="border-line" />
        <div className="pt-5 pb-2 xl:pt-6">
          <ShopBreadcrumb current={title} />
        </div>

        <div className="flex items-start gap-5 pt-2 pb-12 xl:pt-4 xl:pb-16">
          <aside className="hidden w-[295px] shrink-0 rounded-[20px] border border-line px-6 py-5 lg:block">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xl font-bold">Filters</span>
              <span className="relative size-6 overflow-clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/filters.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="size-full"
                />
              </span>
            </div>
            <FiltersPanel {...panelProps} />
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold xl:text-[32px] xl:leading-none">
                  {title}
                </h1>
                <button
                  type="button"
                  aria-label="Open filters"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex size-8 items-center justify-center rounded-full bg-muted lg:hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/filters.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="size-4"
                  />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-60 xl:text-base">
                <span>
                  Showing {start}-{end} of {products.length} Products
                </span>
                <label className="hidden items-center sm:flex">
                  Sort by:
                  <select
                    value={sort}
                    onChange={(event) => {
                      setSort(
                        event.target.value as
                          | "most-popular"
                          | "low-price"
                          | "high-price",
                      );
                      setPage(1);
                    }}
                    className="cursor-pointer appearance-none bg-transparent py-0 pr-6 pl-1 font-medium text-black outline-none"
                    style={{
                      backgroundImage: "url(/icons/chevron.svg)",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right center",
                      backgroundSize: "16px 16px",
                    }}
                  >
                    <option value="most-popular">Most Popular</option>
                    <option value="low-price">Low Price</option>
                    <option value="high-price">High Price</option>
                  </select>
                </label>
              </div>
            </div>

            {pageItems.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
                {pageItems.map((product) => (
                  <ProductCard key={product.id} product={product} layout="grid" />
                ))}
              </div>
            ) : (
              <p className="mt-10 text-base text-text-60">
                No products match those filters.
              </p>
            )}

            <hr className="mt-6 border-line xl:mt-8" />
            <div className="pt-4 xl:pt-5">
              <PaginationBar
                page={currentPage}
                totalPages={totalPages}
                onPage={setPage}
              />
            </div>
          </div>
        </div>
      </Container>

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        {...panelProps}
      />
    </div>
  );
}
