import { z } from "zod";

z.config(z.locales.vi());

const orderNumber = z.coerce.number().int().positive();

const reason = z
  .string({ error: "Vui lòng nhập lý do." })
  .trim()
  .min(3, "Lý do tối thiểu 3 ký tự.")
  .max(200, "Lý do tối đa 200 ký tự.");

const checkbox = z
  .union([z.boolean(), z.literal("on")])
  .optional()
  .transform((value) => value === true || value === "on");

export const orderActionSchema = z.object({ orderNumber });

export const shipSchema = z.object({
  orderNumber,
  carrier: z.string().trim().max(40, "Tên đơn vị vận chuyển tối đa 40 ký tự.").optional().default(""),
  trackingNumber: z
    .string()
    .trim()
    .max(60, "Mã vận đơn tối đa 60 ký tự.")
    .regex(/^[\w.\- ]*$/, "Mã vận đơn chỉ gồm chữ, số, dấu chấm, gạch ngang.")
    .optional()
    .default(""),
});

export const cancelSchema = z.object({ orderNumber, reason, restock: checkbox });

export const refundSchema = z.object({
  orderNumber,
  amount: z
    .string({ error: "Vui lòng nhập số tiền." })
    .trim()
    .transform((value) => value.replace(/[.,\s₫]/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\d+$/, "Số tiền không hợp lệ.")
        .transform(Number)
        .pipe(z.number().int().positive("Số tiền phải lớn hơn 0.")),
    ),
  reason,
});
