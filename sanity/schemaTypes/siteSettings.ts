import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "home", title: "Home page", default: true },
    { name: "hero", title: "Hero slider" },
    { name: "banner", title: "Announcement banner" },
    { name: "product", title: "Product page" },
    { name: "checkout", title: "Cart & checkout" },
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
      name: "heroSlides",
      title: "Hero slides",
      type: "array",
      group: "hero",
      description:
        "Full-width banners at the top of the home page. Images: 1920×800 px (desktop) and 750×1000 px (mobile), WebP/JPG under 500 KB. Videos: MP4 (H.264), 6–15 s, no sound, under 5 MB. Leave empty to show the default hero.",
      of: [
        defineArrayMember({
          type: "object",
          name: "heroSlide",
          fields: [
            defineField({
              name: "media",
              type: "string",
              options: {
                list: [
                  { title: "Image", value: "image" },
                  { title: "Video", value: "video" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              initialValue: "image",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "image",
              title: "Desktop image (1920×800)",
              type: "image",
              options: { hotspot: true },
              description: "Also used as the poster while a video loads.",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "mobileImage",
              title: "Mobile image (750×1000)",
              type: "image",
              options: { hotspot: true },
              description: "Optional. Falls back to the desktop image, cropped around its hotspot.",
            }),
            defineField({
              name: "video",
              title: "Video (MP4)",
              type: "file",
              options: { accept: "video/mp4,video/webm" },
              hidden: ({ parent }) => (parent as { media?: string } | undefined)?.media !== "video",
              validation: (rule) =>
                rule.custom((value, context) =>
                  (context.parent as { media?: string } | undefined)?.media === "video" && !value
                    ? "Upload a video or switch the slide to Image"
                    : true,
                ),
            }),
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              description: "Describes the picture for screen readers and search engines.",
            }),
            defineField({ name: "heading", type: "string", validation: (rule) => rule.max(60) }),
            defineField({ name: "subheading", type: "text", rows: 2, validation: (rule) => rule.max(160) }),
            defineField({ name: "ctaLabel", title: "Button label", type: "string", validation: (rule) => rule.max(24) }),
            defineField({
              name: "ctaHref",
              title: "Link URL",
              type: "string",
              description: "Where the slide links to, e.g. /shop?sale=1. The whole slide is clickable.",
              validation: (rule) =>
                rule.custom((value: string | undefined) =>
                  !value || /^(\/|#|https?:\/\/)/.test(value) || "Start with /, # or https://",
                ),
            }),
            defineField({
              name: "tone",
              title: "Text colour",
              type: "string",
              options: {
                list: [
                  { title: "Dark text (light image)", value: "dark" },
                  { title: "Light text (dark image)", value: "light" },
                ],
                layout: "radio",
              },
              initialValue: "dark",
            }),
            defineField({
              name: "duration",
              title: "Duration (seconds)",
              type: "number",
              description: "How long the slide stays before moving on. Default 6; match the video length for videos.",
              validation: (rule) => rule.min(2).max(30),
            }),
          ],
          preview: {
            select: { title: "heading", media: "image", kind: "media" },
            prepare: ({ title, media, kind }) => ({
              title: title || "Untitled slide",
              subtitle: kind === "video" ? "Video" : "Image",
              media,
            }),
          },
        }),
      ],
      validation: (rule) => rule.max(6),
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
        defineField({
          name: "extraMessages",
          title: "More messages",
          type: "array",
          description: "Scroll in a loop after the main message, e.g. “Đổi trả trong 7 ngày”.",
          of: [defineArrayMember({ type: "string", validation: (rule) => rule.max(80) })],
          validation: (rule) => rule.max(6),
        }),
      ],
    }),
    defineField({
      name: "freeShippingThreshold",
      title: "Free standard shipping from (VND)",
      type: "number",
      group: "checkout",
      description:
        "Orders whose subtotal (before discount codes) reaches this amount ship free with standard delivery, and the cart shows a progress bar towards it. Leave empty to always charge shipping.",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "productFaqs",
      title: "Default product FAQs",
      type: "array",
      group: "product",
      of: [defineArrayMember({ type: "faq" })],
    }),
    defineField({
      name: "productPerks",
      title: "Perks under “Thêm vào giỏ”",
      type: "array",
      group: "product",
      description: "Up to 4 short promises shown on every product page. Leave empty for the defaults.",
      of: [
        defineArrayMember({
          type: "object",
          name: "perk",
          fields: [
            defineField({
              name: "icon",
              type: "string",
              options: {
                list: [
                  { title: "Shipping", value: "shipping" },
                  { title: "Returns", value: "returns" },
                  { title: "Hotline", value: "hotline" },
                  { title: "Store", value: "store" },
                  { title: "Payment", value: "payment" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "text",
              type: "string",
              description: "One short line, e.g. “Đổi trả trong 7 ngày”.",
              validation: (rule) => rule.required().max(80),
            }),
          ],
          preview: { select: { title: "text", subtitle: "icon" } },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "sizeGuide",
      title: "Size guide",
      type: "object",
      group: "product",
      description: "Opened from “Hướng dẫn chọn size”. Leave empty for the default table.",
      fields: [
        defineField({
          name: "rows",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "sizeGuideRow",
              fields: [
                defineField({ name: "size", type: "string", validation: (rule) => rule.required() }),
                defineField({ name: "height", title: "Height (cm)", type: "string", description: "e.g. 160–165" }),
                defineField({ name: "weight", title: "Weight (kg)", type: "string", description: "e.g. 50–57" }),
              ],
              preview: {
                select: { title: "size", height: "height", weight: "weight" },
                prepare: ({ title, height, weight }) => ({
                  title,
                  subtitle: [height && `${height} cm`, weight && `${weight} kg`]
                    .filter(Boolean)
                    .join(" · "),
                }),
              },
            }),
          ],
        }),
        defineField({
          name: "note",
          type: "text",
          rows: 2,
          description: "Shown under the table, e.g. advice for in-between sizes.",
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
