"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import type { AccountInput, AccountResult } from "@/app/(site)/account/actions";
import { toFieldErrors } from "@/lib/account/schema";
import { authorize } from "@/lib/admin/auth";
import type { Permission } from "@/lib/admin/roles";
import { cancelSchema, orderActionSchema, refundSchema, shipSchema } from "@/lib/admin/schema";
import { getDb } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import {
  OrderTransitionError,
  cancelOrder,
  markOrderDelivered,
  markOrderShipped,
  recordRefund,
} from "@/lib/orders/fulfillment";
import { formatPrice } from "@/lib/money";
import { isOrderId } from "@/lib/orders/queries";
import { getReviewSummary, reviewsTag, syncProductRating } from "@/lib/reviews/server";

const FORBIDDEN: AccountResult = {
  status: "error",
  message: "Bạn không có quyền thực hiện thao tác này, hoặc phiên đăng nhập đã hết hạn.",
};
const GENERIC_ERROR: AccountResult = {
  status: "error",
  message: "Đã có lỗi xảy ra. Vui lòng thử lại.",
};

/** Checks the permission, runs `fn`, and turns transition errors into a notice. */
async function run(
  permission: Permission,
  fn: (actorId: string) => Promise<AccountResult>,
): Promise<AccountResult> {
  const actor = await authorize(permission);
  if (!actor) return FORBIDDEN;
  try {
    const result = await fn(actor.id);
    revalidatePath("/admin", "layout");
    return result;
  } catch (error) {
    if (error instanceof OrderTransitionError) return { status: "error", message: error.message };
    console.error(`[admin] ${permission} failed`, error);
    return GENERIC_ERROR;
  }
}

export async function shipOrder(input: AccountInput): Promise<AccountResult> {
  const parsed = shipSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", fieldErrors: toFieldErrors(parsed.error) };
  const { orderNumber, carrier, trackingNumber } = parsed.data;

  return run("orders:fulfil", async (actorId) => {
    const { emailed } = await markOrderShipped({ orderNumber, carrier, trackingNumber, actorId });
    return {
      status: "saved",
      message: emailed
        ? "Đã chuyển sang Đang giao và gửi email cho khách."
        : "Đã cập nhật thông tin vận chuyển.",
    };
  });
}

export async function deliverOrder(input: AccountInput): Promise<AccountResult> {
  const parsed = orderActionSchema.safeParse(input);
  if (!parsed.success) return GENERIC_ERROR;
  const { orderNumber } = parsed.data;

  return run("orders:fulfil", async (actorId) => {
    await markOrderDelivered({ orderNumber, actorId });
    return { status: "saved", message: "Đơn hàng đã hoàn tất." };
  });
}

export async function cancelOrderAction(input: AccountInput): Promise<AccountResult> {
  const parsed = cancelSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", fieldErrors: toFieldErrors(parsed.error) };
  const { orderNumber, reason, restock } = parsed.data;

  return run("orders:cancel", async (actorId) => {
    const { restocked } = await cancelOrder({ orderNumber, reason, restock, actorId });
    if (restocked === false) {
      return {
        status: "saved",
        message: "Đã huỷ đơn, nhưng chưa nhập lại kho được (thiếu SANITY_API_WRITE_TOKEN hoặc lỗi Sanity) — hãy cập nhật tồn kho trong Studio.",
      };
    }
    return { status: "saved", message: restock ? "Đã huỷ đơn và nhập lại kho." : "Đã huỷ đơn." };
  });
}

export async function refundOrder(input: AccountInput): Promise<AccountResult> {
  const parsed = refundSchema.safeParse(input);
  if (!parsed.success) return { status: "invalid", fieldErrors: toFieldErrors(parsed.error) };
  const { orderNumber, amount, reason } = parsed.data;

  return run("orders:refund", async (actorId) => {
    await recordRefund({ orderNumber, amount, reason, actorId });
    return { status: "saved", message: `Đã ghi nhận hoàn tiền ${formatPrice(amount)}.` };
  });
}

export async function deleteReview(id: string): Promise<AccountResult> {
  if (!isOrderId(id)) return GENERIC_ERROR;

  return run("reviews:moderate", async () => {
    const [removed] = await getDb()
      .delete(reviews)
      .where(eq(reviews.id, id))
      .returning({ slug: reviews.productSlug });
    if (!removed) return { status: "error", message: "Đánh giá không còn tồn tại." };

    revalidateTag(reviewsTag(removed.slug), { expire: 0 });
    await syncProductRating(removed.slug, await getReviewSummary(removed.slug));
    return { status: "saved", message: "Đã xoá đánh giá." };
  });
}
