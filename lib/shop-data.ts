import type { Product } from "@/lib/home-data";

export type DressStyleId = "casual" | "formal" | "party" | "gym";
export type CategoryId = "t-shirts" | "shorts" | "shirts" | "hoodie" | "jeans";

export type ShopProduct = Product & {
  category: CategoryId;
  colors: string[];
  sizes: string[];
  styles: DressStyleId[];
};

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "t-shirts", label: "T-shirts" },
  { id: "shorts", label: "Shorts" },
  { id: "shirts", label: "Shirts" },
  { id: "hoodie", label: "Hoodie" },
  { id: "jeans", label: "Jeans" },
];

export const DRESS_STYLES: { id: DressStyleId; label: string }[] = [
  { id: "casual", label: "Casual" },
  { id: "formal", label: "Formal" },
  { id: "party", label: "Party" },
  { id: "gym", label: "Gym" },
];

export const SIZES = [
  "XX-Small",
  "X-Small",
  "Small",
  "Medium",
  "Large",
  "X-Large",
  "XX-Large",
  "3X-Large",
  "4X-Large",
] as const;

export const COLORS = [
  { id: "green", hex: "#00C12B", check: "white" as const },
  { id: "red", hex: "#F50606", check: "white" as const },
  { id: "yellow", hex: "#F5DD06", check: "black" as const },
  { id: "orange", hex: "#F57906", check: "white" as const },
  { id: "cyan", hex: "#06CAF5", check: "black" as const },
  { id: "blue", hex: "#063AF5", check: "white" as const },
  { id: "purple", hex: "#7D06F5", check: "white" as const },
  { id: "pink", hex: "#F506A4", check: "white" as const },
  { id: "white", hex: "#FFFFFF", check: "black" as const },
  { id: "black", hex: "#000000", check: "white" as const },
];

const ALL_SIZES = [...SIZES];
const COLOR_IDS = COLORS.map((color) => color.id);
const STYLE_IDS = DRESS_STYLES.map((style) => style.id);

const baseShopProducts: ShopProduct[] = [
  {
    id: "gradient-tee",
    name: "Gradient Graphic T-shirt",
    image: "/images/product-gradient-tee.png",
    price: 145,
    rating: 3.5,
    category: "t-shirts",
    colors: ["white", "pink", "orange"],
    sizes: ALL_SIZES,
    styles: ["casual", "party"],
  },
  {
    id: "polo-tipping",
    name: "Polo with Tipping Details",
    image: "/images/product-polo-tipping.png",
    price: 180,
    rating: 4.5,
    category: "t-shirts",
    colors: ["red", "pink", "black"],
    sizes: ALL_SIZES,
    styles: ["casual", "formal"],
  },
  {
    id: "black-striped",
    name: "Black Striped T-shirt",
    image: "/images/product-black-striped.png",
    price: 120,
    originalPrice: 150,
    discount: 30,
    rating: 5,
    category: "t-shirts",
    colors: ["black", "white"],
    sizes: ALL_SIZES,
    styles: ["casual", "party"],
  },
  {
    id: "skinny-jeans",
    name: "Skinny Fit Jeans",
    image: "/images/product-skinny-jeans.png",
    price: 240,
    originalPrice: 260,
    discount: 20,
    rating: 3.5,
    category: "jeans",
    colors: ["blue", "black"],
    sizes: ALL_SIZES,
    styles: ["casual"],
  },
  {
    id: "checkered-shirt",
    name: "Checkered Shirt",
    image: "/images/product-checkered-shirt.png",
    price: 180,
    rating: 4.5,
    category: "shirts",
    colors: ["red", "black", "white"],
    sizes: ALL_SIZES,
    styles: ["casual", "formal"],
  },
  {
    id: "sleeve-striped",
    name: "Sleeve Striped T-shirt",
    image: "/images/product-sleeve-striped.png",
    price: 130,
    originalPrice: 160,
    discount: 30,
    rating: 4.5,
    category: "t-shirts",
    colors: ["orange", "black", "white"],
    sizes: ALL_SIZES,
    styles: ["casual", "party"],
  },
  {
    id: "vertical-striped",
    name: "Vertical Striped Shirt",
    image: "/images/product-vertical-striped.png",
    price: 212,
    originalPrice: 232,
    discount: 20,
    rating: 5,
    category: "shirts",
    colors: ["green", "black"],
    sizes: ALL_SIZES,
    styles: ["casual", "formal"],
  },
  {
    id: "courage-tee",
    name: "Courage Graphic T-shirt",
    image: "/images/product-courage-tee.png",
    price: 145,
    rating: 4,
    category: "t-shirts",
    colors: ["orange", "black"],
    sizes: ALL_SIZES,
    styles: ["casual", "gym"],
  },
  {
    id: "bermuda",
    name: "Loose Fit Bermuda Shorts",
    image: "/images/product-bermuda.png",
    price: 80,
    rating: 3,
    category: "shorts",
    colors: ["blue", "black"],
    sizes: ALL_SIZES,
    styles: ["casual", "gym"],
  },
  {
    id: "tape-tshirt",
    name: "T-shirt with Tape Details",
    image: "/images/product-tape-tshirt.png",
    price: 120,
    rating: 4.5,
    category: "t-shirts",
    colors: ["black", "white"],
    sizes: ALL_SIZES,
    styles: ["casual"],
  },
  {
    id: "faded-jeans",
    name: "Faded Skinny Jeans",
    image: "/images/product-faded-jeans.png",
    price: 210,
    rating: 4.5,
    category: "jeans",
    colors: ["blue", "black"],
    sizes: ALL_SIZES,
    styles: ["casual", "gym"],
  },
  {
    id: "classic-hoodie",
    name: "Classic Pullover Hoodie",
    image: "/images/product-courage-tee.png",
    price: 195,
    rating: 4,
    category: "hoodie",
    colors: ["black", "green", "purple"],
    sizes: ALL_SIZES,
    styles: ["casual", "gym"],
  },
  {
    id: "zip-hoodie",
    name: "Zip-Up Hoodie",
    image: "/images/product-black-striped.png",
    price: 220,
    originalPrice: 250,
    discount: 12,
    rating: 4.5,
    category: "hoodie",
    colors: ["black", "blue", "cyan"],
    sizes: ALL_SIZES,
    styles: ["casual", "party"],
  },
];

/** Clone base catalog so listing can paginate (~100 items). Reuses existing images. */
function expandShopCatalog(base: ShopProduct[]): ShopProduct[] {
  const products: ShopProduct[] = [...base];
  const copies = 7;

  for (let copy = 2; copy <= copies; copy++) {
    for (const product of base) {
      const colorOffset = (copy - 1) * 2;
      const colors = [
        COLOR_IDS[(COLOR_IDS.indexOf(product.colors[0] ?? "black") + colorOffset) % COLOR_IDS.length],
        COLOR_IDS[(COLOR_IDS.indexOf(product.colors[1] ?? "white") + colorOffset + 1) % COLOR_IDS.length],
        COLOR_IDS[(colorOffset + copy) % COLOR_IDS.length],
      ];

      const styleA = STYLE_IDS[(STYLE_IDS.indexOf(product.styles[0]) + copy - 1) % STYLE_IDS.length];
      const styleB = STYLE_IDS[(STYLE_IDS.indexOf(product.styles[0]) + copy) % STYLE_IDS.length];
      const priceDelta = ((copy * 11 + product.name.length) % 51) - 20;
      const price = Math.min(250, Math.max(40, product.price + priceDelta));
      const rating = Math.min(5, Math.max(3, product.rating + ((copy % 3) - 1) * 0.5));

      products.push({
        ...product,
        id: `${product.id}-${copy}`,
        name: `${product.name} ${copy}`,
        price,
        originalPrice: product.originalPrice
          ? Math.min(250, Math.max(price + 10, product.originalPrice + priceDelta))
          : undefined,
        discount: product.discount,
        rating,
        colors: [...new Set(colors)],
        styles: [...new Set([styleA, styleB])],
      });
    }
  }

  return products;
}

export const shopProducts: ShopProduct[] = expandShopCatalog(baseShopProducts);

/** The nine cards on Figma Category `26:855`. Extra catalog items appear on later pages / filters. */
export const featuredShopIds = [
  "gradient-tee",
  "polo-tipping",
  "black-striped",
  "skinny-jeans",
  "checkered-shirt",
  "sleeve-striped",
  "vertical-striped",
  "courage-tee",
  "bermuda",
];

export const PRICE_BOUNDS = { min: 0, max: 250 } as const;
export const DEFAULT_PRICE: [number, number] = [50, 200];
export const DEFAULT_COLOR = "black";
export const DEFAULT_SIZE = "Medium";

export type ShopFilters = {
  style?: DressStyleId;
  category?: CategoryId;
  color?: string;
  size?: string;
  price: [number, number];
  sort: "most-popular" | "low-price" | "high-price";
};

export function isDressStyle(value: string | undefined): value is DressStyleId {
  return DRESS_STYLES.some((style) => style.id === value);
}

export function isCategory(value: string | undefined): value is CategoryId {
  return CATEGORIES.some((category) => category.id === value);
}

function sortByFeatured(products: ShopProduct[]) {
  return [...products].sort((a, b) => {
    const ai = featuredShopIds.indexOf(a.id);
    const bi = featuredShopIds.indexOf(b.id);
    const aFeatured = ai !== -1;
    const bFeatured = bi !== -1;
    if (aFeatured && bFeatured) return ai - bi;
    if (aFeatured) return -1;
    if (bFeatured) return 1;
    return 0;
  });
}

export function filterProducts(
  products: ShopProduct[],
  filters: ShopFilters,
  options: { applyFacets: boolean },
) {
  let next = products;

  if (filters.category) {
    next = next.filter((product) => product.category === filters.category);
  }

  if (filters.style) {
    next = next.filter((product) => product.styles.includes(filters.style!));
  }

  if (options.applyFacets) {
    if (filters.color) {
      next = next.filter((product) => product.colors.includes(filters.color!));
    }
    if (filters.size) {
      next = next.filter((product) => product.sizes.includes(filters.size!));
    }
    next = next.filter(
      (product) =>
        product.price >= filters.price[0] && product.price <= filters.price[1],
    );
  } else if (!filters.category && filters.style === "casual") {
    // Keep Figma order on page 1; remaining casual items fill later pages.
    next = sortByFeatured(next);
  }

  if (filters.sort === "low-price") {
    next = [...next].sort((a, b) => a.price - b.price);
  } else if (filters.sort === "high-price") {
    next = [...next].sort((a, b) => b.price - a.price);
  } else if (
    filters.sort === "most-popular" &&
    (filters.category || filters.style !== "casual")
  ) {
    next = sortByFeatured(next);
  }

  return next;
}

export function styleLabel(style: DressStyleId) {
  return DRESS_STYLES.find((item) => item.id === style)?.label ?? "Casual";
}

export function categoryLabel(category: CategoryId) {
  return CATEGORIES.find((item) => item.id === category)?.label ?? category;
}
