import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormNotice } from "@/components/auth/AuthFields";
import { AuthSwitch } from "@/components/auth/AuthSwitch";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu | SHOP.CO",
  robots: { index: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthLayout title="Đặt lại mật khẩu" description="Chọn mật khẩu mới cho tài khoản của bạn.">
      <div className="flex flex-col gap-5">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <FormNotice>Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu liên kết mới.</FormNotice>
        )}
        <AuthSwitch prompt="Cần liên kết mới?" href="/forgot-password" label="Gửi lại email" />
      </div>
    </AuthLayout>
  );
}
