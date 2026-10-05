"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { resolveAddress } from "@/lib/address/wards";
import {
  PAYMENT_METHODS,
  checkoutItemsSchema,
  checkoutSchema,
  fieldErrors,
  type CheckoutFieldErrors,
  type CheckoutInput,
} from "@/lib/checkout/schema";
import { quoteCart, type Quote } from "@/lib/checkout/quote";
import { cartTotal } from "@/lib/cart-data";
import { COUPON_CODE_MAX } from "@/lib/coupons/discount";
import { CouponUnavailableError } from "@/lib/coupons/server";
import { placeOrder } from "@/lib/orders/create";
import { InsufficientStockError } from "@/lib/orders/inventory";
import { MomoRequestError, isMomoConfigured } from "@/lib/payments/momo";
import { PayosRequestError, isPayosConfigured } from "@/lib/payments/payos";
import { isVnpayConfigured } from "@/lib/payments/vnpay";
import { clientIp } from "@/lib/request";

const refreshSchema = z.object({
  items: checkoutItemsSchema,
  seenPrices: z.record(z.string(), z.number()).default({}),
  couponCode: z.string().trim().max(COUPON_CODE_MAX).nullish(),
});

/** Re-prices the cart, re-checks stock and the coupon so the client can reconcile. */
export async function refreshCart(input: z.input<typeof refreshSchema>): Promise<Quote | null> {
  const parsed = refreshSchema.safeParse(input);
  if (!parsed.success) return null;
  const { items, seenPrices, couponCode } = parsed.data;
  return quoteCart(items, "standard", seenPrices, couponCode);
}

export type CheckoutResult =
  | { status: "invalid"; fieldErrors: CheckoutFieldErrors; message?: string }
  | { status: "changed"; quote: Quote; message: string }
  | { status: "placed"; orderId: string }
  | { status: "pay"; orderId: string }
  | { status: "redirect"; url: string }
  | { status: "error"; message: string };

export async function submitCheckout(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    return {
      status: "invalid",
      fieldErrors: errors,
      message:
        Object.keys(errors).length === 0
          ? "Không đọc được giỏ hàng. Vui lòng tải lại trang."
          : undefined,
    };
  }

  const { items, expectedTotal, couponCode, ...details } = parsed.data;

  const location = resolveAddress(details.provinceCode, details.wardCode);
  if (!location) {
    return {
      status: "invalid",
      fieldErrors: { wardCode: "Phường/xã không thuộc tỉnh/thành phố đã chọn." },
    };
  }

  if (
    (details.payment === "vnpay" && !isVnpayConfigured()) ||
    (details.payment === "momo" && !isMomoConfigured()) ||
    (details.payment === "payos" && !isPayosConfigured())
  ) {
    return {
      status: "error",
      message: `Thanh toán qua ${PAYMENT_METHODS[details.payment].label} tạm thời không khả dụng. Vui lòng chọn phương thức thanh toán khác.`,
    };
  }

  let quote: Quote;
  try {
    quote = await quoteCart(items, details.shipping, {}, couponCode);
  } catch {
    return {
      status: "error",
      message: "Chưa kiểm tra được giỏ hàng. Vui lòng thử lại.",
    };
  }

  if (quote.lines.length === 0) {
    return {
      status: "changed",
      quote,
      message: "Tất cả sản phẩm trong giỏ hàng đều đã hết hàng.",
    };
  }

  if (quote.issues.length > 0 || quote.total !== expectedTotal) {
    return {
      status: "changed",
      quote,
      message:
        "Giỏ hàng đã được cập nhật theo giá và tồn kho mới nhất. Vui lòng kiểm tra lại và đặt hàng lần nữa.",
    };
  }

  try {
    const session = await auth();
    const result = await placeOrder({
      details,
      location,
      quote,
      ipAddr: await clientIp(),
      userId: session?.user?.id ?? null,
    });
    if (result.status === "redirect") return { status: "redirect", url: result.url };
    return { status: result.status, orderId: result.orderId };
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      const available = new Map(error.shortages.map((item) => [item.sku, item.available]));
      const lines = quote.lines
        .map((line) => ({
          ...line,
          quantity: Math.min(line.quantity, available.get(line.sku) ?? line.quantity),
        }))
        .filter((line) => line.quantity > 0);
      return {
        status: "changed",
        quote: { ...quote, lines, issues: [] },
        message: `Một số sản phẩm vừa được khách khác giữ: ${error.shortages
          .map((item) => `${item.name} (còn ${item.available})`)
          .join(", ")}. Giỏ hàng đã được cập nhật — vui lòng đặt hàng lại.`,
      };
    }
    if (error instanceof CouponUnavailableError) {
      return {
        status: "changed",
        quote: {
          ...quote,
          coupon: null,
          discount: 0,
          total: cartTotal(quote.subtotal, 0, quote.deliveryFee),
          issues: [],
        },
        message: `${error.message} Mã đã được gỡ — vui lòng kiểm tra lại tổng tiền và đặt hàng lần nữa.`,
      };
    }
    if (error instanceof MomoRequestError) {
      console.error("[checkout] MoMo payment request failed", error);
      return {
        status: "error",
        message: "Chưa kết nối được tới MoMo. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.",
      };
    }
    if (error instanceof PayosRequestError) {
      console.error("[checkout] payOS payment request failed", error);
      return {
        status: "error",
        message: "Chưa tạo được mã chuyển khoản. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.",
      };
    }
    console.error("[checkout] Failed to place order", error);
    return {
      status: "error",
      message: "Không thể đặt hàng. Vui lòng thử lại.",
    };
  }
}
