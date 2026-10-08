import { CATEGORIES, DRESS_STYLES } from "@/lib/catalog";

export type StyleCard = {
  id: string;
  name: string;
  image: string;
  href: string;
  size: "narrow" | "wide";
  /** The subject stands on the left of the photo; flip it so the label stays clear. */
  mirrored?: boolean;
};

const STYLE_TILES: Omit<StyleCard, "name">[] = [
  { id: "casual", image: "/images/style-casual.png", href: "/shop?style=casual", size: "narrow", mirrored: true },
  { id: "formal", image: "/images/style-formal.png", href: "/shop?style=formal", size: "wide" },
  { id: "party", image: "/images/style-party.png", href: "/shop?style=party", size: "wide" },
  { id: "gym", image: "/images/style-gym.png", href: "/shop?style=gym", size: "narrow" },
];

export const dressStyles: StyleCard[] = STYLE_TILES.map((tile) => ({
  ...tile,
  name: DRESS_STYLES.find((style) => style.id === tile.id)?.label ?? tile.id,
}));

export const navLinks = [
  { label: "Cửa hàng", href: "/shop", hasMenu: true },
  { label: "Khuyến mãi", href: "/shop?sale=1" },
  { label: "Hàng mới về", href: "/shop?sort=newest" },
  { label: "Thương hiệu", href: "/#brands" },
];

/** Slugs of the Sanity `page` documents linked from the footer (`pnpm seed:pages`). */
export const CONTENT_PAGES = {
  about: "gioi-thieu",
  faq: "cau-hoi-thuong-gap",
  shipping: "giao-hang",
  returns: "doi-tra",
  privacy: "chinh-sach-bao-mat",
  terms: "dieu-khoan",
} as const;

export type FooterLink = { label: string; href: string };

export const footerColumns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Công ty",
    links: [
      { label: "Giới thiệu", href: `/${CONTENT_PAGES.about}` },
      { label: "Hàng mới về", href: "/shop?sort=newest" },
      { label: "Khuyến mãi", href: "/shop?sale=1" },
      { label: "Thương hiệu", href: "/#brands" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Câu hỏi thường gặp", href: `/${CONTENT_PAGES.faq}` },
      { label: "Thông tin giao hàng", href: `/${CONTENT_PAGES.shipping}` },
      { label: "Đổi trả & hoàn tiền", href: `/${CONTENT_PAGES.returns}` },
      { label: "Điều khoản & điều kiện", href: `/${CONTENT_PAGES.terms}` },
      { label: "Chính sách bảo mật", href: `/${CONTENT_PAGES.privacy}` },
    ],
  },
  {
    title: "Tài khoản",
    links: [
      { label: "Tài khoản", href: "/account" },
      { label: "Đơn hàng", href: "/account/orders" },
      { label: "Sổ địa chỉ", href: "/account/addresses" },
      { label: "Yêu thích", href: "/wishlist" },
      { label: "Giỏ hàng", href: "/cart" },
    ],
  },
  {
    title: "Danh mục",
    links: CATEGORIES.map((category) => ({
      label: category.label,
      href: `/shop?category=${category.id}`,
    })),
  },
];

export const payments = [
  { src: "/badges/visa.svg", alt: "Visa" },
  { src: "/badges/mastercard.svg", alt: "Mastercard" },
  { src: "/badges/paypal.svg", alt: "PayPal" },
  { src: "/badges/apple-pay.svg", alt: "Apple Pay" },
  { src: "/badges/google-pay.svg", alt: "Google Pay" },
];
