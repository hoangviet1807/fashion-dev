import { render } from "@react-email/render";
import { and, eq, isNull } from "drizzle-orm";
import { Resend } from "resend";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { getOrderWithItems } from "@/lib/orders/queries";
import { siteUrl } from "@/lib/site-url";
import { OrderConfirmationEmail } from "./OrderConfirmationEmail";

/** Sends the confirmation at most once per order; safe to call repeatedly. */
export async function sendOrderConfirmation(orderId: string) {
  const db = getDb();
  const [claimed] = await db
    .update(orders)
    .set({ confirmationSentAt: new Date() })
    .where(and(eq(orders.id, orderId), isNull(orders.confirmationSentAt)))
    .returning({ id: orders.id });
  if (!claimed) return;

  try {
    const data = await getOrderWithItems(orderId);
    if (!data) return;

    const subject = `Xác nhận đơn hàng #${data.order.number}`;
    const html = await render(
      OrderConfirmationEmail({
        order: data.order,
        items: data.items,
        orderUrl: `${siteUrl()}/order/${orderId}/success`,
      }),
    );

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.info(`[email] RESEND_API_KEY not set; would send "${subject}" to ${data.order.email}`);
      return;
    }

    const { error } = await new Resend(apiKey).emails.send(
      {
        from: process.env.EMAIL_FROM ?? "SHOP.CO <onboarding@resend.dev>",
        to: data.order.email,
        subject,
        html,
      },
      { idempotencyKey: `order-confirmation/${orderId}` },
    );
    if (error) throw new Error(error.message);
  } catch (error) {
    await db
      .update(orders)
      .set({ confirmationSentAt: null })
      .where(eq(orders.id, orderId));
    console.error(`[email] Failed to send confirmation for order ${orderId}`, error);
  }
}
