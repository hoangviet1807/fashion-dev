import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, enabledOAuthProviders } from "@/auth";
import { safeRedirectPath } from "@/lib/auth/schema";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthSwitch, withCallback } from "@/components/auth/AuthSwitch";
import { LoginForm } from "@/components/auth/LoginForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export const metadata: Metadata = {
  title: "Đăng nhập | SHOP.CO",
  description: "Đăng nhập tài khoản SHOP.CO để theo dõi đơn hàng và thanh toán nhanh hơn.",
};

const AUTH_ERRORS: Record<string, string> = {
  AccessDenied: "Không thể đăng nhập bằng tài khoản này.",
  OAuthAccountNotLinked: "Email này đã gắn với một cách đăng nhập khác.",
  OAuthNoEmail:
    "Tài khoản mạng xã hội không cung cấp email. Vui lòng cấp quyền email hoặc đăng ký bằng email.",
  Configuration: "Đăng nhập tạm thời không khả dụng. Vui lòng thử lại sau.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; reset?: string; error?: string }>;
}) {
  const { callbackUrl: rawCallback, reset, error } = await searchParams;
  const callbackUrl = safeRedirectPath(rawCallback);
  if (await auth()) redirect(callbackUrl);

  const initialNotice = error
    ? { tone: "error" as const, text: AUTH_ERRORS[error] ?? "Đăng nhập không thành công. Vui lòng thử lại." }
    : reset
      ? { tone: "success" as const, text: "Đã đặt lại mật khẩu. Vui lòng đăng nhập bằng mật khẩu mới." }
      : undefined;

  return (
    <AuthLayout title="Đăng nhập" description="Chào mừng bạn quay lại SHOP.CO.">
      <div className="flex flex-col gap-5">
        <LoginForm callbackUrl={callbackUrl} initialNotice={initialNotice} />
        <OAuthButtons providers={enabledOAuthProviders()} callbackUrl={callbackUrl} />
        <AuthSwitch
          prompt="Chưa có tài khoản?"
          href={withCallback("/register", callbackUrl)}
          label="Đăng ký"
        />
      </div>
    </AuthLayout>
  );
}
