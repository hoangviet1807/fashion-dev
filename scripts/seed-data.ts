/** Sample catalog seeded into Sanity by `pnpm seed`. Image paths are relative to `public/`. */

export const CATEGORIES = [
  { slug: "t-shirts", title: "T-shirts" },
  { slug: "shorts", title: "Shorts" },
  { slug: "shirts", title: "Shirts" },
  { slug: "hoodie", title: "Hoodie" },
  { slug: "jeans", title: "Jeans" },
];

export const DRESS_STYLES = [
  { slug: "casual", title: "Casual" },
  { slug: "formal", title: "Formal" },
  { slug: "party", title: "Party" },
  { slug: "gym", title: "Gym" },
];

export const BRANDS = [
  { name: "Versace", slug: "versace", logo: "brands/versace.svg" },
  { name: "Zara", slug: "zara", logo: "brands/zara.svg" },
  { name: "Gucci", slug: "gucci", logo: "brands/gucci.svg" },
  { name: "Prada", slug: "prada", logo: "brands/prada.svg" },
  { name: "Calvin Klein", slug: "calvin-klein", logo: "brands/calvin-klein.svg" },
];

/** Sample brand per product slug, so every brand filter has results. */
export const PRODUCT_BRANDS: Record<string, string> = {
  "gradient-tee": "zara",
  "polo-tipping": "calvin-klein",
  "black-striped": "zara",
  "skinny-jeans": "calvin-klein",
  "checkered-shirt": "prada",
  "sleeve-striped": "zara",
  "vertical-striped": "prada",
  "courage-tee": "versace",
  bermuda: "zara",
  "tape-tshirt": "calvin-klein",
  "faded-jeans": "versace",
  "classic-hoodie": "gucci",
  "zip-hoodie": "gucci",
  "one-life": "versace",
};

export const TESTIMONIALS = [
  {
    name: "Sarah M.",
    quote:
      "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
  },
  {
    name: "Alex K.",
    quote:
      "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
  },
  {
    name: "James L.",
    quote:
      "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.",
  },
  {
    name: "Mooen",
    quote:
      "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.",
  },
];

export const PRODUCT_FAQS = [
  {
    question: "What sizes are available?",
    answer:
      "We offer sizes from S to XL on this product. Check the size selector above for current options.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping typically takes 5–7 business days. Express options are available at checkout.",
  },
  {
    question: "Can I return the item?",
    answer:
      "Yes. We offer a 30-day money-back guarantee. If you're not satisfied, return it unworn for a full refund.",
  },
  {
    question: "Is the design printed or embroidered?",
    answer:
      "The design is screen printed with durable ink that holds up through many washes.",
  },
];

export const DEFAULT_DESCRIPTION =
  "This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.";

export const DEFAULT_DETAILS = {
  material: [
    "Fabric: 100% Organic Cotton — premium quality, breathable and soft",
    "Weight: 180 GSM — comfortable in any season",
    "Care: Machine wash cold. Tumble dry low. Do not bleach",
  ],
  fit: [
    "Fit: Classic, comfortable relaxed fit",
    "Length: Regular length, hits at hip",
    "Design: Crew neck with reinforced seams",
  ],
  featuresIntro:
    "This graphic t-shirt features a unique design that combines modern aesthetics with classic comfort. Perfect for any occasion, from casual everyday wear to creative expression.",
  features: [
    "High-quality screen printed design",
    "Durable stitching that withstands multiple washes",
    "Eco-friendly, sustainably sourced material",
    "Available in multiple sizes and colors",
  ],
};

export const VARIANT_SIZES = ["S", "M", "L", "XL"];

export type SeedProduct = {
  slug: string;
  name: string;
  images: string[];
  /** VND. */
  price: number;
  compareAtPrice?: number;
  discount?: number;
  rating: number;
  category: string;
  styles: string[];
  colors: string[];
  related?: string[];
};

/** Ordered by popularity; the first nine match Figma Category `26:855`. */
export const PRODUCTS: SeedProduct[] = [
  { slug: "gradient-tee", name: "Gradient Graphic T-shirt", images: ["images/product-gradient-tee.png"], price: 145000, rating: 3.5, category: "t-shirts", colors: ["white", "pink", "orange"], styles: ["casual", "party"] },
  { slug: "polo-tipping", name: "Polo with Tipping Details", images: ["images/product-polo-tipping.png"], price: 180000, rating: 4.5, category: "t-shirts", colors: ["red", "pink", "black"], styles: ["casual", "formal"] },
  { slug: "black-striped", name: "Black Striped T-shirt", images: ["images/product-black-striped.png"], price: 120000, compareAtPrice: 150000, discount: 30, rating: 5, category: "t-shirts", colors: ["black", "white"], styles: ["casual", "party"] },
  { slug: "skinny-jeans", name: "Skinny Fit Jeans", images: ["images/product-skinny-jeans.png"], price: 240000, compareAtPrice: 260000, discount: 20, rating: 3.5, category: "jeans", colors: ["blue", "black"], styles: ["casual"] },
  { slug: "checkered-shirt", name: "Checkered Shirt", images: ["images/product-checkered-shirt.png"], price: 180000, rating: 4.5, category: "shirts", colors: ["red", "black", "white"], styles: ["casual", "formal"] },
  { slug: "sleeve-striped", name: "Sleeve Striped T-shirt", images: ["images/product-sleeve-striped.png"], price: 130000, compareAtPrice: 160000, discount: 30, rating: 4.5, category: "t-shirts", colors: ["orange", "black", "white"], styles: ["casual", "party"] },
  { slug: "vertical-striped", name: "Vertical Striped Shirt", images: ["images/product-vertical-striped.png"], price: 212000, compareAtPrice: 232000, discount: 20, rating: 5, category: "shirts", colors: ["green", "black"], styles: ["casual", "formal"] },
  { slug: "courage-tee", name: "Courage Graphic T-shirt", images: ["images/product-courage-tee.png"], price: 145000, rating: 4, category: "t-shirts", colors: ["orange", "black"], styles: ["casual", "gym"] },
  { slug: "bermuda", name: "Loose Fit Bermuda Shorts", images: ["images/product-bermuda.png"], price: 80000, rating: 3, category: "shorts", colors: ["blue", "black"], styles: ["casual", "gym"] },
  { slug: "tape-tshirt", name: "T-shirt with Tape Details", images: ["images/product-tape-tshirt.png"], price: 120000, rating: 4.5, category: "t-shirts", colors: ["black", "white"], styles: ["casual"] },
  { slug: "faded-jeans", name: "Faded Skinny Jeans", images: ["images/product-faded-jeans.png"], price: 210000, rating: 4.5, category: "jeans", colors: ["blue", "black"], styles: ["casual", "gym"] },
  { slug: "classic-hoodie", name: "Classic Pullover Hoodie", images: ["images/product-courage-tee.png"], price: 195000, rating: 4, category: "hoodie", colors: ["black", "green", "purple"], styles: ["casual", "gym"] },
  { slug: "zip-hoodie", name: "Zip-Up Hoodie", images: ["images/product-black-striped.png"], price: 220000, compareAtPrice: 250000, discount: 12, rating: 4.5, category: "hoodie", colors: ["black", "blue", "cyan"], styles: ["casual", "party"] },
  {
    slug: "one-life",
    name: "One Life Graphic T-shirt",
    images: [
      "images/product-one-life-1.png",
      "images/product-one-life-2.png",
      "images/product-one-life-3.png",
    ],
    price: 260000,
    compareAtPrice: 300000,
    discount: 40,
    rating: 4.5,
    category: "t-shirts",
    colors: ["olive", "forest", "navy"],
    styles: ["casual", "party"],
    related: ["gradient-tee", "polo-tipping", "black-striped", "vertical-striped"],
  },
];

export const NEW_ARRIVALS = ["tape-tshirt", "skinny-jeans", "checkered-shirt", "sleeve-striped"];
export const TOP_SELLING = ["vertical-striped", "courage-tee", "bermuda", "faded-jeans"];
