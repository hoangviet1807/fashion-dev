import type { Order } from "@/lib/db/schema";
import { ORDER_STATUS_LABELS } from "@/lib/orders/status";

const FAILED: Order["status"][] = ["payment_failed", "cancelled"];

export function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const tone = FAILED.includes(status) ? "bg-discount-bg text-discount" : "bg-muted text-black";
  return (
    <span className={`inline-flex w-fit shrink-0 rounded-[62px] px-3.5 py-1.5 text-sm font-medium ${tone}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
