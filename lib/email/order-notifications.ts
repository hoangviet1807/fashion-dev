import { render } from "@react-email/render";
import { and, eq, isNull } from "drizzle-orm";
import type { ReactElement } from "react";
import { getDb } from "@/lib/db";
import { orders, type Order, type OrderItem } from "@/lib/db/schema";
import { getOrderWithItems } from "@/lib/orders/queries";
import { siteUrl } from "@/lib/site-url";
import { OrderConfirmationEmail } from "./OrderConfirmationEmail";
import { OrderShippedEmail } from "./OrderShippedEmail";
import { sendEmail } from "./send";

type SentColumn = "confirmationSentAt" | "shippingNotifiedAt";

/**
 * Claims `column` before sending so concurrent callers (IPN + return URL) send
 * one email; the claim is released if sending fails so a retry can resend.
 */
async function sendOnce(
  orderId: string,
  column: SentColumn,
  kind: string,
  build: (data: { order: Order; items: OrderItem[]; orderUrl: string }) => {
    subject: string;
    email: ReactElement;
  },
) {
  const db = getDb();
  const [claimed] = await db
    .update(orders)
    .set({ [column]: new Date() })
    .where(and(eq(orders.id, orderId), isNull(orders[column])))
    .returning({ id: orders.id });
  if (!claimed) return false;

  try {
    const data = await getOrderWithItems(orderId);
    if (!data) return false;

    const { subject, email } = build({
      ...data,
      orderUrl: `${siteUrl()}/order/${orderId}/success`,
    });
    await sendEmail({
      to: data.order.email,
      subject,
      html: await render(email),
      idempotencyKey: `${kind}/${orderId}`,
    });
    return true;
  } catch (error) {
    await db
      .update(orders)
      .set({ [column]: null })
      .where(eq(orders.id, orderId));
    console.error(`[email] Failed to send ${kind} for order ${orderId}`, error);
    return false;
  }
}

/** Sends the confirmation at most once per order; safe to call repeatedly. */
export function sendOrderConfirmation(orderId: string) {
  return sendOnce(orderId, "confirmationSentAt", "order-confirmation", ({ order, items, orderUrl }) => ({
    subject: `Xác nhận đơn hàng #${order.number}`,
    email: OrderConfirmationEmail({ order, items, orderUrl }),
  }));
}

/** Sends the "on its way" email at most once per order. */
export function sendShippingNotification(orderId: string) {
  return sendOnce(orderId, "shippingNotifiedAt", "order-shipped", ({ order, items, orderUrl }) => ({
    subject: `Đơn hàng #${order.number} đang được giao`,
    email: OrderShippedEmail({ order, items, orderUrl }),
  }));
}
