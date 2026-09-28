import type { Metadata } from "next";
import { ShopListing } from "@/components/shop/ShopListing";
import { getProducts } from "@/lib/data/products";
import { parseShopParams } from "@/lib/shop-params";

export const metadata: Metadata = {
  title: "Cửa hàng | SHOP.CO",
  description: "Khám phá trang phục thường ngày, công sở, dự tiệc và thể thao tại SHOP.CO.",
};

const PAGE_SIZE = 9;

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const query = parseShopParams(await searchParams);
  const { items, total } = await getProducts({
    q: query.q,
    style: query.style,
    category: query.category,
    ...query.facets,
    sort: query.sort,
    page: query.page,
    pageSize: PAGE_SIZE,
  });

  return (
    <ShopListing
      key={`${query.q ?? ""}-${query.style ?? ""}-${query.category ?? ""}`}
      query={query}
      products={items}
      total={total}
      pageSize={PAGE_SIZE}
    />
  );
}
