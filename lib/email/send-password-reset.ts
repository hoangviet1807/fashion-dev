import { render } from "@react-email/render";
import { PasswordResetEmail } from "./PasswordResetEmail";
import { sendEmail } from "./send";

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
  await sendEmail({
    to,
    subject: "Đặt lại mật khẩu SHOP.CO",
    html: await render(PasswordResetEmail({ name, resetUrl, expiresInMinutes })),
    devNote: resetUrl,
  });
}
