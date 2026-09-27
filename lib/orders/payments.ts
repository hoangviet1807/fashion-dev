import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders, payments, type Payment } from "@/lib/db/schema";
import { sendOrderConfirmation } from "@/lib/email/send-order-confirmation";
import { verifyMomoResult } from "@/lib/payments/momo";
import { verifyVnpayCallback } from "@/lib/payments/vnpay";
import { commitReservations, releaseReservations } from "./inventory";

type ProviderResult = {
  reference: string;
  amount: number;
  success: boolean;
  /** Not final yet (e.g. MoMo still processing); leaves the payment pending. */
  pending?: boolean;
  transactionId: string | null;
  raw: Record<string, string>;
};

export type PaymentOutcome =
  | { status: "not_found"; orderId?: undefined; paid?: undefined }
  | { status: "amount_mismatch"; orderId: string; paid?: undefined }
  | { status: "pending"; orderId: string; paid: false }
  /** A retried callback; `paid` reflects the earlier result. */
  | { status: "duplicate"; orderId: string; paid: boolean }
  | { status: "applied"; orderId: string; paid: boolean };

/**
 * Applies a verified provider result. Idempotent: the payment row is locked and
 * only a `pending` payment changes state, so stock and email happen once.
 */
async function applyPaymentResult(
  provider: Payment["provider"],
  result: ProviderResult,
): Promise<PaymentOutcome> {
  const outcome = await getDb().transaction(async (tx): Promise<PaymentOutcome> => {
    const [payment] = await tx
      .select()
      .from(payments)
      .where(eq(payments.reference, result.reference))
      .for("update");

    if (!payment || payment.provider !== provider) return { status: "not_found" };
    const orderId = payment.orderId;

    if (payment.amount !== result.amount) return { status: "amount_mismatch", orderId };

    if (payment.status !== "pending") {
      return { status: "duplicate", orderId, paid: payment.status === "succeeded" };
    }

    if (result.pending) return { status: "pending", orderId, paid: false };

    if (result.success) {
      await tx
        .update(payments)
        .set({
          status: "succeeded",
          providerTransactionId: result.transactionId,
          raw: result.raw,
        })
        .where(eq(payments.id, payment.id));
      await tx
        .update(orders)
        .set({ status: "paid", paidAt: new Date() })
        .where(eq(orders.id, orderId));
    } else {
      await tx
        .update(payments)
        .set({ status: "failed", raw: result.raw })
        .where(eq(payments.id, payment.id));
      await tx
        .update(orders)
        .set({ status: "payment_failed" })
        .where(eq(orders.id, orderId));
      await releaseReservations(tx, orderId);
    }

    return { status: "applied", orderId, paid: result.success };
  });

  if (outcome.status === "applied" && outcome.paid) {
    await commitReservations(outcome.orderId);
    await sendOrderConfirmation(outcome.orderId);
  }

  return outcome;
}

/** Marks a payment that never reached the provider as failed and frees its stock. */
export async function abandonPayment(reference: string) {
  await getDb().transaction(async (tx) => {
    const [payment] = await tx
      .update(payments)
      .set({ status: "failed" })
      .where(eq(payments.reference, reference))
      .returning();
    if (!payment) return;
    await tx
      .update(orders)
      .set({ status: "payment_failed" })
      .where(eq(orders.id, payment.orderId));
    await releaseReservations(tx, payment.orderId);
  });
}

/** VNPay IPN response codes. */
export type VnpayRspCode = "00" | "01" | "02" | "04" | "97" | "99";

export type VnpayOutcome = {
  code: VnpayRspCode;
  orderId?: string;
  /** Whether the payment (now or previously) succeeded. */
  paid?: boolean;
};

const VNPAY_CODES: Record<PaymentOutcome["status"], VnpayRspCode> = {
  not_found: "01",
  amount_mismatch: "04",
  pending: "99",
  duplicate: "02",
  applied: "00",
};

/** Applies a VNPay return/IPN callback. */
export async function handleVnpayCallback(query: URLSearchParams): Promise<VnpayOutcome> {
  const callback = verifyVnpayCallback(query);
  if (!callback) return { code: "97" };

  const outcome = await applyPaymentResult("vnpay", {
    reference: callback.reference,
    amount: callback.amountVnd,
    success: callback.success,
    transactionId: callback.transactionNo,
    raw: callback.raw,
  });
  return { code: VNPAY_CODES[outcome.status], orderId: outcome.orderId, paid: outcome.paid };
}

/** Applies a MoMo IPN body or redirect query; null when the signature is invalid. */
export async function handleMomoResult(
  input: URLSearchParams | Record<string, unknown>,
): Promise<PaymentOutcome | null> {
  const result = verifyMomoResult(input);
  if (!result) return null;

  return applyPaymentResult("momo", {
    reference: result.reference,
    amount: result.amountVnd,
    success: result.success,
    pending: result.pending,
    transactionId: result.transactionId,
    raw: result.raw,
  });
}
