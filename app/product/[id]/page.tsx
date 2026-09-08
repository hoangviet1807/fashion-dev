import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import {
  getAllProductIds,
  getProduct,
  getRelatedProducts,
} from "@/lib/product-data";

export function generateStaticParams() {
  return getAllProductIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) {
    return { title: "Product | SHOP.CO" };
  }
  return {
    title: `${product.name} | SHOP.CO`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[id]">) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) {
    notFound();
  }

  return (
    <ProductDetailView
      product={product}
      related={getRelatedProducts(product)}
    />
  );
}
