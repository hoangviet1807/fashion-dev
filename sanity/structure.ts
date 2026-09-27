import type { StructureResolver } from "sanity/structure";
import { SINGLETON_TYPES } from "./schemaTypes";

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
      ...S.documentTypeListItems().filter(
        (item) => !SINGLETON_TYPES.has(item.getId() ?? ""),
      ),
    ]);
