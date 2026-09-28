import { render } from "@react-email/render";
import { Resend } from "resend";
import { PasswordResetEmail } from "./PasswordResetEmail";

export async function sendPasswordReset({
  to,
  name,
  resetUrl,
  expiresInMinutes,
}: {
  to: string;
  name: string | null;
  resetUrl: string;
  expiresInMinutes: number;
}) {
  const subject = "Đặt lại mật khẩu SHOP.CO";
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email] RESEND_API_KEY not set; would send "${subject}" to ${to}: ${resetUrl}`);
    return;
  }

  const html = await render(PasswordResetEmail({ name, resetUrl, expiresInMinutes }));
  const { error } = await new Resend(apiKey).emails.send({
    from: process.env.EMAIL_FROM ?? "SHOP.CO <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
  if (error) throw new Error(error.message);
}
