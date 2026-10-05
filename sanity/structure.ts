import type { StructureResolver } from "sanity/structure";
import { LOW_STOCK_THRESHOLD } from "../lib/inventory/threshold";
import { SINGLETON_TYPES } from "./schemaTypes";

const CATALOG_TYPES = new Set(["product", "category", "dressStyle", "brand"]);
const CONTENT_TYPES = new Set(["page", "testimonial"]);

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Site settings"),
        ),
      S.divider(),
      S.documentTypeListItem("product").title("Products"),
      S.listItem()
        .title(`Low stock (≤ ${LOW_STOCK_THRESHOLD})`)
        .id("lowStock")
        .schemaType("product")
        .child(
          S.documentList()
            .title(`Variants with ${LOW_STOCK_THRESHOLD} or fewer in stock`)
            .schemaType("product")
            .filter('_type == "product" && count(variants[stock <= $threshold]) > 0')
            .params({ threshold: LOW_STOCK_THRESHOLD })
            .defaultOrdering([{ field: "name", direction: "asc" }]),
        ),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() ?? "";
        return CATALOG_TYPES.has(id) && id !== "product";
      }),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => CONTENT_TYPES.has(item.getId() ?? "")),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() ?? "";
        return !SINGLETON_TYPES.has(id) && !CATALOG_TYPES.has(id) && !CONTENT_TYPES.has(id);
      }),
    ]);
