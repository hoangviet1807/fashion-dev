import { eq, sql } from "drizzle-orm";
import { getDb, type Transaction } from "@/lib/db";
import { orderEvents, orders, refunds, type Order } from "@/lib/db/schema";
import { sendShippingNotification } from "@/lib/email/order-notifications";
import { formatPrice } from "@/lib/money";
import { releaseReservations, restockOrder } from "./inventory";
import { ORDER_STATUS_LABELS } from "./status";

export class OrderTransitionError extends Error {}

export const SHIPPABLE: Order["status"][] = ["paid", "awaiting_fulfillment", "shipped"];
export const DELIVERABLE: Order["status"][] = ["paid", "awaiting_fulfillment", "shipped"];
/** Unpaid online orders expire on their own; cancelling them could race a late payment. */
export const CANCELLABLE: Order["status"][] = ["paid", "awaiting_fulfillment", "shipped"];

type Actor = { actorId?: string | null };

async function lockOrder(tx: Transaction, orderNumber: number) {
  const [order] = await tx
    .select()
    .from(orders)
    .where(eq(orders.number, orderNumber))
    .for("update");
  return order ?? null;
}

function assertStatus(
  order: Order | null,
  orderNumber: number,
  allowed: Order["status"][],
  action: string,
): asserts order is Order {
  if (!order) throw new OrderTransitionError(`Không tìm thấy đơn hàng #${orderNumber}.`);
  if (!allowed.includes(order.status)) {
    throw new OrderTransitionError(
      `Đơn hàng #${orderNumber} đang ở trạng thái “${ORDER_STATUS_LABELS[order.status]}”, không thể ${action}.`,
    );
  }
}

function trackingNote(carrier: string | null, trackingNumber: string | null) {
  return [carrier, trackingNumber].filter(Boolean).join(" · ") || null;
}

/** Money already returned to the customer; 0 when none. */
export async function refundedAmount(tx: Transaction, orderId: string) {
  const [row] = await tx
    .select({ total: sql<number>`coalesce(sum(${refunds.amount}), 0)::int` })
    .from(refunds)
    .where(eq(refunds.orderId, orderId));
  return row?.total ?? 0;
}

/** Paid online, or COD once delivered (the courier collected the cash). */
export function isRefundable(order: Pick<Order, "paidAt">) {
  return order.paidAt !== null;
}

/**
 * Marks a confirmed order as handed to the carrier and emails the customer once.
 * Re-running on a shipped order updates the carrier / tracking number without
 * re-sending the email.
 */
export async function markOrderShipped({
  orderNumber,
  carrier,
  trackingNumber,
  actorId = null,
}: {
  orderNumber: number;
  carrier?: string | null;
  trackingNumber?: string | null;
} & Actor) {
  const orderId = await getDb().transaction(async (tx) => {
    const order = await lockOrder(tx, orderNumber);
    assertStatus(order, orderNumber, SHIPPABLE, "chuyển sang Đang giao");

    const wasShipped = order.status === "shipped";
    const nextCarrier = carrier?.trim() || order.carrier;
    const nextTracking = trackingNumber?.trim() || order.trackingNumber;
    await tx
      .update(orders)
      .set({
        status: "shipped",
        carrier: nextCarrier,
        trackingNumber: nextTracking,
        shippedAt: order.shippedAt ?? new Date(),
      })
      .where(eq(orders.id, order.id));

    const changed = nextCarrier !== order.carrier || nextTracking !== order.trackingNumber;
    if (!wasShipped || changed) {
      await tx.insert(orderEvents).values({
        orderId: order.id,
        type: wasShipped ? "tracking_updated" : "shipped",
        note: trackingNote(nextCarrier, nextTracking),
        actorId,
      });
    }
    return order.id;
  });

  const emailed = await sendShippingNotification(orderId);
  return { orderId, emailed };
}

export async function markOrderDelivered({ orderNumber, actorId = null }: { orderNumber: number } & Actor) {
  const orderId = await getDb().transaction(async (tx) => {
    const order = await lockOrder(tx, orderNumber);
    assertStatus(order, orderNumber, DELIVERABLE, "chuyển sang Hoàn tất");
    await tx
      .update(orders)
      .set({ status: "fulfilled", paidAt: order.paidAt ?? new Date() })
      .where(eq(orders.id, order.id));
    await tx.insert(orderEvents).values({ orderId: order.id, type: "delivered", actorId });
    return order.id;
  });
  return { orderId };
}

/**
 * Cancels a confirmed order. With `restock`, sold units go back into Sanity
 * stock. Money is not returned automatically — record it with `recordRefund`
 * after refunding through the provider.
 */
export async function cancelOrder({
  orderNumber,
  reason,
  restock,
  actorId = null,
}: { orderNumber: number; reason: string; restock: boolean } & Actor) {
  const orderId = await getDb().transaction(async (tx) => {
    const order = await lockOrder(tx, orderNumber);
    assertStatus(order, orderNumber, CANCELLABLE, "huỷ");
    await tx.update(orders).set({ status: "cancelled" }).where(eq(orders.id, order.id));
    // Holds that were never turned into stock decrements (e.g. Sanity write failed).
    await releaseReservations(tx, order.id);
    await tx.insert(orderEvents).values({
      orderId: order.id,
      type: "cancelled",
      note: `${reason}${restock ? " · Đã nhập lại kho" : ""}`,
      actorId,
    });
    return order.id;
  });

  const restocked = restock ? await restockOrder(orderId) : null;
  return { orderId, restocked };
}

/** Records money returned to the customer; never more than was paid in total. */
export async function recordRefund({
  orderNumber,
  amount,
  reason,
  actorId = null,
}: { orderNumber: number; amount: number; reason: string } & Actor) {
  return getDb().transaction(async (tx) => {
    const order = await lockOrder(tx, orderNumber);
    if (!order) throw new OrderTransitionError(`Không tìm thấy đơn hàng #${orderNumber}.`);
    if (!isRefundable(order)) {
      throw new OrderTransitionError(
        `Đơn hàng #${orderNumber} chưa được thanh toán nên không thể hoàn tiền.`,
      );
    }

    const refunded = await refundedAmount(tx, order.id);
    const remaining = order.total - refunded;
    if (amount > remaining) {
      throw new OrderTransitionError(
        remaining > 0
          ? `Chỉ còn có thể hoàn tối đa ${formatPrice(remaining, order.currency)}.`
          : `Đơn hàng #${orderNumber} đã được hoàn tiền toàn bộ.`,
      );
    }

    await tx.insert(refunds).values({ orderId: order.id, amount, reason, createdBy: actorId });
    await tx.insert(orderEvents).values({
      orderId: order.id,
      type: "refunded",
      note: `${formatPrice(amount, order.currency)} · ${reason}`,
      actorId,
    });
    return { orderId: order.id, refunded: refunded + amount };
  });
}
