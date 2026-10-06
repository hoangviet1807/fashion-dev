"use server";

import { forgotPasswordSchema } from "@/lib/auth/schema";
import { requestSubscription } from "@/lib/newsletter/server";
import { rateLimit, retryMinutes } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";

/** Bots tend to submit the instant the page loads; people need longer to type an email. */
const MIN_FILL_MS = 1500;
const IP_LIMIT = { limit: 5, windowSeconds: 10 * 60 };
/** Caps confirmation emails to one inbox, whatever the source IP. */
const EMAIL_LIMIT = { limit: 3, windowSeconds: 24 * 60 * 60 };

export type NewsletterInput = {
  email?: string;
  /** Honeypot: hidden from people, filled in by naive bots. */
  website?: string;
  /** Milliseconds the form was open before submitting. */
  elapsedMs?: number;
};

export type NewsletterResult =
  | { status: "sent" }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

/**
 * Reports "sent" for every accepted address — new, pending or already
 * subscribed — so the form can't be used to look up subscribers.
 */
export async function subscribeNewsletter(input: NewsletterInput): Promise<NewsletterResult> {
  if (input.website) return { status: "sent" };
  if (typeof input.elapsedMs !== "number" || input.elapsedMs < MIN_FILL_MS) {
    return { status: "error", message: "Vui lòng thử lại." };
  }

  const parsed = forgotPasswordSchema.safeParse({ email: input.email });
  if (!parsed.success) {
    return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Email không hợp lệ." };
  }
  const { email } = parsed.data;

  try {
    const byIp = await rateLimit(`newsletter:ip:${await clientIp()}`, IP_LIMIT);
    if (!byIp.ok) {
      return {
        status: "error",
        message: `Bạn thử quá nhiều lần. Thử lại sau ${retryMinutes(byIp)} phút.`,
      };
    }
    if (!(await rateLimit(`newsletter:email:${email}`, EMAIL_LIMIT)).ok) return { status: "sent" };

    await requestSubscription(email);
  } catch (error) {
    console.error("[newsletter] Subscription failed", error);
    return { status: "error", message: "Đã có lỗi xảy ra. Vui lòng thử lại." };
  }
  return { status: "sent" };
}
