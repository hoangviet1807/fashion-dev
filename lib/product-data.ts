import type { ShopProduct } from "@/lib/shop-data";
import { shopProducts } from "@/lib/shop-data";

export type ProductReview = {
  id: string;
  name: string;
  rating: number;
  quote: string;
  postedOn: string;
};

export type ProductFaq = {
  id: string;
  question: string;
  answer: string;
};

export type ProductDetail = ShopProduct & {
  description: string;
  gallery: string[];
  colorHex: { id: string; hex: string; check: "white" | "black" }[];
  pdpSizes: string[];
  defaultSize: string;
  defaultColor: string;
  breadcrumb: { label: string; href?: string }[];
  relatedIds: string[];
  reviews: ProductReview[];
  reviewCount: number;
  faqs: ProductFaq[];
  details: {
    material: string[];
    fit: string[];
    features: string[];
    featuresIntro: string;
  };
};

const DEFAULT_DESCRIPTION =
  "This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.";

const DEFAULT_REVIEWS: ProductReview[] = [
  {
    id: "samantha",
    name: "Samantha D.",
    rating: 4.5,
    quote:
      "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt.",
    postedOn: "Posted on August 14, 2023",
  },
  {
    id: "alex",
    name: "Alex M.",
    rating: 4,
    quote:
      "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.",
    postedOn: "Posted on August 15, 2023",
  },
  {
    id: "ethan",
    name: "Ethan R.",
    rating: 3.5,
    quote:
      "This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer's touch in every aspect of this shirt.",
    postedOn: "Posted on August 16, 2023",
  },
  {
    id: "olivia",
    name: "Olivia P.",
    rating: 4,
    quote:
      "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It's evident that the designer poured their creativity into making this t-shirt stand out.",
    postedOn: "Posted on August 17, 2023",
  },
  {
    id: "liam",
    name: "Liam K.",
    rating: 4,
    quote:
      "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill. It's like wearing a piece of art that reflects my passion for both design and fashion.",
    postedOn: "Posted on August 18, 2023",
  },
  {
    id: "ava",
    name: "Ava H.",
    rating: 4.5,
    quote:
      "I'm not just wearing a t-shirt; I'm wearing a piece of design philosophy. The intricate details and thoughtful layout of the design make this shirt a conversation starter.",
    postedOn: "Posted on August 19, 2023",
  },
];

const DEFAULT_FAQS: ProductFaq[] = [
  {
    id: "sizes",
    question: "What sizes are available?",
    answer:
      "We offer sizes from Small to X-Large on this product. Check the size selector above for current options.",
  },
  {
    id: "shipping",
    question: "How long does shipping take?",
    answer:
      "Standard shipping typically takes 5–7 business days. Express options are available at checkout.",
  },
  {
    id: "returns",
    question: "Can I return the item?",
    answer:
      "Yes. We offer a 30-day money-back guarantee. If you're not satisfied, return it unworn for a full refund.",
  },
  {
    id: "print",
    question: "Is the design printed or embroidered?",
    answer:
      "The design is screen printed with durable ink that holds up through many washes.",
  },
];

const DEFAULT_DETAILS: ProductDetail["details"] = {
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

const COLOR_HEX: Record<string, { hex: string; check: "white" | "black" }> = {
  green: { hex: "#00C12B", check: "white" },
  red: { hex: "#F50606", check: "white" },
  yellow: { hex: "#F5DD06", check: "black" },
  orange: { hex: "#F57906", check: "white" },
  cyan: { hex: "#06CAF5", check: "black" },
  blue: { hex: "#063AF5", check: "white" },
  purple: { hex: "#7D06F5", check: "white" },
  pink: { hex: "#F506A4", check: "white" },
  white: { hex: "#FFFFFF", check: "black" },
  black: { hex: "#000000", check: "white" },
  olive: { hex: "#4F4631", check: "white" },
  forest: { hex: "#314F4A", check: "white" },
  navy: { hex: "#31344F", check: "white" },
};

const PDP_SIZES = ["Small", "Medium", "Large", "X-Large"] as const;

const oneLife: ProductDetail = {
  id: "one-life",
  name: "One Life Graphic T-shirt",
  image: "/images/product-one-life-1.png",
  price: 260,
  originalPrice: 300,
  discount: 40,
  rating: 4.5,
  category: "t-shirts",
  colors: ["olive", "forest", "navy"],
  sizes: [...PDP_SIZES],
  styles: ["casual", "party"],
  description: DEFAULT_DESCRIPTION,
  gallery: [
    "/images/product-one-life-1.png",
    "/images/product-one-life-2.png",
    "/images/product-one-life-3.png",
  ],
  colorHex: [
    { id: "olive", hex: "#4F4631", check: "white" },
    { id: "forest", hex: "#314F4A", check: "white" },
    { id: "navy", hex: "#31344F", check: "white" },
  ],
  pdpSizes: [...PDP_SIZES],
  defaultSize: "Large",
  defaultColor: "olive",
  breadcrumb: [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Men", href: "/shop?style=casual" },
    { label: "T-shirts" },
  ],
  relatedIds: ["gradient-tee", "polo-tipping", "black-striped", "vertical-striped"],
  reviews: DEFAULT_REVIEWS,
  reviewCount: 451,
  faqs: DEFAULT_FAQS,
  details: DEFAULT_DETAILS,
};

function toDetail(product: ShopProduct): ProductDetail {
  const colorHex = product.colors.map((id) => ({
    id,
    hex: COLOR_HEX[id]?.hex ?? "#000000",
    check: COLOR_HEX[id]?.check ?? ("white" as const),
  }));

  const relatedIds = shopProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 4)
    .map((item) => item.id);

  return {
    ...product,
    description: DEFAULT_DESCRIPTION,
    gallery: [product.image, product.image, product.image],
    colorHex,
    pdpSizes: [...PDP_SIZES],
    defaultSize: product.sizes.includes("Large") ? "Large" : PDP_SIZES[0],
    defaultColor: product.colors[0] ?? "black",
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Men", href: "/shop?style=casual" },
      { label: product.category.replace("-", " ") },
    ],
    relatedIds,
    reviews: DEFAULT_REVIEWS,
    reviewCount: 451,
    faqs: DEFAULT_FAQS,
    details: DEFAULT_DETAILS,
  };
}

const catalog: ProductDetail[] = [
  oneLife,
  ...shopProducts.map(toDetail),
];

export function getProduct(id: string): ProductDetail | undefined {
  return catalog.find((product) => product.id === id);
}

export function getAllProductIds(): string[] {
  return catalog.map((product) => product.id);
}

export function getRelatedProducts(product: ProductDetail): ShopProduct[] {
  return product.relatedIds
    .map((id) => shopProducts.find((item) => item.id === id))
    .filter((item): item is ShopProduct => Boolean(item));
}
