import { defineField, defineType } from "sanity";
import { PRODUCT_COLOR_IDS, SIZES, colorLabel } from "../../lib/catalog";

export const productVariantType = defineType({
  name: "productVariant",
  title: "Variant",
  type: "object",
  fields: [
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "color",
      type: "string",
      options: {
        list: PRODUCT_COLOR_IDS.map((id) => ({ title: colorLabel(id), value: id })),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "size",
      type: "string",
      options: { list: [...SIZES] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "stock",
      type: "number",
      initialValue: 0,
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
  preview: {
    select: { sku: "sku", color: "color", size: "size", stock: "stock" },
    prepare: ({ sku, color, size, stock }) => ({
      title: `${colorLabel(color ?? "")} / ${size ?? ""}`,
      subtitle: `${sku ?? "—"} · ${stock ?? 0} in stock`,
    }),
  },
});
