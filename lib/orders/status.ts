import type { Order } from "@/lib/db/schema";

export const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
  pending_payment: "Chờ thanh toán",
  paid: "Đã thanh toán",
  awaiting_fulfillment: "Đang xử lý",
  payment_failed: "Thanh toán thất bại",
  cancelled: "Đã huỷ",
  fulfilled: "Hoàn tất",
};

const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function formatOrderDate(date: Date) {
  return dateFormat.format(date);
}
