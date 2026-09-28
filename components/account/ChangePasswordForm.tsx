"use client";

import { changePassword } from "@/app/(site)/account/actions";
import { changePasswordSchema } from "@/lib/account/schema";
import { PASSWORD_MIN } from "@/lib/auth/schema";
import { FormNotice } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/Button";
import { AccountField } from "./AccountFields";
import { useAccountForm } from "./useAccountForm";

export function ChangePasswordForm() {
  const { errors, notice, pending, onSubmit, formRef } = useAccountForm({
    schema: changePasswordSchema,
    action: changePassword,
    onSaved: (form) => form.reset(),
  });

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      {notice ? <FormNotice tone={notice.tone}>{notice.text}</FormNotice> : null}
      <AccountField
        name="currentPassword"
        type="password"
        placeholder="Mật khẩu hiện tại"
        autoComplete="current-password"
        errors={errors}
      />
      <AccountField
        name="password"
        type="password"
        placeholder={`Mật khẩu mới (tối thiểu ${PASSWORD_MIN} ký tự)`}
        autoComplete="new-password"
        errors={errors}
      />
      <AccountField
        name="confirmPassword"
        type="password"
        placeholder="Nhập lại mật khẩu mới"
        autoComplete="new-password"
        errors={errors}
      />
      <Button type="submit" variant="secondary" fullWidth disabled={pending} className="mt-2">
        {pending ? "Đang lưu…" : "Đổi mật khẩu"}
      </Button>
    </form>
  );
}
