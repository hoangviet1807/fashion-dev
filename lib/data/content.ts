import { sanityFetch } from "@/sanity/lib/live";
import { BRANDS_QUERY, TESTIMONIALS_QUERY } from "@/sanity/lib/queries";

export type Testimonial = { id: string; name: string; quote: string };
export type BrandLogo = { src: string; alt: string; width: number; height: number };

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data } = await sanityFetch({
    query: TESTIMONIALS_QUERY,
    tags: ["testimonial"],
    stega: false,
  });
  return data.map((item) => ({ id: item._id, name: item.name, quote: item.quote }));
}

export async function getBrands(): Promise<BrandLogo[]> {
  const { data } = await sanityFetch({
    query: BRANDS_QUERY,
    tags: ["brand"],
    stega: false,
  });
  return data.flatMap((brand) =>
    brand.src
      ? [
          {
            src: brand.src,
            alt: brand.name,
            width: brand.width ?? 160,
            height: brand.height ?? 34,
          },
        ]
      : [],
  );
}
