/**
 * Creates the footer content pages (About, FAQ, Shipping, Returns, Privacy, Terms).
 * Run with `pnpm seed:pages`. Pages that already exist are left untouched, so
 * edits made in Studio are never overwritten.
 */
import { getCliClient } from "sanity/cli";
import { PAGES, type SeedSection } from "./seed-pages-data";

const client = getCliClient({ apiVersion: "2026-09-27" });

let keyCounter = 0;
const key = () => `k${(keyCounter++).toString(36)}`;

function block(text: string, style: "normal" | "h2" = "normal", listItem?: "bullet") {
  return {
    _key: key(),
    _type: "block",
    style,
    markDefs: [],
    children: [{ _key: key(), _type: "span", text, marks: [] }],
    ...(listItem ? { listItem, level: 1 } : {}),
  };
}

function sectionBlocks(section: SeedSection) {
  return [
    ...(section.heading ? [block(section.heading, "h2")] : []),
    ...(section.bullets ?? []).map((text) => block(text, "normal", "bullet")),
    ...(section.paragraphs ?? []).map((text) => block(text)),
  ];
}

async function main() {
  let created = 0;
  for (const page of PAGES) {
    const exists = await client.fetch<boolean>(
      `count(*[_type == "page" && slug.current == $slug]) > 0`,
      { slug: page.slug },
      { perspective: "raw" },
    );
    if (exists) {
      console.log(`  /${page.slug}: already exists`);
      continue;
    }
    await client.create({
      _id: `page-${page.slug}`,
      _type: "page",
      title: page.title,
      slug: { _type: "slug", current: page.slug },
      description: page.description,
      body: page.sections.flatMap(sectionBlocks),
    });
    created++;
    console.log(`  /${page.slug}: created`);
  }
  console.log(`✓ ${created} new pages (${PAGES.length} total)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
