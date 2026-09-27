import { NextResponse, type NextRequest } from "next/server";
import { handleMomoResult } from "@/lib/orders/payments";

/**
 * MoMo IPN: server-to-server payment result, sent to the `ipnUrl` given when the
 * payment is created. MoMo expects HTTP 204; other statuses make it retry.
 */
export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  try {
    const outcome = await handleMomoResult(body as Record<string, unknown>);
    if (!outcome) return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    if (outcome.status === "amount_mismatch") {
      console.error(`[momo] IPN amount mismatch for order ${outcome.orderId}`);
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[momo] IPN failed", error);
    return NextResponse.json({ message: "Unknown error" }, { status: 500 });
  }
}
