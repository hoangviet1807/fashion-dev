"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import type { z } from "zod";
import type { AuthInput, AuthResult } from "@/app/(site)/(auth)/actions";
import { authFieldErrors, type AuthFieldErrors } from "@/lib/auth/schema";

function isRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String(error.digest).startsWith("NEXT_REDIRECT")
  );
}

/** Validates on the client first, then calls the server action (which may redirect). */
export function useAuthForm({
  schema,
  action,
  extra,
  onSent,
}: {
  schema: z.ZodType;
  action: (input: AuthInput) => Promise<AuthResult>;
  extra?: AuthInput;
  onSent?: () => void;
}) {
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    formRef.current?.querySelector<HTMLElement>("[aria-invalid]")?.focus();
  }, [errors]);

  useEffect(() => {
    if (notice) noticeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [notice]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const values: AuthInput = { ...extra };
    for (const [key, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string") values[key] = value;
    }
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(authFieldErrors(parsed.error));
      setNotice(null);
      return;
    }
    setErrors({});
    setNotice(null);

    startTransition(async () => {
      try {
        const result = await action(values);
        if (!result) return;
        switch (result.status) {
          case "invalid":
            setErrors(result.fieldErrors);
            if (result.message) setNotice(result.message);
            break;
          case "error":
            setNotice(result.message);
            break;
          case "sent":
            onSent?.();
            break;
        }
      } catch (error) {
        if (isRedirect(error)) return;
        setNotice("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    });
  }

  return { errors, notice, pending, onSubmit, formRef, noticeRef };
}
