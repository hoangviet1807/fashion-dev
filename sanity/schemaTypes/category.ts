import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      description: "Used in shop URLs, e.g. /shop?category=t-shirts",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
  ],
});
