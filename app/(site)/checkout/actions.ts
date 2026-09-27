"use server";

import { headers } from "next/headers";
import { z } from "zod";
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
import { placeOrder } from "@/lib/orders/create";
import { InsufficientStockError } from "@/lib/orders/inventory";
import { MomoRequestError, isMomoConfigured } from "@/lib/payments/momo";
import { isVnpayConfigured } from "@/lib/payments/vnpay";

const refreshSchema = z.object({
  items: checkoutItemsSchema,
  seenPrices: z.record(z.string(), z.number()).default({}),
});

/** Re-prices the cart and re-checks stock so the client can reconcile. */
export async function refreshCart(input: {
  items: { sku: string; quantity: number }[];
  seenPrices?: Record<string, number>;
}): Promise<Quote | null> {
  const parsed = refreshSchema.safeParse(input);
  if (!parsed.success) return null;
  return quoteCart(parsed.data.items, "standard", parsed.data.seenPrices);
}

export type CheckoutResult =
  | { status: "invalid"; fieldErrors: CheckoutFieldErrors; message?: string }
  | { status: "changed"; quote: Quote; message: string }
  | { status: "placed"; orderId: string }
  | { status: "redirect"; url: string }
  | { status: "error"; message: string };

async function clientIp() {
  const list = await headers();
  const ip =
    list.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    list.get("x-real-ip") ||
    "127.0.0.1";
  return ip === "::1" ? "127.0.0.1" : ip.replace(/^::ffff:/, "");
}

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

  const { items, expectedTotal, ...details } = parsed.data;

  const location = resolveAddress(details.provinceCode, details.wardCode);
  if (!location) {
    return {
      status: "invalid",
      fieldErrors: { wardCode: "Phường/xã không thuộc tỉnh/thành phố đã chọn." },
    };
  }

  if (
    (details.payment === "vnpay" && !isVnpayConfigured()) ||
    (details.payment === "momo" && !isMomoConfigured())
  ) {
    return {
      status: "error",
      message: `Thanh toán qua ${PAYMENT_METHODS[details.payment].label} tạm thời không khả dụng. Vui lòng chọn phương thức thanh toán khác.`,
    };
  }

  let quote: Quote;
  try {
    quote = await quoteCart(items, details.shipping);
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
    const result = await placeOrder({
      details,
      location,
      quote,
      ipAddr: await clientIp(),
    });
    return result.status === "redirect"
      ? { status: "redirect", url: result.url }
      : { status: "placed", orderId: result.orderId };
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
    if (error instanceof MomoRequestError) {
      console.error("[checkout] MoMo payment request failed", error);
      return {
        status: "error",
        message: "Chưa kết nối được tới MoMo. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.",
      };
    }
    console.error("[checkout] Failed to place order", error);
    return {
      status: "error",
      message: "Không thể đặt hàng. Vui lòng thử lại.",
    };
  }
}
