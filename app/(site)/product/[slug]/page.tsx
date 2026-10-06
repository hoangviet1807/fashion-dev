import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelated,
} from "@/lib/data/products";
import { breadcrumbJsonLd, productJsonLd, productMetadata } from "@/lib/seo";

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
  return productMetadata(product);
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
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Trang chủ", path: "/" },
          { name: "Cửa hàng", path: "/shop" },
          { name: product.categoryTitle, path: `/shop?category=${product.category}` },
          { name: product.name },
        ])}
      />
      <ProductDetailView product={product} related={await getRelated(product)} />
    </>
  );
}
