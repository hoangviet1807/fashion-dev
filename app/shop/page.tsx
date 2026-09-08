import type { Metadata } from "next";
import { ShopListing } from "@/components/shop/ShopListing";
import { isCategory, isDressStyle } from "@/lib/shop-data";

export const metadata: Metadata = {
  title: "Shop | SHOP.CO",
  description: "Browse Casual, Formal, Party, and Gym styles at SHOP.CO.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ style?: string; category?: string }>;
}) {
  const params = await searchParams;
  const styleParam = isDressStyle(params.style) ? params.style : undefined;
  const category = isCategory(params.category) ? params.category : undefined;
  // Default to casual only when browsing by style; category-only keeps all styles.
  const style = styleParam ?? (category ? undefined : "casual");

  return (
    <ShopListing
      key={`${style ?? ""}-${category ?? ""}`}
      style={style}
      category={category}
    />
  );
}
