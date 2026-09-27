import { NextResponse, type NextRequest } from "next/server";
import { handleVnpayCallback } from "@/lib/orders/payments";
import { siteUrl } from "@/lib/site-url";

/**
 * Where VNPay sends the shopper back. Applies the same idempotent update as the
 * IPN so local development works without a public webhook URL.
 */
export async function GET(request: NextRequest) {
  const base = siteUrl();
  try {
    const outcome = await handleVnpayCallback(request.nextUrl.searchParams);
    if (outcome.orderId && outcome.paid) {
      return NextResponse.redirect(`${base}/order/${outcome.orderId}/success`);
    }
  } catch (error) {
    console.error("[vnpay] Return handling failed", error);
  }
  return NextResponse.redirect(`${base}/checkout?payment=failed`);
}
