"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import type { z } from "zod";
import type { AccountInput, AccountResult } from "@/app/(site)/account/actions";
import { toFieldErrors, type FieldErrors } from "@/lib/account/schema";

type Notice = { tone: "error" | "success"; text: string };

/** Validates on the client first, then calls the server action. */
export function useAccountForm({
  schema,
  action,
  extra,
  onSaved,
}: {
  schema: z.ZodType;
  action: (input: AccountInput) => Promise<AccountResult>;
  /** Values not held in inputs (controlled selects, ids). */
  extra?: AccountInput;
  onSaved?: (form: HTMLFormElement, message?: string) => void;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;
    formRef.current?.querySelector<HTMLElement>("[aria-invalid]")?.focus();
  }, [errors]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;

    const values: AccountInput = {};
    for (const [key, value] of new FormData(form)) {
      if (typeof value === "string") values[key] = value;
    }
    Object.assign(values, extra);

    const parsed = schema.safeParse(values);
    setNotice(null);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    startTransition(async () => {
      try {
        const result = await action(values);
        switch (result.status) {
          case "invalid":
            setErrors(result.fieldErrors);
            if (result.message) setNotice({ tone: "error", text: result.message });
            break;
          case "error":
            setNotice({ tone: "error", text: result.message });
            break;
          case "saved":
            if (result.message) setNotice({ tone: "success", text: result.message });
            onSaved?.(form, result.message);
            break;
        }
      } catch {
        setNotice({ tone: "error", text: "Đã có lỗi xảy ra. Vui lòng thử lại." });
      }
    });
  }

  return { errors, notice, pending, onSubmit, formRef };
}
