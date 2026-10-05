import { NextResponse, type NextRequest } from "next/server";
import { handlePayosWebhook } from "@/lib/orders/payments";

/**
 * payOS webhook: sent for each transfer received on a payment link. Register
 * `<site>/api/webhooks/payos` in the payOS dashboard; payOS verifies the URL with
 * a test call for an unknown order, which must also get a 2xx. Non-2xx makes it retry.
 */
export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ success: false, message: "Invalid body" }, { status: 400 });
  }

  try {
    const outcome = await handlePayosWebhook(body as Record<string, unknown>);
    if (!outcome) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }
    if (outcome.status === "amount_mismatch") {
      console.error(`[payos] Webhook amount mismatch for order ${outcome.orderId}`);
    }
    if (outcome.status === "duplicate" && !outcome.paid) {
      console.error(`[payos] Transfer received for closed order ${outcome.orderId}; refund manually`);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[payos] Webhook failed", error);
    return NextResponse.json({ success: false, message: "Unknown error" }, { status: 500 });
  }
}
