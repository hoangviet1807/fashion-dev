import { z } from "zod";

z.config(z.locales.vi());

export const PASSWORD_MIN = 8;

const email = z
  .string({ error: "Vui lòng nhập email." })
  .trim()
  .toLowerCase()
  .pipe(z.email("Email không hợp lệ.").max(254, "Email quá dài."));

const newPassword = z
  .string({ error: "Vui lòng nhập mật khẩu." })
  .min(PASSWORD_MIN, `Mật khẩu tối thiểu ${PASSWORD_MIN} ký tự.`)
  .max(128, "Mật khẩu tối đa 128 ký tự.");

const confirmPassword = z.string({ error: "Vui lòng nhập lại mật khẩu." });

const passwordsMatch = {
  check: (data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword,
  params: { message: "Mật khẩu nhập lại không khớp.", path: ["confirmPassword"] },
};

export const loginSchema = z.object({
  email,
  password: z.string({ error: "Vui lòng nhập mật khẩu." }).min(1, "Vui lòng nhập mật khẩu.").max(128),
});

export const registerSchema = z
  .object({
    name: z
      .string({ error: "Vui lòng nhập họ tên." })
      .trim()
      .min(1, "Vui lòng nhập họ tên.")
      .max(80, "Họ tên tối đa 80 ký tự."),
    email,
    password: newPassword,
    confirmPassword,
  })
  .refine(passwordsMatch.check, passwordsMatch.params);

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().regex(/^[A-Za-z0-9_-]{43}$/, "Liên kết đặt lại mật khẩu không hợp lệ."),
    password: newPassword,
    confirmPassword,
  })
  .refine(passwordsMatch.check, passwordsMatch.params);

export type AuthField = "name" | "email" | "password" | "confirmPassword";
export type AuthFieldErrors = Partial<Record<AuthField, string>>;

const AUTH_FIELDS = new Set<string>(["name", "email", "password", "confirmPassword"]);

export function authFieldErrors(error: z.ZodError): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && AUTH_FIELDS.has(field)) {
      errors[field as AuthField] ??= issue.message;
    }
  }
  return errors;
}

/** Only same-site paths; blocks `//evil.com` and `/\evil.com`. */
export function safeRedirectPath(value: unknown, fallback = "/account") {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
