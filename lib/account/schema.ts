import { z } from "zod";
import { PASSWORD_MIN } from "@/lib/auth/schema";
import { addressFields, vnPhoneSchema } from "@/lib/checkout/schema";

z.config(z.locales.vi());

export const profileSchema = z.object({
  name: z
    .string({ error: "Vui lòng nhập họ tên." })
    .trim()
    .min(1, "Vui lòng nhập họ tên.")
    .max(80, "Họ tên tối đa 80 ký tự."),
  phone: z
    .string()
    .trim()
    .optional()
    .default("")
    .pipe(z.union([z.literal(""), vnPhoneSchema])),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: "Vui lòng nhập mật khẩu hiện tại." })
      .min(1, "Vui lòng nhập mật khẩu hiện tại.")
      .max(128),
    password: z
      .string({ error: "Vui lòng nhập mật khẩu mới." })
      .min(PASSWORD_MIN, `Mật khẩu tối thiểu ${PASSWORD_MIN} ký tự.`)
      .max(128, "Mật khẩu tối đa 128 ký tự."),
    confirmPassword: z.string({ error: "Vui lòng nhập lại mật khẩu mới." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp.",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  ...addressFields,
  isDefault: z
    .union([z.boolean(), z.literal("on")])
    .optional()
    .transform((value) => value === true || value === "on"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

export type FieldErrors = Record<string, string>;

/** First message per top-level field. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string") errors[field] ??= issue.message;
  }
  return errors;
}
