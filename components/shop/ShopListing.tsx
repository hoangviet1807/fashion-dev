"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { FiltersPanel } from "@/components/shop/FiltersPanel";
import { FilterSheet } from "@/components/shop/FilterSheet";
import { PaginationBar } from "@/components/shop/PaginationBar";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";
import { RevealGroup } from "@/components/motion/Reveal";
import {
  categoryLabel,
  DEFAULT_COLOR,
  DEFAULT_PRICE,
  DEFAULT_SIZE,
  styleLabel,
  type CategoryId,
  type DressStyleId,
} from "@/lib/catalog";
import { buildShopHref, type ShopQuery } from "@/lib/shop-params";
import type { ProductSort, ProductSummary } from "@/lib/types/product";
import { Dropdown, type DropdownOption } from "@/components/ui/Dropdown";

const SORT_OPTIONS: DropdownOption<ProductSort>[] = [
  { value: "most-popular", label: "Phổ biến nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "low-price", label: "Giá thấp đến cao" },
  { value: "high-price", label: "Giá cao đến thấp" },
];

export function ShopListing({
  query,
  brandName,
  products,
  total,
  pageSize,
}: {
  query: ShopQuery;
  brandName?: string;
  /** Items for the current page, already filtered and sorted on the server. */
  products: ProductSummary[];
  total: number;
  pageSize: number;
}) {
  const router = useRouter();
  const { q, sale, brand, style, category, sort } = query;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expanded, setExpanded] = useState({
    price: true,
    colors: true,
    size: true,
    style: true,
  });
  const [color, setColor] = useState(query.facets?.color ?? DEFAULT_COLOR);
  const [size, setSize] = useState(query.facets?.size ?? DEFAULT_SIZE);
  const [price, setPrice] = useState<[number, number]>(
    query.facets?.price ?? DEFAULT_PRICE,
  );

  const title = q
    ? `Kết quả cho “${q}”`
    : category
      ? categoryLabel(category)
      : brand
        ? (brandName ?? brand)
        : sale
          ? "Khuyến mãi"
          : style
            ? styleLabel(style)
            : sort === "newest"
              ? "Hàng mới về"
              : "Cửa hàng";

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(query.page, totalPages);
  const pageItems = products;

  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  function navigate(next: Partial<ShopQuery>) {
    router.push(buildShopHref({ ...query, ...next }), { scroll: false });
  }

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
      navigate({ facets: { color, size, price }, page: 1 });
      setFiltersOpen(false);
    },
    categoryHref: (id: CategoryId) =>
      buildShopHref({ q, sale, brand, style, category: id }),
    styleHref: (id: DressStyleId) =>
      buildShopHref({ q, sale, brand, style: id, category }),
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
              <span className="text-xl font-bold">Bộ lọc</span>
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
                  aria-label="Mở bộ lọc"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex size-8 items-center justify-center rounded-full bg-muted transition-[background-color,transform] duration-200 hover:bg-black/10 active:scale-95 lg:hidden"
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
                  Hiển thị {start}-{end} trên {total} sản phẩm
                </span>
                <div className="hidden items-center gap-0.5 sm:flex">
                  <span aria-hidden>Sắp xếp:</span>
                  <Dropdown
                    label="Sắp xếp"
                    trigger="inline"
                    align="end"
                    value={sort}
                    options={SORT_OPTIONS}
                    onChange={(value) => navigate({ sort: value, page: 1 })}
                  />
                </div>
              </div>
            </div>

            {pageItems.length > 0 ? (
              <RevealGroup
                key={pageItems.map((product) => product.id).join()}
                stagger={0.06}
                className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5"
              >
                {pageItems.map((product) => (
                  <ProductCard key={product.id} product={product} layout="grid" />
                ))}
              </RevealGroup>
            ) : (
              <p className="mt-10 text-base text-text-60">
                {q
                  ? `Không tìm thấy sản phẩm nào cho “${q}”.`
                  : "Không có sản phẩm phù hợp với bộ lọc."}
              </p>
            )}

            <hr className="mt-6 border-line xl:mt-8" />
            <div className="pt-4 xl:pt-5">
              <PaginationBar
                page={currentPage}
                totalPages={totalPages}
                onPage={(page) => navigate({ page })}
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
