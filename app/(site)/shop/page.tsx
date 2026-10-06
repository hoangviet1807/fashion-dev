import type { Metadata } from "next";
import { ShopListing } from "@/components/shop/ShopListing";
import { getBrandName } from "@/lib/data/content";
import { getProducts } from "@/lib/data/products";
import { parseShopParams } from "@/lib/shop-params";
import { BASE_OPEN_GRAPH, NO_INDEX } from "@/lib/seo";

const description = "Khám phá trang phục thường ngày, công sở, dự tiệc và thể thao tại SHOP.CO.";

const metadata: Metadata = {
  title: "Cửa hàng | SHOP.CO",
  description,
  openGraph: { ...BASE_OPEN_GRAPH, type: "website", url: "/shop", title: "Cửa hàng", description },
};

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const { q } = parseShopParams(await searchParams);
  return q ? { ...metadata, robots: NO_INDEX } : metadata;
}

const PAGE_SIZE = 9;

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const query = parseShopParams(await searchParams);
  const [{ items, total }, brandName] = await Promise.all([
    getProducts({
      q: query.q,
      sale: query.sale,
      brand: query.brand,
      style: query.style,
      category: query.category,
      ...query.facets,
      sort: query.sort,
      page: query.page,
      pageSize: PAGE_SIZE,
    }),
    query.brand ? getBrandName(query.brand) : null,
  ]);

  return (
    <ShopListing
      key={`${query.q ?? ""}-${query.sale ? "sale" : ""}-${query.brand ?? ""}-${query.style ?? ""}-${query.category ?? ""}`}
      query={query}
      brandName={brandName ?? undefined}
      products={items}
      total={total}
      pageSize={PAGE_SIZE}
    />
  );
}
