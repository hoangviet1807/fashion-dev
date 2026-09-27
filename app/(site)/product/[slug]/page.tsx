import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelated,
} from "@/lib/data/products";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Sản phẩm | SHOP.CO" };
  }
  return {
    title: `${product.name} | SHOP.CO`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  return (
    <ProductDetailView product={product} related={await getRelated(product)} />
  );
}
