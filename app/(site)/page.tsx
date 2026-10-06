import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { BrandBar } from "@/components/home/BrandBar";
import { ProductSection } from "@/components/home/ProductSection";
import { DressStyleGrid } from "@/components/home/DressStyleGrid";
import { Testimonials } from "@/components/home/Testimonials";
import { getBrands, getTestimonials } from "@/lib/data/content";
import { getCollection } from "@/lib/data/products";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [brands, newArrivals, topSelling, testimonials] = await Promise.all([
    getBrands(),
    getCollection("newArrivals"),
    getCollection("topSelling"),
    getTestimonials(),
  ]);

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <Hero />
      <BrandBar brands={brands} />
      <ProductSection
        id="new-arrivals"
        title="HÀNG MỚI VỀ"
        products={newArrivals}
        divider
      />
      <ProductSection
        id="top-selling"
        title="BÁN CHẠY NHẤT"
        products={topSelling}
      />
      <DressStyleGrid />
      <Testimonials reviews={testimonials} />
    </>
  );
}
