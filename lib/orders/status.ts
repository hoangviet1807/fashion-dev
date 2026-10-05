import type { Order } from "@/lib/db/schema";

export const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
  pending_payment: "Chờ thanh toán",
  paid: "Đã thanh toán",
  awaiting_fulfillment: "Đang xử lý",
  payment_failed: "Thanh toán thất bại",
  cancelled: "Đã huỷ",
  shipped: "Đang giao",
  fulfilled: "Hoàn tất",
};

/** Orders the customer has committed to (paid online or COD). */
export const CONFIRMED_ORDER_STATUSES: Order["status"][] = [
  "paid",
  "awaiting_fulfillment",
  "shipped",
  "fulfilled",
];

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
