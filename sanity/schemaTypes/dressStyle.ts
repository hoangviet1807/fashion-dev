import { defineField, defineType } from "sanity";

export const dressStyleType = defineType({
  name: "dressStyle",
  title: "Dress style",
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
      description: "Used in shop URLs, e.g. /shop?style=casual",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
  ],
});
