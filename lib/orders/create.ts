import { randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";
import { orderItems, orders, payments } from "@/lib/db/schema";
import type { Quote } from "@/lib/checkout/quote";
import type { CheckoutDetails } from "@/lib/checkout/schema";
import { sendOrderConfirmation } from "@/lib/email/send-order-confirmation";
import { SITE_LOCALE } from "@/lib/locale";
import { STORE_CURRENCY } from "@/lib/money";
import { createMomoPayment } from "@/lib/payments/momo";
import { VNPAY_EXPIRE_MINUTES, buildVnpayUrl } from "@/lib/payments/vnpay";
import { siteUrl } from "@/lib/site-url";
import { commitReservations, reserveStock } from "./inventory";
import { abandonPayment } from "./payments";

export type PlaceOrderResult =
  | { status: "placed"; orderId: string }
  | { status: "redirect"; orderId: string; url: string };

/**
 * Creates the order, its items, a pending payment and stock reservations in one
 * transaction. COD orders are committed immediately; VNPay / MoMo orders wait for
 * the provider callback. Throws InsufficientStockError when stock can't be held,
 * MomoRequestError when MoMo rejects the payment request.
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
      : `${order.number}${randomBytes(4).toString("hex").toUpperCase()}`;

    await tx.insert(payments).values({
      orderId: order.id,
      provider: details.payment,
      amount: quote.total,
      currency: STORE_CURRENCY,
      reference,
    });

    return { order, reference };
  });

  if (isCod) {
    await commitReservations(order.id);
    await sendOrderConfirmation(order.id);
    return { status: "placed", orderId: order.id };
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
