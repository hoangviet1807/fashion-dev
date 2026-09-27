import { NextResponse, type NextRequest } from "next/server";
import { handleMomoResult } from "@/lib/orders/payments";
import { siteUrl } from "@/lib/site-url";

/**
 * Where MoMo sends the shopper back. Applies the same idempotent update as the
 * IPN so local development works without a public webhook URL.
 */
export async function GET(request: NextRequest) {
  const base = siteUrl();
  try {
    const outcome = await handleMomoResult(request.nextUrl.searchParams);
    if (outcome?.orderId && (outcome.paid || outcome.status === "pending")) {
      return NextResponse.redirect(`${base}/order/${outcome.orderId}/success`);
    }
  } catch (error) {
    console.error("[momo] Return handling failed", error);
  }
  return NextResponse.redirect(`${base}/checkout?payment=failed`);
}
