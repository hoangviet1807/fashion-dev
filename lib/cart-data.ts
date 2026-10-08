export const SHIPPING_METHODS = {
  standard: { label: "Giao hàng tiêu chuẩn", eta: "3–5 ngày làm việc", fee: 30000 },
  express: { label: "Giao hàng nhanh", eta: "1–2 ngày làm việc", fee: 50000 },
} as const;

export type ShippingMethodId = keyof typeof SHIPPING_METHODS;

export const DELIVERY_FEE = SHIPPING_METHODS.standard.fee;

/** Standard delivery is free once the subtotal reaches `freeFrom` (null = never). */
export function deliveryFeeFor(
  method: ShippingMethodId,
  subtotal: number,
  freeFrom: number | null,
) {
  if (method === "standard" && freeFrom !== null && subtotal >= freeFrom) return 0;
  return SHIPPING_METHODS[method].fee;
}

export function cartSubtotal(items: { price: number; quantity: number }[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartTotal(
  subtotal: number,
  discount: number,
  deliveryFee: number = DELIVERY_FEE,
) {
  return subtotal - discount + deliveryFee;
}
