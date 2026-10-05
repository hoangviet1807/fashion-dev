import { NextResponse, type NextRequest } from "next/server";
import { unsubscribe } from "@/lib/newsletter/server";
import { siteUrl } from "@/lib/site-url";

async function handle(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (token.length === 0 || token.length > 128) return "invalid";
  try {
    return (await unsubscribe(token)) ? "unsubscribed" : "invalid";
  } catch (error) {
    console.error("[newsletter] Unsubscribe failed", error);
    return "error";
  }
}

/** Link in the email footer. */
export async function GET(request: NextRequest) {
  const result = await handle(request);
  return NextResponse.redirect(`${siteUrl()}/?newsletter=${result}#newsletter`);
}

/** RFC 8058 one-click unsubscribe sent by mail clients (`List-Unsubscribe-Post`). */
export async function POST(request: NextRequest) {
  const result = await handle(request);
  return new NextResponse(null, { status: result === "error" ? 500 : 200 });
}
