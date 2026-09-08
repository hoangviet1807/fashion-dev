import { Hero } from "@/components/home/Hero";
import { BrandBar } from "@/components/home/BrandBar";
import { ProductSection } from "@/components/home/ProductSection";
import { DressStyleGrid } from "@/components/home/DressStyleGrid";
import { Testimonials } from "@/components/home/Testimonials";
import { newArrivals, topSelling } from "@/lib/home-data";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandBar />
      <ProductSection
        id="new-arrivals"
        title="NEW ARRIVALS"
        products={newArrivals}
        divider
      />
      <ProductSection
        id="top-selling"
        title="TOP SELLING"
        products={topSelling}
      />
      <DressStyleGrid />
      <Testimonials />
    </>
  );
}
