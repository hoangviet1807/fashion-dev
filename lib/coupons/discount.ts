/** Coupon terms the client needs to price the cart; validity is re-checked on the server. */
export type AppliedCoupon = {
  code: string;
  type: "percent" | "fixed";
  /** Percent (1–100) or a fixed amount in VND. */
  value: number;
  minSubtotal: number;
  /** Cap for percent coupons; null = uncapped. */
  maxDiscount: number | null;
};

export const COUPON_CODE_MAX = 40;

/** Drops server-only fields (e.g. the row id) before handing a coupon to the client store. */
export function toAppliedCoupon(coupon: AppliedCoupon): AppliedCoupon;
export function toAppliedCoupon(coupon: AppliedCoupon | null): AppliedCoupon | null;
export function toAppliedCoupon(coupon: AppliedCoupon | null): AppliedCoupon | null {
  if (!coupon) return null;
  const { code, type, value, minSubtotal, maxDiscount } = coupon;
  return { code, type, value, minSubtotal, maxDiscount };
}

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

/** Zero when there is no coupon or the subtotal is below its minimum. */
export function couponDiscount(coupon: AppliedCoupon | null, subtotal: number) {
  if (!coupon || subtotal <= 0 || subtotal < coupon.minSubtotal) return 0;
  const amount =
    coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return Math.min(amount, coupon.maxDiscount ?? amount, subtotal);
}

export function couponLabel(coupon: Pick<AppliedCoupon, "code" | "type" | "value">) {
  return coupon.type === "percent" ? `${coupon.code} · -${coupon.value}%` : coupon.code;
}
