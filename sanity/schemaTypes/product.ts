import { defineArrayMember, defineField, defineType } from "sanity";
import { formatPrice } from "../../lib/money";

type Variant = { sku?: string; color?: string; size?: string };

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  groups: [
    { name: "main", title: "Main", default: true },
    { name: "inventory", title: "Inventory" },
    { name: "content", title: "Details & FAQs" },
  ],
  fields: [
    defineField({
      name: "name",
      type: "string",
      group: "main",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "main",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "images",
      type: "array",
      group: "main",
      description: "The first image is the cover shown on product cards.",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Alternative text",
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      group: "main",
    }),
    defineField({
      name: "price",
      title: "Price (VND)",
      type: "number",
      group: "main",
      description: "Whole đồng, e.g. 350000 for 350.000₫.",
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "compareAtPrice",
      title: "Compare-at price (VND)",
      type: "number",
      group: "main",
      description: "Original price shown struck through. Leave empty when not on sale.",
      validation: (rule) =>
        rule.integer().min(0).custom((value, context) => {
          const price = (context.document as { price?: number } | undefined)?.price;
          if (value === undefined || price === undefined) return true;
          return value > price || "Compare-at price should be higher than price";
        }),
    }),
    defineField({
      name: "discount",
      title: "Discount badge (%)",
      type: "number",
      group: "main",
      description: "Optional. Calculated from the compare-at price when empty.",
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      group: "main",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dressStyles",
      title: "Dress styles",
      type: "array",
      group: "main",
      of: [defineArrayMember({ type: "reference", to: [{ type: "dressStyle" }] })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "brand",
      type: "reference",
      to: [{ type: "brand" }],
      group: "main",
    }),
    defineField({
      name: "popularity",
      type: "number",
      group: "main",
      description: "Higher numbers appear first when sorting by Most Popular.",
      initialValue: 0,
    }),
    defineField({
      name: "rating",
      type: "number",
      group: "main",
      validation: (rule) => rule.min(0).max(5),
    }),
    defineField({
      name: "reviewCount",
      type: "number",
      group: "main",
      initialValue: 0,
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "variants",
      type: "array",
      group: "inventory",
      of: [defineArrayMember({ type: "productVariant" })],
      validation: (rule) =>
        rule.required().min(1).custom((variants: Variant[] | undefined) => {
          if (!variants) return true;
          const skus = new Set<string>();
          const combos = new Set<string>();
          for (const variant of variants) {
            const combo = `${variant.color}/${variant.size}`;
            if (variant.sku && skus.has(variant.sku)) {
              return `Duplicate SKU: ${variant.sku}`;
            }
            if (combos.has(combo)) return `Duplicate color/size: ${combo}`;
            if (variant.sku) skus.add(variant.sku);
            combos.add(combo);
          }
          return true;
        }),
    }),
    defineField({
      name: "relatedProducts",
      title: "Related products",
      type: "array",
      group: "content",
      description: "Shown under “You might also like”. Falls back to popular products.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
      validation: (rule) => rule.unique().max(4),
    }),
    defineField({
      name: "details",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "material", title: "Material & care", type: "array", of: [defineArrayMember({ type: "string" })] }),
        defineField({ name: "fit", title: "Fit & sizing", type: "array", of: [defineArrayMember({ type: "string" })] }),
        defineField({ name: "featuresIntro", title: "Design features intro", type: "text", rows: 3 }),
        defineField({ name: "features", title: "Design features", type: "array", of: [defineArrayMember({ type: "string" })] }),
      ],
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      group: "content",
      description: "Leave empty to use the default FAQs from Site settings.",
      of: [defineArrayMember({ type: "faq" })],
    }),
  ],
  orderings: [
    {
      title: "Most popular",
      name: "popularityDesc",
      by: [{ field: "popularity", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "name", price: "price", media: "images.0" },
    prepare: ({ title, price, media }) => ({
      title,
      subtitle: price !== undefined ? formatPrice(price) : undefined,
      media,
    }),
  },
});
