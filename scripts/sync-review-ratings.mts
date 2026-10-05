/**
 * Recomputes `rating` / `reviewCount` on every Sanity product (published and
 * drafts) from the `reviews` table. Products without reviews are reset to 0.
 *
 *   pnpm reviews:sync
 *   pnpm reviews:sync bermuda one-life-graphic-t-shirt   (only these slugs)
 *
 * Saving a review already syncs its product; this is for backfills and repairs.
 */
import { existsSync } from "node:fs";
import { createClient } from "@sanity/client";
import postgres from "postgres";

if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is not set.`);
    process.exit(1);
  }
  return value;
}

const sql = postgres(env("DATABASE_URL"), { max: 1 });
const client = createClient({
  projectId: env("NEXT_PUBLIC_SANITY_PROJECT_ID"),
  dataset: env("NEXT_PUBLIC_SANITY_DATASET"),
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-09-27",
  token: env("SANITY_API_WRITE_TOKEN"),
  useCdn: false,
  perspective: "raw",
});

try {
  const rows = await sql<{ slug: string; average: number; count: number }[]>`
    select product_slug as slug, round(avg(rating), 1)::float as average, count(*)::int as count
    from reviews
    group by product_slug`;
  const summaries = new Map(rows.map((row) => [row.slug, row]));

  const slugs = process.argv.slice(2);
  const docs = await client.fetch<
    { _id: string; slug: string; rating: number | null; reviewCount: number | null }[]
  >(
    `*[_type == "product" && defined(slug.current) && (count($slugs) == 0 || slug.current in $slugs)] {
      _id, "slug": slug.current, rating, reviewCount
    }`,
    { slugs },
  );

  const mutation = client.transaction();
  let changed = 0;
  for (const doc of docs) {
    const summary = summaries.get(doc.slug);
    const rating = summary?.average ?? 0;
    const reviewCount = summary?.count ?? 0;
    if (doc.rating === rating && doc.reviewCount === reviewCount) continue;
    mutation.patch(doc._id, (patch) => patch.set({ rating, reviewCount }));
    console.log(`${doc._id}: ${doc.rating ?? "–"} (${doc.reviewCount ?? "–"}) → ${rating} (${reviewCount})`);
    changed++;
  }
  if (changed > 0) await mutation.commit();
  console.log(`Synced ${changed} of ${docs.length} product documents.`);
} finally {
  await sql.end();
}
