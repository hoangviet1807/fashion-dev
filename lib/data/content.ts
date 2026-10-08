import { urlFor } from "@/sanity/lib/image";
import { sanityFetch } from "@/sanity/lib/live";
import {
  ANNOUNCEMENT_QUERY,
  BRAND_NAME_QUERY,
  BRANDS_QUERY,
  FREE_SHIPPING_QUERY,
  HERO_SLIDES_QUERY,
  PRODUCT_PAGE_SETTINGS_QUERY,
  TESTIMONIALS_QUERY,
} from "@/sanity/lib/queries";

export type PerkIcon = "shipping" | "returns" | "hotline" | "store" | "payment";
export type ProductPerk = { icon: PerkIcon; text: string };
export type SizeGuideRow = { size: string; height?: string; weight?: string };
export type SizeGuide = { rows: SizeGuideRow[]; note?: string };
export type ProductPageSettings = { perks: ProductPerk[]; sizeGuide: SizeGuide };

const PERK_ICONS: PerkIcon[] = ["shipping", "returns", "hotline", "store", "payment"];

const DEFAULT_PERKS: ProductPerk[] = [
  { icon: "shipping", text: "Giao hàng toàn quốc, nhận sau 3–5 ngày" },
  { icon: "returns", text: "Đổi trả trong 7 ngày kể từ khi nhận hàng" },
  { icon: "payment", text: "Thanh toán khi nhận hàng (COD)" },
  { icon: "payment", text: "Thanh toán online qua VNPay, MoMo, VietQR" },
];

const DEFAULT_SIZE_GUIDE: SizeGuide = {
  rows: [
    { size: "S", height: "155–163", weight: "48–55" },
    { size: "M", height: "163–169", weight: "55–61" },
    { size: "L", height: "169–175", weight: "61–68" },
    { size: "XL", height: "175–181", weight: "68–75" },
    { size: "2XL", height: "181–186", weight: "75–83" },
    { size: "3XL", height: "186–190", weight: "83–90" },
  ],
  note: "Nếu số đo nằm giữa hai size, hãy chọn size lớn hơn để mặc thoải mái.",
};

/** Free standard shipping threshold for cart and checkout display; the server re-reads it when quoting. */
export async function getFreeShippingThreshold(): Promise<number | null> {
  const { data } = await sanityFetch({
    query: FREE_SHIPPING_QUERY,
    tags: ["siteSettings"],
    stega: false,
  });
  return typeof data === "number" && data > 0 ? data : null;
}

/** Perks and size guide for every product page (Studio → Site settings → Product page). */
export async function getProductPageSettings(): Promise<ProductPageSettings> {
  const { data } = await sanityFetch({
    query: PRODUCT_PAGE_SETTINGS_QUERY,
    tags: ["siteSettings"],
    stega: false,
  });
  const perks = (data?.perks ?? []).flatMap((perk) => {
    const text = perk.text?.trim();
    const icon = PERK_ICONS.find((item) => item === perk.icon);
    return text && icon ? [{ icon, text }] : [];
  });
  const rows = (data?.sizeGuide?.rows ?? []).flatMap((row) =>
    row.size
      ? [{ size: row.size, height: row.height ?? undefined, weight: row.weight ?? undefined }]
      : [],
  );
  return {
    perks: perks.length > 0 ? perks : DEFAULT_PERKS,
    sizeGuide:
      rows.length > 0
        ? { rows, note: data?.sizeGuide?.note?.trim() || undefined }
        : DEFAULT_SIZE_GUIDE,
  };
}

export type Announcement = {
  text: string;
  linkLabel?: string;
  linkHref?: string;
  /** Scrolled after the main message. */
  extraMessages: string[];
};

const DEFAULT_ANNOUNCEMENT: Announcement = {
  text: "Đăng ký để được giảm 20% cho đơn hàng đầu tiên.",
  linkLabel: "Đăng ký ngay",
  linkHref: "#newsletter",
  extraMessages: [
    "Giao hàng toàn quốc, nhận sau 3–5 ngày",
    "Đổi trả trong 7 ngày kể từ khi nhận hàng",
    "Thanh toán khi nhận hàng (COD)",
  ],
};

export type HeroSlide = {
  id: string;
  desktopSrc: string;
  mobileSrc: string;
  videoUrl?: string;
  alt: string;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  tone: "dark" | "light";
  /** Milliseconds. */
  duration: number;
};

const DEFAULT_SLIDE_SECONDS = 6;

/** Home page hero banners (Studio → Site settings → Hero slider); empty means the default hero. */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  const { data } = await sanityFetch({
    query: HERO_SLIDES_QUERY,
    tags: ["siteSettings"],
    stega: false,
  });
  return (data ?? []).flatMap((slide) => {
    if (!slide.image) return [];
    return [
      {
        id: slide.id,
        desktopSrc: urlFor(slide.image).width(1920).height(800).fit("crop").auto("format").url(),
        mobileSrc: urlFor(slide.mobileImage?.asset ? slide.mobileImage : slide.image)
          .width(750)
          .height(1000)
          .fit("crop")
          .auto("format")
          .url(),
        videoUrl: slide.media === "video" ? (slide.videoUrl ?? undefined) : undefined,
        alt: slide.alt?.trim() || slide.heading?.trim() || "",
        heading: slide.heading?.trim() || undefined,
        subheading: slide.subheading?.trim() || undefined,
        ctaLabel: slide.ctaLabel?.trim() || undefined,
        ctaHref: slide.ctaHref?.trim() || undefined,
        tone: slide.tone === "light" ? "light" : "dark",
        duration: (slide.duration ?? DEFAULT_SLIDE_SECONDS) * 1000,
      },
    ];
  });
}

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
  const extraMessages = (data.extraMessages ?? []).flatMap((message) => message?.trim() || []);
  return linkLabel && linkHref
    ? { text, linkLabel, linkHref, extraMessages }
    : { text, extraMessages };
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
