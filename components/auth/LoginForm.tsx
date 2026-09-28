"use client";

import Link from "next/link";
import { login } from "@/app/(site)/(auth)/actions";
import { loginSchema } from "@/lib/auth/schema";
import { Button } from "@/components/ui/Button";
import { AuthField, FormNotice } from "./AuthFields";
import { useAuthForm } from "./useAuthForm";

export function LoginForm({
  callbackUrl,
  initialNotice,
}: {
  callbackUrl: string;
  initialNotice?: { tone: "error" | "success"; text: string };
}) {
  const { errors, notice, pending, onSubmit, formRef, noticeRef } = useAuthForm({
    schema: loginSchema,
    action: login,
    extra: { callbackUrl },
  });
  const shown = notice ? { tone: "error" as const, text: notice } : initialNotice;

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      {shown ? (
        <FormNotice ref={noticeRef} tone={shown.tone}>
          {shown.text}
        </FormNotice>
      ) : null}
      <AuthField name="email" type="email" placeholder="Email" autoComplete="email" errors={errors} />
      <AuthField
        name="password"
        type="password"
        placeholder="Mật khẩu"
        autoComplete="current-password"
        errors={errors}
      />
      <Link
        href="/forgot-password"
        className="self-end px-4 text-sm font-medium text-black underline underline-offset-4"
      >
        Quên mật khẩu?
      </Link>
      <Button type="submit" fullWidth disabled={pending} className="mt-2">
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
    </form>
  );
}
