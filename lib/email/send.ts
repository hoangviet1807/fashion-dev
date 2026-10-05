import { Resend } from "resend";

const DEFAULT_FROM = "SHOP.CO <onboarding@resend.dev>";

/** Logs instead of sending when `RESEND_API_KEY` is unset; throws on provider errors. */
export async function sendEmail({
  to,
  subject,
  html,
  idempotencyKey,
  headers,
  devNote,
}: {
  to: string;
  subject: string;
  html: string;
  idempotencyKey?: string;
  headers?: Record<string, string>;
  /** Extra detail (e.g. a link) printed with the dev-mode log line. */
  devNote?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(
      `[email] RESEND_API_KEY not set; would send "${subject}" to ${to}${devNote ? `: ${devNote}` : ""}`,
    );
    return;
  }

  const { error } = await new Resend(apiKey).emails.send(
    { from: process.env.EMAIL_FROM ?? DEFAULT_FROM, to, subject, html, headers },
    idempotencyKey ? { idempotencyKey } : undefined,
  );
  if (error) throw new Error(error.message);
}
