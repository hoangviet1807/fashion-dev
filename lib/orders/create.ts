import { randomBytes, randomInt } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orderItems, orders, payments } from "@/lib/db/schema";
import type { Quote } from "@/lib/checkout/quote";
import type { CheckoutDetails } from "@/lib/checkout/schema";
import { claimCoupon } from "@/lib/coupons/server";
import { sendOrderConfirmation } from "@/lib/email/order-notifications";
import { SITE_LOCALE } from "@/lib/locale";
import { STORE_CURRENCY } from "@/lib/money";
import { createMomoPayment } from "@/lib/payments/momo";
import { PAYOS_DESCRIPTION_MAX, createPayosPayment } from "@/lib/payments/payos";
import { VNPAY_EXPIRE_MINUTES, buildVnpayUrl } from "@/lib/payments/vnpay";
import { siteUrl } from "@/lib/site-url";
import { commitReservations, reserveStock } from "./inventory";
import { abandonPayment } from "./payments";

export type PlaceOrderResult =
  | { status: "placed"; orderId: string }
  | { status: "redirect"; orderId: string; url: string }
  /** Bank transfer: the shopper scans the VietQR code on `/order/[id]/pay`. */
  | { status: "pay"; orderId: string };

/**
 * Creates the order, its items, a pending payment and stock reservations in one
 * transaction. COD orders are committed immediately; VNPay / MoMo / payOS orders
 * wait for the provider callback. Throws InsufficientStockError when stock can't
 * be held, CouponUnavailableError when the coupon stopped applying,
 * MomoRequestError / PayosRequestError when the provider rejects the request.
 */
export async function placeOrder({
  details,
  location,
  quote,
  ipAddr,
  userId,
}: {
  details: CheckoutDetails;
  /** Province and ward names resolved from the submitted codes. */
  location: { province: string; ward: string };
  quote: Quote;
  ipAddr: string;
  /** Signed-in customer; null for guest checkout. */
  userId: string | null;
}): Promise<PlaceOrderResult> {
  const isCod = details.payment === "cod";
  const expiresAt = new Date(Date.now() + VNPAY_EXPIRE_MINUTES * 60 * 1000);

  const { order, reference } = await getDb().transaction(async (tx) => {
    if (quote.coupon) await claimCoupon(tx, quote.coupon.id, quote.subtotal);

    const [order] = await tx
      .insert(orders)
      .values({
        userId,
        status: isCod ? "awaiting_fulfillment" : "pending_payment",
        email: details.email,
        phone: details.phone,
        shippingAddress: {
          firstName: details.firstName,
          lastName: details.lastName,
          address: details.address,
          apartment: details.apartment,
          ward: location.ward,
          wardCode: details.wardCode,
          province: location.province,
          provinceCode: details.provinceCode,
        },
        shippingMethod: details.shipping,
        paymentMethod: details.payment,
        currency: STORE_CURRENCY,
        subtotal: quote.subtotal,
        discount: quote.discount,
        deliveryFee: quote.deliveryFee,
        total: quote.total,
        couponId: quote.coupon?.id ?? null,
        couponCode: quote.coupon?.code ?? null,
      })
      .returning();

    await tx.insert(orderItems).values(
      quote.lines.map((line) => ({
        orderId: order.id,
        sku: line.sku,
        slug: line.slug,
        name: line.name,
        image: line.image,
        color: line.color,
        size: line.size,
        unitPrice: line.price,
        quantity: line.quantity,
        lineTotal: line.price * line.quantity,
      })),
    );

    await reserveStock(tx, order.id, quote.lines, expiresAt);

    const reference = isCod
      ? `COD${order.number}`
      : details.payment === "payos"
        ? // payOS needs a numeric orderCode that stays unique even if order numbers restart.
          `${order.number}${String(randomInt(10_000)).padStart(4, "0")}`
        : `${order.number}${randomBytes(4).toString("hex").toUpperCase()}`;

    await tx.insert(payments).values({
      orderId: order.id,
      provider: details.payment,
      amount: quote.total,
      currency: STORE_CURRENCY,
      reference,
      expiresAt: isCod ? null : expiresAt,
    });

    return { order, reference };
  });

  if (isCod) {
    await commitReservations(order.id);
    await sendOrderConfirmation(order.id);
    return { status: "placed", orderId: order.id };
  }

  if (details.payment === "payos") {
    try {
      const payPage = `${siteUrl()}/order/${order.id}/pay`;
      const transfer = await createPayosPayment({
        orderCode: Number(reference),
        amountVnd: quote.total,
        description: `DH${order.number}`.slice(0, PAYOS_DESCRIPTION_MAX),
        returnUrl: payPage,
        cancelUrl: payPage,
        expiresAt,
        buyer: {
          name: `${details.lastName} ${details.firstName}`,
          email: details.email,
          phone: details.phone,
        },
      });
      await getDb().update(payments).set({ transfer }).where(eq(payments.reference, reference));
      return { status: "pay", orderId: order.id };
    } catch (error) {
      await abandonPayment(reference);
      throw error;
    }
  }

  const orderInfo = `Thanh toan don hang ${order.number}`;

  if (details.payment === "momo") {
    try {
      const url = await createMomoPayment({
        reference,
        amountVnd: quote.total,
        orderInfo,
        redirectUrl: `${siteUrl()}/api/payments/momo/return`,
        ipnUrl: `${siteUrl()}/api/webhooks/momo`,
        lang: SITE_LOCALE,
      });
      return { status: "redirect", orderId: order.id, url };
    } catch (error) {
      await abandonPayment(reference);
      throw error;
    }
  }

  const url = buildVnpayUrl({
    reference,
    amountVnd: quote.total,
    orderInfo,
    ipAddr,
    returnUrl: `${siteUrl()}/api/payments/vnpay/return`,
    bankCode: details.vnpayMethod === "any" ? undefined : details.vnpayMethod,
    locale: SITE_LOCALE === "vi" ? "vn" : "en",
  });
  return { status: "redirect", orderId: order.id, url };
}
