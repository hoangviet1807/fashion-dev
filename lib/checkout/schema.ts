import { z } from "zod";

z.config(z.locales.vi());

export const PAYMENT_METHODS = {
  vnpay: {
    label: "VNPay",
    note: "Thẻ ATM, Visa / Mastercard hoặc mã QR qua VNPay.",
  },
  momo: {
    label: "Ví MoMo",
    note: "Thanh toán bằng ứng dụng MoMo hoặc quét mã QR.",
  },
  cod: { label: "Thanh toán khi nhận hàng (COD)", note: "Trả tiền mặt khi nhận hàng." },
} as const;

export type PaymentMethodId = keyof typeof PAYMENT_METHODS;

/** Pre-selects a VNPay method (`vnp_BankCode`); `any` lets the shopper pick on VNPay's page. */
export const VNPAY_METHODS = {
  any: { label: "Chọn trên trang VNPay", note: "Hiển thị tất cả hình thức thanh toán của VNPay." },
  VNPAYQR: { label: "Quét mã VNPAY-QR", note: "Dùng ứng dụng ngân hàng hoặc ví để quét mã." },
  VNBANK: { label: "Thẻ ATM / Tài khoản ngân hàng", note: "Thẻ nội địa và Internet Banking." },
  INTCARD: { label: "Thẻ quốc tế", note: "Visa, Mastercard, JCB, American Express." },
} as const;

export type VnpayMethodId = keyof typeof VNPAY_METHODS;

const required = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Vui lòng nhập ${label}.`)
    .max(max, `${label.charAt(0).toUpperCase()}${label.slice(1)} tối đa ${max} ký tự.`);

const divisionCode = (message: string) =>
  z.string({ error: message }).trim().regex(/^\d{1,6}$/, message);

/** Vietnamese mobile numbers: 0 or +84 followed by 9 digits starting 3/5/7/8/9. */
const VN_PHONE = /^(?:0|84)(?:3|5|7|8|9)\d{8}$/;

export const vnPhoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s.()-]/g, "").replace(/^\+/, ""))
  .refine((value) => VN_PHONE.test(value), "Số điện thoại không hợp lệ (vd: 0912 345 678).")
  .transform((value) => (value.startsWith("84") ? `0${value.slice(2)}` : value));

export const checkoutLineSchema = z.object({
  sku: z.string().trim().min(1).max(100),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutItemsSchema = z
  .array(checkoutLineSchema)
  .min(1, "Giỏ hàng của bạn đang trống.")
  .max(50, "Giỏ hàng có quá nhiều sản phẩm.");

export const checkoutDetailsSchema = z.object({
  email: z.email("Email không hợp lệ.").max(254, "Email quá dài."),
  phone: vnPhoneSchema,
  lastName: required("họ", 60),
  firstName: required("tên", 60),
  address: required("số nhà, tên đường", 200),
  apartment: z.string().trim().max(100, "Tối đa 100 ký tự.").optional().default(""),
  provinceCode: divisionCode("Vui lòng chọn tỉnh/thành phố."),
  wardCode: divisionCode("Vui lòng chọn phường/xã."),
  shipping: z.enum(["standard", "express"], "Vui lòng chọn phương thức giao hàng."),
  payment: z.enum(["vnpay", "momo", "cod"], "Vui lòng chọn phương thức thanh toán."),
  vnpayMethod: z
    .enum(["any", "VNPAYQR", "VNBANK", "INTCARD"], "Vui lòng chọn hình thức thanh toán VNPay.")
    .default("any"),
});

export const checkoutSchema = checkoutDetailsSchema.extend({
  items: checkoutItemsSchema,
  /** Total the customer saw; the server rejects the order if it differs. */
  expectedTotal: z.number().int().nonnegative(),
});

export type CheckoutDetails = z.infer<typeof checkoutDetailsSchema>;
export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutField = keyof CheckoutDetails;
export type CheckoutFieldErrors = Partial<Record<CheckoutField, string>>;

export function fieldErrors(error: z.ZodError): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && field in checkoutDetailsSchema.shape) {
      errors[field as CheckoutField] ??= issue.message;
    }
  }
  return errors;
}
