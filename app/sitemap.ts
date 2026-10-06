import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { SITEMAP_QUERY } from "@/sanity/lib/queries";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, pages } = await client.fetch(
    SITEMAP_QUERY,
    {},
    { next: { tags: ["product", "page"] } },
  );
  const latest = [...products, ...pages].reduce<string | undefined>(
    (max, doc) => (!max || doc._updatedAt > max ? doc._updatedAt : max),
    undefined,
  );

  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/shop"), lastModified: latest, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/shop?sale=1"), changeFrequency: "daily", priority: 0.7 },
    { url: absoluteUrl("/shop?sort=newest"), changeFrequency: "daily", priority: 0.7 },
    ...products.map((product) => ({
      url: absoluteUrl(`/product/${product.slug}`),
      lastModified: product._updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...pages.map((page) => ({
      url: absoluteUrl(`/${page.slug}`),
      lastModified: page._updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
