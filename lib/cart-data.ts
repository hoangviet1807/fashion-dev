export type CartLine = {
  id: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
};

/** Default Figma cart contents (desktop 31:32 / mobile 39:1045). */
export const initialCartItems: CartLine[] = [
  {
    id: "gradient-tee",
    name: "Gradient Graphic T-shirt",
    image: "/images/product-gradient-tee.png",
    price: 145,
    size: "Large",
    color: "White",
    quantity: 1,
  },
  {
    id: "checkered-shirt",
    name: "Checkered Shirt",
    image: "/images/product-checkered-shirt.png",
    price: 180,
    size: "Medium",
    color: "Red",
    quantity: 1,
  },
  {
    id: "skinny-jeans",
    name: "Skinny Fit Jeans",
    image: "/images/product-skinny-jeans.png",
    price: 240,
    size: "Large",
    color: "Blue",
    quantity: 1,
  },
];

export const CART_DISCOUNT_PERCENT = 20;
export const DELIVERY_FEE = 15;

export function cartSubtotal(items: CartLine[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartDiscount(subtotal: number) {
  return Math.round((subtotal * CART_DISCOUNT_PERCENT) / 100);
}

export function cartTotal(subtotal: number, discount: number) {
  return subtotal - discount + DELIVERY_FEE;
}
