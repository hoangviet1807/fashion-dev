"use client";

import { forwardRef } from "react";
import type { AuthField as AuthFieldName, AuthFieldErrors } from "@/lib/auth/schema";
import { TextField } from "@/components/ui/TextField";

export function AuthField({
  name,
  placeholder,
  type = "text",
  autoComplete,
  errors,
}: {
  name: AuthFieldName;
  placeholder: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  errors: AuthFieldErrors;
}) {
  const error = errors[name];
  return (
    <div className="min-w-0">
      <TextField name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} error={error} />
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 px-4 text-sm text-discount">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const FormNotice = forwardRef<HTMLDivElement, { tone?: "error" | "success"; children: React.ReactNode }>(
  function FormNotice({ tone = "error", children }, ref) {
    return (
      <div
        ref={ref}
        role={tone === "error" ? "alert" : "status"}
        className={`rounded-[20px] px-5 py-4 text-sm xl:text-base ${
          tone === "error" ? "bg-discount-bg text-discount" : "bg-muted text-black"
        }`}
      >
        {children}
      </div>
    );
  },
);

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-sm text-text-60">
      <hr className="flex-1 border-line" />
      hoặc
      <hr className="flex-1 border-line" />
    </div>
  );
}
