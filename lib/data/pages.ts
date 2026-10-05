import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_BY_SLUG_QUERY, PAGE_SLUGS_QUERY } from "@/sanity/lib/queries";

export async function getPage(slug: string) {
  const { data } = await sanityFetch({
    query: PAGE_BY_SLUG_QUERY,
    params: { slug },
    tags: [`page:${slug}`],
    stega: false,
  });
  return data;
}

export async function getAllPageSlugs(): Promise<string[]> {
  const { data } = await sanityFetch({
    query: PAGE_SLUGS_QUERY,
    perspective: "published",
    tags: ["page"],
    stega: false,
  });
  return data;
}
