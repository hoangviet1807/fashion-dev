"use server";

import { cancelPayosOrder } from "@/lib/orders/payments";
import { isOrderId } from "@/lib/orders/queries";

/** Abandons a pending bank transfer so the shopper can pick another payment method. */
export async function cancelBankTransfer(orderId: string): Promise<"paid" | "cancelled" | "error"> {
  if (!isOrderId(orderId)) return "error";
  try {
    const result = await cancelPayosOrder(orderId);
    if (!result) return "error";
    return result.state === "paid" ? "paid" : "cancelled";
  } catch (error) {
    console.error(`[payos] Cancel failed for order ${orderId}`, error);
    return "error";
  }
}
