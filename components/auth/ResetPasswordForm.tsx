"use client";

import { resetPassword } from "@/app/(site)/(auth)/actions";
import { PASSWORD_MIN, resetPasswordSchema } from "@/lib/auth/schema";
import { Button } from "@/components/ui/Button";
import { AuthField, FormNotice } from "./AuthFields";
import { useAuthForm } from "./useAuthForm";

export function ResetPasswordForm({ token }: { token: string }) {
  const { errors, notice, pending, onSubmit, formRef, noticeRef } = useAuthForm({
    schema: resetPasswordSchema,
    action: resetPassword,
    extra: { token },
  });

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      {notice ? <FormNotice ref={noticeRef}>{notice}</FormNotice> : null}
      <AuthField
        name="password"
        type="password"
        placeholder={`Mật khẩu mới (tối thiểu ${PASSWORD_MIN} ký tự)`}
        autoComplete="new-password"
        errors={errors}
      />
      <AuthField
        name="confirmPassword"
        type="password"
        placeholder="Nhập lại mật khẩu mới"
        autoComplete="new-password"
        errors={errors}
      />
      <Button type="submit" fullWidth disabled={pending} className="mt-2">
        {pending ? "Đang lưu…" : "Đặt lại mật khẩu"}
      </Button>
    </form>
  );
}
