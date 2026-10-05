import { sanityFetch } from "@/sanity/lib/live";
import {
  ANNOUNCEMENT_QUERY,
  BRAND_NAME_QUERY,
  BRANDS_QUERY,
  TESTIMONIALS_QUERY,
} from "@/sanity/lib/queries";

export type Announcement = { text: string; linkLabel?: string; linkHref?: string };

const DEFAULT_ANNOUNCEMENT: Announcement = {
  text: "Đăng ký để được giảm 20% cho đơn hàng đầu tiên.",
  linkLabel: "Đăng ký ngay",
  linkHref: "#newsletter",
};

/** Banner above the header (Studio → Site settings); null when switched off. */
export async function getAnnouncement(): Promise<Announcement | null> {
  const { data } = await sanityFetch({
    query: ANNOUNCEMENT_QUERY,
    tags: ["siteSettings"],
    stega: false,
  });
  if (!data) return DEFAULT_ANNOUNCEMENT;
  if (data.enabled === false) return null;
  const text = data.text?.trim();
  if (!text) return DEFAULT_ANNOUNCEMENT;
  const linkLabel = data.linkLabel?.trim();
  const linkHref = data.linkHref?.trim();
  return linkLabel && linkHref ? { text, linkLabel, linkHref } : { text };
}

export type Testimonial = { id: string; name: string; quote: string };
export type BrandLogo = {
  src: string;
  alt: string;
  /** Brand slug for the shop filter; missing until set in Studio. */
  slug?: string;
  width: number;
  height: number;
};

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
            slug: brand.slug ?? undefined,
            width: brand.width ?? 160,
            height: brand.height ?? 34,
          },
        ]
      : [],
  );
}

export async function getBrandName(slug: string): Promise<string | null> {
  const { data } = await sanityFetch({
    query: BRAND_NAME_QUERY,
    params: { slug },
    tags: ["brand"],
    stega: false,
  });
  return data;
}
