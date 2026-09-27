import { NextResponse, type NextRequest } from "next/server";
import { handleVnpayCallback, type VnpayRspCode } from "@/lib/orders/payments";

const MESSAGES: Record<VnpayRspCode, string> = {
  "00": "Confirm Success",
  "01": "Order not found",
  "02": "Order already confirmed",
  "04": "Invalid amount",
  "97": "Invalid signature",
  "99": "Unknown error",
};

/** VNPay IPN: server-to-server payment result. Configure this URL in the VNPay merchant portal. */
export async function GET(request: NextRequest) {
  let code: VnpayRspCode;
  try {
    ({ code } = await handleVnpayCallback(request.nextUrl.searchParams));
  } catch (error) {
    console.error("[vnpay] IPN failed", error);
    code = "99";
  }
  return NextResponse.json({ RspCode: code, Message: MESSAGES[code] });
}
