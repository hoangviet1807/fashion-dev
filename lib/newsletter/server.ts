import { createHash, randomBytes } from "node:crypto";
import { render } from "@react-email/render";
import { and, eq, gt, isNull, lt, ne, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { NewsletterConfirmEmail } from "@/lib/email/NewsletterConfirmEmail";
import { NewsletterWelcomeEmail } from "@/lib/email/NewsletterWelcomeEmail";
import { sendEmail } from "@/lib/email/send";
import { siteUrl } from "@/lib/site-url";

export const CONFIRM_TTL_HOURS = 48;
/** Minimum gap between confirmation emails to the same address. */
const RESEND_COOLDOWN_SECONDS = 60;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const newToken = () => randomBytes(32).toString("base64url");

export function unsubscribeUrl(token: string) {
  return `${siteUrl()}/api/newsletter/unsubscribe?token=${token}`;
}

/**
 * Starts (or restarts) double opt-in and emails a confirmation link. Does
 * nothing for addresses already subscribed or emailed within the cooldown, so
 * the caller must respond identically either way.
 */
export async function requestSubscription(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  const token = newToken();

  const [row] = await getDb()
    .insert(newsletterSubscribers)
    .values({
      email,
      status: "pending",
      confirmTokenHash: hashToken(token),
      confirmSentAt: new Date(),
      unsubscribeToken: newToken(),
    })
    .onConflictDoUpdate({
      target: newsletterSubscribers.email,
      set: {
        status: "pending",
        confirmTokenHash: hashToken(token),
        confirmSentAt: new Date(),
      },
      setWhere: and(
        ne(newsletterSubscribers.status, "subscribed"),
        or(
          isNull(newsletterSubscribers.confirmSentAt),
          lt(
            newsletterSubscribers.confirmSentAt,
            sql`now() - make_interval(secs => ${RESEND_COOLDOWN_SECONDS})`,
          ),
        ),
      ),
    })
    .returning({ id: newsletterSubscribers.id });
  if (!row) return;

  const confirmUrl = `${siteUrl()}/api/newsletter/confirm?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Xác nhận đăng ký nhận bản tin SHOP.CO",
    html: await render(NewsletterConfirmEmail({ confirmUrl, expiresInHours: CONFIRM_TTL_HOURS })),
    devNote: confirmUrl,
  });
}

/** Activates a pending subscription; the welcome email is best-effort. */
export async function confirmSubscription(token: string) {
  const [row] = await getDb()
    .update(newsletterSubscribers)
    .set({
      status: "subscribed",
      confirmedAt: new Date(),
      confirmTokenHash: null,
      unsubscribedAt: null,
    })
    .where(
      and(
        eq(newsletterSubscribers.confirmTokenHash, hashToken(token)),
        eq(newsletterSubscribers.status, "pending"),
        gt(
          newsletterSubscribers.confirmSentAt,
          sql`now() - make_interval(hours => ${CONFIRM_TTL_HOURS})`,
        ),
      ),
    )
    .returning({
      email: newsletterSubscribers.email,
      unsubscribeToken: newsletterSubscribers.unsubscribeToken,
    });
  if (!row) return false;

  const url = unsubscribeUrl(row.unsubscribeToken);
  try {
    await sendEmail({
      to: row.email,
      subject: "Chào mừng bạn đến với bản tin SHOP.CO",
      html: await render(NewsletterWelcomeEmail({ unsubscribeUrl: url })),
      headers: {
        "List-Unsubscribe": `<${url}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      devNote: url,
    });
  } catch (error) {
    console.error("[newsletter] Failed to send welcome email", error);
  }
  return true;
}

/** Idempotent: an already-unsubscribed token still reports success. */
export async function unsubscribe(token: string) {
  const [row] = await getDb()
    .update(newsletterSubscribers)
    .set({
      status: "unsubscribed",
      confirmTokenHash: null,
      unsubscribedAt: sql`coalesce(${newsletterSubscribers.unsubscribedAt}, now())`,
    })
    .where(eq(newsletterSubscribers.unsubscribeToken, token))
    .returning({ id: newsletterSubscribers.id });
  return Boolean(row);
}
