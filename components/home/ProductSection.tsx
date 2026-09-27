import type { ProductSummary } from "@/lib/types/product";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductSection({
  id,
  title,
  products,
  divider = false,
}: {
  id: string;
  title: string;
  products: ProductSummary[];
  divider?: boolean;
}) {
  return (
    <section id={id} className="pt-12 xl:pt-[72px]">
      <Container>
        <SectionHeading className="mb-8 xl:mb-14">{title}</SectionHeading>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none xl:grid xl:grid-cols-4 xl:gap-5 xl:overflow-visible xl:pb-0">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-6 flex justify-center xl:mt-9">
          <Button
            href="/shop"
            variant="secondary"
            className="h-[46px] w-full px-14 xl:h-[52px] xl:w-[218px]"
          >
            Xem tất cả
          </Button>
        </div>
        {divider ? (
          <hr className="mt-10 border-line xl:mt-16" />
        ) : null}
      </Container>
    </section>
  );
}
