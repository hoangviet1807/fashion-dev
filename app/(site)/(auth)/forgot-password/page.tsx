import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthSwitch } from "@/components/auth/AuthSwitch";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Quên mật khẩu | SHOP.CO",
  description: "Nhận liên kết đặt lại mật khẩu tài khoản SHOP.CO qua email.",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Quên mật khẩu"
      description="Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết để bạn đặt lại mật khẩu."
    >
      <div className="flex flex-col gap-5">
        <ForgotPasswordForm />
        <AuthSwitch prompt="Đã nhớ mật khẩu?" href="/login" label="Đăng nhập" />
      </div>
    </AuthLayout>
  );
}
