export type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
};

export type Review = {
  id: string;
  name: string;
  quote: string;
};

export type StyleCard = {
  id: string;
  name: string;
  image: string;
  href: string;
  size: "narrow" | "wide";
};

export const newArrivals: Product[] = [
  {
    id: "tape-tshirt",
    name: "T-shirt with Tape Details",
    image: "/images/product-tape-tshirt.png",
    price: 120,
    rating: 4.5,
  },
  {
    id: "skinny-jeans",
    name: "Skinny Fit Jeans",
    image: "/images/product-skinny-jeans.png",
    price: 240,
    originalPrice: 260,
    discount: 20,
    rating: 3.5,
  },
  {
    id: "checkered-shirt",
    name: "Checkered Shirt",
    image: "/images/product-checkered-shirt.png",
    price: 180,
    rating: 4.5,
  },
  {
    id: "sleeve-striped",
    name: "Sleeve Striped T-shirt",
    image: "/images/product-sleeve-striped.png",
    price: 130,
    originalPrice: 160,
    discount: 30,
    rating: 4.5,
  },
];

export const topSelling: Product[] = [
  {
    id: "vertical-striped",
    name: "Vertical Striped Shirt",
    image: "/images/product-vertical-striped.png",
    price: 212,
    originalPrice: 232,
    discount: 20,
    rating: 5,
  },
  {
    id: "courage-tee",
    name: "Courage Graphic T-shirt",
    image: "/images/product-courage-tee.png",
    price: 145,
    rating: 4,
  },
  {
    id: "bermuda",
    name: "Loose Fit Bermuda Shorts",
    image: "/images/product-bermuda.png",
    price: 80,
    rating: 3,
  },
  {
    id: "faded-jeans",
    name: "Faded Skinny Jeans",
    image: "/images/product-faded-jeans.png",
    price: 210,
    rating: 4.5,
  },
];

export const dressStyles: StyleCard[] = [
  {
    id: "casual",
    name: "Casual",
    image: "/images/style-casual.png",
    href: "/shop?style=casual",
    size: "narrow",
  },
  {
    id: "formal",
    name: "Formal",
    image: "/images/style-formal.png",
    href: "/shop?style=formal",
    size: "wide",
  },
  {
    id: "party",
    name: "Party",
    image: "/images/style-party.png",
    href: "/shop?style=party",
    size: "wide",
  },
  {
    id: "gym",
    name: "Gym",
    image: "/images/style-gym.png",
    href: "/shop?style=gym",
    size: "narrow",
  },
];

export const reviews: Review[] = [
  {
    id: "sarah",
    name: "Sarah M.",
    quote:
      "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
  },
  {
    id: "alex",
    name: "Alex K.",
    quote:
      "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
  },
  {
    id: "james",
    name: "James L.",
    quote:
      "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.",
  },
  {
    id: "mooen",
    name: "Mooen",
    quote:
      "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends.",
  },
];

export const navLinks = [
  { label: "Shop", href: "/shop", hasMenu: true },
  { label: "On Sale", href: "#top-selling" },
  { label: "New Arrivals", href: "#new-arrivals" },
  { label: "Brands", href: "#brands" },
];

export const footerColumns = [
  {
    title: "Company",
    links: ["About", "Features", "Works", "Career"],
  },
  {
    title: "Help",
    links: [
      "Customer Support",
      "Delivery Details",
      "Terms & Conditions",
      "Privacy Policy",
    ],
  },
  {
    title: "FAQ",
    links: ["Account", "Manage Deliveries", "Orders", "Payments"],
  },
  {
    title: "Resources",
    links: [
      "Free eBooks",
      "Development Tutorial",
      "How to - Blog",
      "Youtube Playlist",
    ],
  },
];

export const brands = [
  { src: "/brands/versace.svg", alt: "Versace", width: 167, height: 34 },
  { src: "/brands/zara.svg", alt: "Zara", width: 91, height: 38 },
  { src: "/brands/gucci.svg", alt: "Gucci", width: 156, height: 36 },
  { src: "/brands/prada.svg", alt: "Prada", width: 194, height: 32 },
  { src: "/brands/calvin-klein.svg", alt: "Calvin Klein", width: 207, height: 34 },
];

export const payments = [
  { src: "/badges/visa.svg", alt: "Visa" },
  { src: "/badges/mastercard.svg", alt: "Mastercard" },
  { src: "/badges/paypal.svg", alt: "PayPal" },
  { src: "/badges/apple-pay.svg", alt: "Apple Pay" },
  { src: "/badges/google-pay.svg", alt: "Google Pay" },
];
