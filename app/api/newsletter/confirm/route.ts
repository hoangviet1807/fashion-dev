import { NextResponse, type NextRequest } from "next/server";
import { confirmSubscription } from "@/lib/newsletter/server";
import { siteUrl } from "@/lib/site-url";

/** Link from the double opt-in email; the result is shown by `NewsletterBanner`. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  let result = "invalid";
  if (token.length > 0 && token.length <= 128) {
    try {
      if (await confirmSubscription(token)) result = "confirmed";
    } catch (error) {
      console.error("[newsletter] Confirmation failed", error);
      result = "error";
    }
  }
  return NextResponse.redirect(`${siteUrl()}/?newsletter=${result}#newsletter`);
}
