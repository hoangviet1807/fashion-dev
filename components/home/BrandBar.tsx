import type { BrandLogo } from "@/lib/data/content";
import { Container } from "@/components/layout/Container";

export function BrandBar({ brands }: { brands: BrandLogo[] }) {
  return (
    <section id="brands" className="bg-black py-11 xl:py-[42px]">
      <Container>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 xl:justify-between xl:gap-0">
          {brands.map((brand) => (
            <li key={brand.alt} className="flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.src}
                alt={brand.alt}
                width={brand.width}
                height={brand.height}
                className="h-6 w-auto xl:h-8"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
