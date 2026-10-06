import type { Metadata } from "next";
import { STORE_CURRENCY } from "@/lib/money";
import { SITE_LOCALE } from "@/lib/locale";
import { siteUrl } from "@/lib/site-url";
import type { Product } from "@/lib/types/product";

export const SITE_NAME = "SHOP.CO";

export const BASE_OPEN_GRAPH = {
  locale: "vi_VN",
  siteName: SITE_NAME,
} satisfies NonNullable<Metadata["openGraph"]>;

/** Metadata for pages that should stay out of search results (still followed for links). */
export const NO_INDEX = { index: false, follow: true } satisfies Metadata["robots"];

export function absoluteUrl(path: string) {
  return /^https?:\/\//.test(path) ? path : `${siteUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Search snippets are cut around 160 characters; trim on a word boundary. */
export function metaDescription(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : cut.length)}…`;
}

/** Sanity CDN images are resized for social previews; other sources pass through. */
export function socialImageUrl(src: string) {
  if (!src.startsWith("https://cdn.sanity.io/")) return src;
  const url = new URL(src);
  url.searchParams.set("w", "1200");
  url.searchParams.set("h", "1200");
  url.searchParams.set("fit", "max");
  return url.toString();
}

export function productMetadata(product: Product): Metadata {
  const path = `/product/${product.slug}`;
  const description = metaDescription(product.description || `${product.name} tại ${SITE_NAME}.`);
  const images = product.images
    .filter(Boolean)
    .slice(0, 4)
    .map((src) => ({ url: socialImageUrl(src), alt: product.name }));

  return {
    title: `${product.name} | ${SITE_NAME}`,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      type: "website",
      url: path,
      title: product.name,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: images.map((image) => image.url),
    },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": STORE_CURRENCY,
    },
  };
}

type Crumb = { name: string; path?: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.path ? { item: absoluteUrl(crumb.path) } : {}),
    })),
  };
}

export function productJsonLd(product: Product) {
  const url = absoluteUrl(`/product/${product.slug}`);
  const inStock = product.variants.some((variant) => variant.stock > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    url,
    image: product.images.filter(Boolean).map(absoluteUrl),
    description: product.description || undefined,
    category: product.categoryTitle,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: STORE_CURRENCY,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${siteUrl()}/#organization` },
    },
    ...(product.reviewCount > 0 && product.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Math.round(product.rating * 10) / 10,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

export function organizationJsonLd() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: SITE_NAME,
        url: base,
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: SITE_NAME,
        url: base,
        inLanguage: SITE_LOCALE,
        publisher: { "@id": `${base}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${base}/shop?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}
