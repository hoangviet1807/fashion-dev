import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "newArrivals",
      title: "New arrivals (home page)",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
      validation: (rule) => rule.unique().max(4),
    }),
    defineField({
      name: "topSelling",
      title: "Top selling (home page)",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
      validation: (rule) => rule.unique().max(4),
    }),
    defineField({
      name: "productFaqs",
      title: "Default product FAQs",
      type: "array",
      of: [defineArrayMember({ type: "faq" })],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
