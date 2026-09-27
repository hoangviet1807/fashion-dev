import type { CategoryId, DressStyleId } from "@/lib/catalog";

export type ProductVariant = {
  sku: string;
  color: string;
  size: string;
  stock: number;
};

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

export type ProductDetails = {
  material: string[];
  fit: string[];
  features: string[];
  featuresIntro: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** First image is the cover used on cards. */
  images: string[];
  price: number;
  compareAtPrice?: number;
  /** Discount badge percentage; derived from `compareAtPrice` when omitted. */
  discount?: number;
  rating: number;
  reviewCount: number;
  /** Category slug. */
  category: string;
  categoryTitle: string;
  /** Dress style slugs. */
  styles: string[];
  variants: ProductVariant[];
  details: ProductDetails;
  faqs: ProductFaq[];
  reviews: ProductReview[];
};

/** Lightweight shape for cards and listings. */
export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  discount?: number;
  rating: number;
  category: string;
  styles: string[];
  colors: string[];
  sizes: string[];
};

export type ProductSort = "most-popular" | "low-price" | "high-price";

export type ProductFilters = {
  style?: DressStyleId;
  category?: CategoryId;
  color?: string;
  size?: string;
  price?: [number, number];
  sort?: ProductSort;
  /** 1-based. */
  page?: number;
  pageSize?: number;
};

export type ProductListing = {
  items: ProductSummary[];
  total: number;
};
