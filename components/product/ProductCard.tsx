import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/types/product";
import { Rating } from "@/components/ui/Rating";
import { Price } from "@/components/ui/Price";

export function ProductCard({
  product,
  layout = "carousel",
}: {
  product: ProductSummary;
  layout?: "carousel" | "grid";
}) {
  const width =
    layout === "grid" ? "w-full min-w-0" : "w-[198px] shrink-0 xl:w-[295px]";
  const imageBox =
    layout === "grid"
      ? "aspect-square xl:h-[298px] xl:aspect-auto"
      : "h-[200px] xl:h-[298px]";

  return (
    <Link href={`/product/${product.slug}`} className={`flex flex-col ${width}`}>
      <div className={`relative overflow-hidden rounded-[20px] bg-product ${imageBox}`}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={
            layout === "grid"
              ? "(max-width: 1024px) 50vw, 295px"
              : "(max-width: 1280px) 198px, 295px"
          }
          className="object-cover"
        />
      </div>
      <h3 className="mt-2.5 text-base font-bold capitalize leading-[22px] xl:mt-4 xl:text-xl xl:leading-[27px]">
        {product.name}
      </h3>
      <div className="mt-1 xl:mt-2">
        <Rating value={product.rating} />
      </div>
      <div className="mt-1 xl:mt-2">
        <Price
          price={product.price}
          originalPrice={product.compareAtPrice}
          discount={product.discount}
        />
      </div>
    </Link>
  );
}
