import { defineQuery } from "next-sanity";

const PRODUCT_CARD = /* groq */ `
  _id,
  "slug": slug.current,
  name,
  "image": images[0].asset->url,
  price,
  compareAtPrice,
  discount,
  rating,
  "category": category->slug.current,
  "styles": dressStyles[]->slug.current,
  "colors": array::unique(variants[].color),
  "sizes": array::unique(variants[].size)
`;

const SHOP_FILTER = /* groq */ `
  _type == "product" && defined(slug.current)
  && (!defined($category) || category->slug.current == $category)
  && (!defined($style) || $style in dressStyles[]->slug.current)
  && (!defined($color) || $color in variants[].color)
  && (!defined($size) || $size in variants[].size)
  && (!defined($minPrice) || price >= $minPrice)
  && (!defined($maxPrice) || price <= $maxPrice)
`;

export const SHOP_PRODUCTS_QUERY = defineQuery(`{
  "items": *[${SHOP_FILTER}]
    | order(
        select($sort == "low-price" => price, $sort == "high-price" => -price, -popularity) asc,
        popularity desc
      )
    [$start...$end] { ${PRODUCT_CARD} },
  "total": count(*[${SHOP_FILTER}])
}`);

export const PRODUCT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "product" && slug.current == $slug][0] {
    ${PRODUCT_CARD},
    description,
    "categoryTitle": category->title,
    "images": images[].asset->url,
    reviewCount,
    "variants": variants[] { sku, color, size, stock },
    details { material, fit, featuresIntro, features },
    "faqs": coalesce(faqs, *[_id == "siteSettings"][0].productFaqs)[] {
      "id": _key,
      question,
      answer
    }
  }
`);

export const RELATED_PRODUCTS_QUERY = defineQuery(`
  *[_type == "product" && slug.current == $slug][0] {
    "items": select(
      count(relatedProducts) > 0 => relatedProducts[]-> { ${PRODUCT_CARD} },
      *[_type == "product" && defined(slug.current) && slug.current != $slug]
        | order(popularity desc) [0...4] { ${PRODUCT_CARD} }
    )
  }.items
`);

export const CHECKOUT_VARIANTS_QUERY = defineQuery(`
  *[_type == "product" && defined(slug.current) && count(variants[sku in $skus]) > 0] {
    "slug": slug.current,
    name,
    "image": images[0].asset->url,
    price,
    "variants": variants[sku in $skus] { sku, color, size, stock }
  }
`);

export const INVENTORY_DOCS_QUERY = defineQuery(`
  *[_type == "product" && count(variants[sku in $skus]) > 0] {
    _id,
    "variants": variants[sku in $skus] { _key, sku }
  }
`);

export const PRODUCT_SLUGS_QUERY = defineQuery(`
  *[_type == "product" && defined(slug.current)].slug.current
`);

export const HOME_COLLECTIONS_QUERY = defineQuery(`
  *[_id == "siteSettings"][0] {
    "newArrivals": newArrivals[]-> { ${PRODUCT_CARD} },
    "topSelling": topSelling[]-> { ${PRODUCT_CARD} }
  }
`);

export const TESTIMONIALS_QUERY = defineQuery(`
  *[_type == "testimonial"] | order(order asc) { _id, name, quote }
`);

export const BRANDS_QUERY = defineQuery(`
  *[_type == "brand" && defined(logo.asset)] | order(order asc) {
    _id,
    name,
    "src": logo.asset->url,
    "width": logo.asset->metadata.dimensions.width,
    "height": logo.asset->metadata.dimensions.height
  }
`);
