"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/app/(site)/(auth)/actions";
import { forgotPasswordSchema } from "@/lib/auth/schema";
import { Button } from "@/components/ui/Button";
import { AuthField, FormNotice } from "./AuthFields";
import { useAuthForm } from "./useAuthForm";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const { errors, notice, pending, onSubmit, formRef, noticeRef } = useAuthForm({
    schema: forgotPasswordSchema,
    action: requestPasswordReset,
    onSent: () => setSent(true),
  });

  if (sent) {
    return (
      <FormNotice tone="success">
        Nếu email này đã đăng ký tài khoản, chúng tôi đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra
        hộp thư (kể cả mục Spam). Liên kết có hiệu lực trong 60 phút.
      </FormNotice>
    );
  }

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      {notice ? <FormNotice ref={noticeRef}>{notice}</FormNotice> : null}
      <AuthField name="email" type="email" placeholder="Email" autoComplete="email" errors={errors} />
      <Button type="submit" fullWidth disabled={pending} className="mt-2">
        {pending ? "Đang gửi…" : "Gửi liên kết đặt lại"}
      </Button>
    </form>
  );
}
