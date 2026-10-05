import { and, eq, gt, inArray, or, sql } from "drizzle-orm";
import { getDb, type Transaction } from "@/lib/db";
import { coupons, orders, type Coupon } from "@/lib/db/schema";
import { formatPrice } from "@/lib/money";
import { CONFIRMED_ORDER_STATUSES } from "@/lib/orders/status";
import { VNPAY_EXPIRE_MINUTES } from "@/lib/payments/vnpay";
import {
  COUPON_CODE_MAX,
  couponDiscount,
  normalizeCouponCode,
  type AppliedCoupon,
} from "./discount";

const NOT_FOUND = "Mã giảm giá không tồn tại.";
const CODE_PATTERN = /^[A-Z0-9_-]+$/;

export class CouponUnavailableError extends Error {}

export type CouponCheck =
  | { ok: true; coupon: AppliedCoupon & { id: string }; discount: number }
  | { ok: false; message: string };

function toApplied(coupon: Coupon): AppliedCoupon & { id: string } {
  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minSubtotal: coupon.minSubtotal,
    maxDiscount: coupon.maxDiscount,
  };
}

/**
 * Orders holding a use: confirmed ones, plus unpaid ones still inside the
 * payment window (the same window as the stock reservation).
 */
async function countUses(db: Transaction | ReturnType<typeof getDb>, couponId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(
      and(
        eq(orders.couponId, couponId),
        or(
          inArray(orders.status, CONFIRMED_ORDER_STATUSES),
          and(
            eq(orders.status, "pending_payment"),
            gt(orders.createdAt, sql`now() - make_interval(mins => ${VNPAY_EXPIRE_MINUTES})`),
          ),
        ),
      ),
    );
  return row?.count ?? 0;
}

async function usageError(db: Transaction | ReturnType<typeof getDb>, coupon: Coupon) {
  if (coupon.usageLimit === null) return null;
  return (await countUses(db, coupon.id)) >= coupon.usageLimit
    ? "Mã giảm giá đã hết lượt sử dụng."
    : null;
}

/** Checks everything except the usage limit. */
function termsError(coupon: Coupon | undefined, subtotal: number, now = new Date()) {
  if (!coupon || !coupon.active) return NOT_FOUND;
  if (coupon.startsAt && coupon.startsAt > now) return "Mã giảm giá chưa đến thời gian sử dụng.";
  if (coupon.expiresAt && coupon.expiresAt <= now) return "Mã giảm giá đã hết hạn.";
  if (subtotal < coupon.minSubtotal) {
    return `Đơn hàng tối thiểu ${formatPrice(coupon.minSubtotal)} để dùng mã ${coupon.code}.`;
  }
  return null;
}

/** Validates a code against a server-priced subtotal. */
export async function checkCoupon(rawCode: string, subtotal: number): Promise<CouponCheck> {
  const code = normalizeCouponCode(rawCode);
  if (!code || code.length > COUPON_CODE_MAX || !CODE_PATTERN.test(code)) {
    return { ok: false, message: NOT_FOUND };
  }

  const db = getDb();
  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
  const error = termsError(coupon, subtotal) ?? (await usageError(db, coupon));
  if (error) return { ok: false, message: error };

  const applied = toApplied(coupon);
  return { ok: true, coupon: applied, discount: couponDiscount(applied, subtotal) };
}

/**
 * Re-validates the coupon inside the order transaction. Uses are serialised per
 * coupon so concurrent orders cannot exceed `usageLimit`; the lock is held until
 * the transaction (and its new order) commits.
 */
export async function claimCoupon(tx: Transaction, couponId: string, subtotal: number) {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`coupon:${couponId}`}))`);
  const [coupon] = await tx.select().from(coupons).where(eq(coupons.id, couponId)).limit(1);
  const error = termsError(coupon, subtotal) ?? (await usageError(tx, coupon));
  if (error) throw new CouponUnavailableError(error);
}
