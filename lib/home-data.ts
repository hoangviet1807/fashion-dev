import { DRESS_STYLES } from "@/lib/catalog";

export type StyleCard = {
  id: string;
  name: string;
  image: string;
  href: string;
  size: "narrow" | "wide";
};

const STYLE_TILES: Omit<StyleCard, "name">[] = [
  { id: "casual", image: "/images/style-casual.png", href: "/shop?style=casual", size: "narrow" },
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
  { label: "Khuyến mãi", href: "#top-selling" },
  { label: "Hàng mới về", href: "#new-arrivals" },
  { label: "Thương hiệu", href: "#brands" },
];

export const footerColumns = [
  {
    title: "Công ty",
    links: ["Giới thiệu", "Tính năng", "Dự án", "Tuyển dụng"],
  },
  {
    title: "Hỗ trợ",
    links: [
      "Chăm sóc khách hàng",
      "Thông tin giao hàng",
      "Điều khoản & điều kiện",
      "Chính sách bảo mật",
    ],
  },
  {
    title: "Câu hỏi",
    links: ["Tài khoản", "Quản lý giao hàng", "Đơn hàng", "Thanh toán"],
  },
  {
    title: "Tài nguyên",
    links: [
      "Ebook miễn phí",
      "Hướng dẫn phát triển",
      "Blog hướng dẫn",
      "Danh sách Youtube",
    ],
  },
];

export const payments = [
  { src: "/badges/visa.svg", alt: "Visa" },
  { src: "/badges/mastercard.svg", alt: "Mastercard" },
  { src: "/badges/paypal.svg", alt: "PayPal" },
  { src: "/badges/apple-pay.svg", alt: "Apple Pay" },
  { src: "/badges/google-pay.svg", alt: "Google Pay" },
];
