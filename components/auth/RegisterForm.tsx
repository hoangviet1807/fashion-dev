"use client";

import { register } from "@/app/(site)/(auth)/actions";
import { PASSWORD_MIN, registerSchema } from "@/lib/auth/schema";
import { Button } from "@/components/ui/Button";
import { AuthField, FormNotice } from "./AuthFields";
import { useAuthForm } from "./useAuthForm";

export function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const { errors, notice, pending, onSubmit, formRef, noticeRef } = useAuthForm({
    schema: registerSchema,
    action: register,
    extra: { callbackUrl },
  });

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      {notice ? <FormNotice ref={noticeRef}>{notice}</FormNotice> : null}
      <AuthField name="name" placeholder="Họ và tên" autoComplete="name" errors={errors} />
      <AuthField name="email" type="email" placeholder="Email" autoComplete="email" errors={errors} />
      <AuthField
        name="password"
        type="password"
        placeholder={`Mật khẩu (tối thiểu ${PASSWORD_MIN} ký tự)`}
        autoComplete="new-password"
        errors={errors}
      />
      <AuthField
        name="confirmPassword"
        type="password"
        placeholder="Nhập lại mật khẩu"
        autoComplete="new-password"
        errors={errors}
      />
      <Button type="submit" fullWidth disabled={pending} className="mt-2">
        {pending ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
      </Button>
    </form>
  );
}
