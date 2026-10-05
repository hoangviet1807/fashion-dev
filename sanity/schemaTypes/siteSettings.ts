import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "home", title: "Home page", default: true },
    { name: "banner", title: "Announcement banner" },
    { name: "product", title: "Product page" },
  ],
  fields: [
    defineField({
      name: "newArrivals",
      title: "New arrivals (home page)",
      type: "array",
      group: "home",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
      validation: (rule) => rule.unique().max(4),
    }),
    defineField({
      name: "topSelling",
      title: "Top selling (home page)",
      type: "array",
      group: "home",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
      validation: (rule) => rule.unique().max(4),
    }),
    defineField({
      name: "announcement",
      title: "Announcement banner",
      type: "object",
      group: "banner",
      description: "Black bar above the header on every page. Leave empty to show the default sign-up offer.",
      options: { collapsible: false },
      fields: [
        defineField({
          name: "enabled",
          title: "Show banner",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "text",
          type: "string",
          description: "Keep it to one short sentence so it fits on phones.",
          validation: (rule) => rule.max(120),
        }),
        defineField({
          name: "linkLabel",
          title: "Link label",
          type: "string",
          description: "Underlined text after the message, e.g. “Mua ngay”.",
          validation: (rule) => rule.max(30),
        }),
        defineField({
          name: "linkHref",
          title: "Link URL",
          type: "string",
          description: "A path like /shop?sale=1, an anchor like #newsletter, or a full https:// URL.",
          validation: (rule) =>
            rule.custom((value: string | undefined, context) => {
              const label = (context.parent as { linkLabel?: string } | undefined)?.linkLabel;
              if (!value) return label ? "Add a URL for the link label" : true;
              return /^(\/|#|https?:\/\/)/.test(value) || "Start with /, # or https://";
            }),
        }),
      ],
    }),
    defineField({
      name: "productFaqs",
      title: "Default product FAQs",
      type: "array",
      group: "product",
      of: [defineArrayMember({ type: "faq" })],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
