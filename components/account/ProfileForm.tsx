"use client";

import { updateProfile } from "@/app/(site)/account/actions";
import { profileSchema } from "@/lib/account/schema";
import { FormNotice } from "@/components/auth/AuthFields";
import { Button } from "@/components/ui/Button";
import { AccountField } from "./AccountFields";
import { useAccountForm } from "./useAccountForm";

export function ProfileForm({
  name,
  email,
  phone,
}: {
  name: string | null;
  email: string | null;
  phone: string | null;
}) {
  const { errors, notice, pending, onSubmit, formRef } = useAccountForm({
    schema: profileSchema,
    action: updateProfile,
  });

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      {notice ? <FormNotice tone={notice.tone}>{notice.text}</FormNotice> : null}
      <dl className="flex justify-between gap-4 px-1 pb-1 text-base">
        <dt className="text-text-60">Email</dt>
        <dd className="min-w-0 truncate font-medium text-black">{email}</dd>
      </dl>
      <AccountField name="name" placeholder="Họ tên" autoComplete="name" defaultValue={name ?? ""} errors={errors} />
      <AccountField
        name="phone"
        type="tel"
        placeholder="Số điện thoại (không bắt buộc)"
        autoComplete="tel"
        defaultValue={phone ?? ""}
        errors={errors}
      />
      <Button type="submit" fullWidth disabled={pending} className="mt-2">
        {pending ? "Đang lưu…" : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
