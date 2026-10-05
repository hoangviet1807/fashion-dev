import Link from "next/link";
import type { BrandLogo } from "@/lib/data/content";
import { Container } from "@/components/layout/Container";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { buildShopHref } from "@/lib/shop-params";

export function BrandBar({ brands }: { brands: BrandLogo[] }) {
  return (
    <section id="brands" className="bg-black py-11 xl:py-[42px]">
      <Container>
        <RevealGroup
          as="ul"
          stagger={0.07}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 xl:justify-between xl:gap-0"
        >
          {brands.map((brand) => {
            const logo = (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.src}
                alt={brand.alt}
                width={brand.width}
                height={brand.height}
                className="h-6 w-auto xl:h-8"
              />
            );
            return (
              <RevealItem as="li" key={brand.alt} className="flex items-center justify-center">
                {brand.slug ? (
                  <Link
                    href={buildShopHref({ brand: brand.slug })}
                    aria-label={`Sản phẩm ${brand.alt}`}
                    className="flex"
                  >
                    {logo}
                  </Link>
                ) : (
                  logo
                )}
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
