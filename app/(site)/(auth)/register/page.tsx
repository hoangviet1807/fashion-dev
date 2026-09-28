import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, enabledOAuthProviders } from "@/auth";
import { safeRedirectPath } from "@/lib/auth/schema";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthSwitch, withCallback } from "@/components/auth/AuthSwitch";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Đăng ký | SHOP.CO",
  description: "Tạo tài khoản SHOP.CO để lưu thông tin và theo dõi đơn hàng.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const callbackUrl = safeRedirectPath((await searchParams).callbackUrl);
  if (await auth()) redirect(callbackUrl);

  return (
    <AuthLayout title="Đăng ký" description="Tạo tài khoản để theo dõi đơn hàng và thanh toán nhanh hơn.">
      <div className="flex flex-col gap-5">
        <RegisterForm callbackUrl={callbackUrl} />
        <OAuthButtons providers={enabledOAuthProviders()} callbackUrl={callbackUrl} />
        <AuthSwitch
          prompt="Đã có tài khoản?"
          href={withCallback("/login", callbackUrl)}
          label="Đăng nhập"
        />
      </div>
    </AuthLayout>
  );
}
