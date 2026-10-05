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

// Flattened: `match` skips nested arrays.
const SEARCH_FIELDS = /* groq */ `(
  [name, category->title, category->slug.current, brand->name]
  + coalesce(dressStyles[]->title, [])
  + coalesce(dressStyles[]->slug.current, [])
  + coalesce(variants[].color, [])
  + coalesce(tags, [])
)`;

const SHOP_FILTER = /* groq */ `
  _type == "product" && defined(slug.current)
  && (count($terms) == 0 || ${SEARCH_FIELDS} match $terms || ${SEARCH_FIELDS} match $altTerms)
  && (!$sale || compareAtPrice > price || discount > 0)
  && (!defined($brand) || brand->slug.current == $brand)
  && (!defined($category) || category->slug.current == $category)
  && (!defined($style) || $style in dressStyles[]->slug.current)
  && (!defined($color) || $color in variants[].color)
  && (!defined($size) || $size in variants[].size)
  && (!defined($minPrice) || price >= $minPrice)
  && (!defined($maxPrice) || price <= $maxPrice)
`;

export const SHOP_PRODUCTS_QUERY = defineQuery(`{
  "items": *[${SHOP_FILTER}]
    | score(boost(name match $terms, 3), boost(name match $altTerms, 3))
    | order(
        select($sort == "newest" => _createdAt) desc,
        select($sort == "low-price" => price, $sort == "high-price" => -price, -_score) asc,
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
    name,
    "variants": variants[sku in $skus] { _key, sku, color, size, stock }
  }
`);

export const LOW_STOCK_QUERY = defineQuery(`
  *[_type == "product" && defined(slug.current) && count(variants[stock <= $threshold]) > 0]
    | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    "image": images[0].asset->url,
    "variants": variants[stock <= $threshold] | order(stock asc) { sku, color, size, stock }
  }
`);

export const PRODUCT_RATING_DOCS_QUERY = defineQuery(`
  *[_type == "product" && slug.current == $slug]._id
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

export const ANNOUNCEMENT_QUERY = defineQuery(`
  *[_id == "siteSettings"][0].announcement { enabled, text, linkLabel, linkHref }
`);

export const TESTIMONIALS_QUERY = defineQuery(`
  *[_type == "testimonial"] | order(order asc) { _id, name, quote }
`);

export const BRANDS_QUERY = defineQuery(`
  *[_type == "brand" && defined(logo.asset)] | order(order asc) {
    _id,
    name,
    "slug": slug.current,
    "src": logo.asset->url,
    "width": logo.asset->metadata.dimensions.width,
    "height": logo.asset->metadata.dimensions.height
  }
`);

export const BRAND_NAME_QUERY = defineQuery(`
  *[_type == "brand" && slug.current == $slug][0].name
`);

export const PAGE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0] { title, description, body }
`);

export const PAGE_SLUGS_QUERY = defineQuery(`
  *[_type == "page" && defined(slug.current)].slug.current
`);
