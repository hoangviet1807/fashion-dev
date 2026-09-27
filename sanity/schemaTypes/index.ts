import { type SchemaTypeDefinition } from "sanity";
import { brandType } from "./brand";
import { categoryType } from "./category";
import { dressStyleType } from "./dressStyle";
import { faqType } from "./faq";
import { productType } from "./product";
import { productVariantType } from "./productVariant";
import { siteSettingsType } from "./siteSettings";
import { testimonialType } from "./testimonial";

export const SINGLETON_TYPES = new Set(["siteSettings"]);

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    productType,
    productVariantType,
    faqType,
    categoryType,
    dressStyleType,
    brandType,
    testimonialType,
    siteSettingsType,
  ],
};
