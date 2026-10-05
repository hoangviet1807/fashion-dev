import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders, payments, type Payment } from "@/lib/db/schema";
import { sendOrderConfirmation } from "@/lib/email/order-notifications";
import { verifyMomoResult } from "@/lib/payments/momo";
import {
  cancelPayosPayment,
  getPayosPayment,
  verifyPayosWebhook,
  type PayosPaymentInfo,
} from "@/lib/payments/payos";
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

/**
 * Marks a still-pending payment as failed (never reached the provider, expired or
 * cancelled) and frees its stock. Returns false if it had already settled.
 */
export async function abandonPayment(reference: string): Promise<boolean> {
  return getDb().transaction(async (tx) => {
    const [payment] = await tx
      .update(payments)
      .set({ status: "failed" })
      .where(and(eq(payments.reference, reference), eq(payments.status, "pending")))
      .returning();
    if (!payment) return false;
    await tx
      .update(orders)
      .set({ status: "payment_failed" })
      .where(eq(orders.id, payment.orderId));
    await releaseReservations(tx, payment.orderId);
    return true;
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

/**
 * Applies a payOS webhook; null when the signature is invalid. payOS only reports
 * received transfers, so a non-success body leaves the payment pending.
 */
export async function handlePayosWebhook(
  body: Record<string, unknown>,
): Promise<PaymentOutcome | null> {
  const result = verifyPayosWebhook(body);
  if (!result) return null;

  return applyPaymentResult("payos", {
    reference: result.reference,
    amount: result.amountVnd,
    success: result.success,
    pending: !result.success,
    transactionId: result.transactionId,
    raw: result.raw,
  });
}

export type PayosPaymentState = {
  state: "pending" | "paid" | "expired";
  payment: Payment;
};

const PAYOS_CLOSED: PayosPaymentInfo["status"][] = ["CANCELLED", "EXPIRED", "FAILED"];

async function latestPayosPayment(orderId: string) {
  const [payment] = await getDb()
    .select()
    .from(payments)
    .where(and(eq(payments.orderId, orderId), eq(payments.provider, "payos")))
    .orderBy(desc(payments.createdAt))
    .limit(1);
  return payment ?? null;
}

function settledState(payment: Payment): PayosPaymentState {
  return { state: payment.status === "succeeded" ? "paid" : "expired", payment };
}

/**
 * Brings a payOS payment up to date for the pay page: asks payOS for the link
 * status (so it works without a public webhook URL), applies a received transfer,
 * and fails the payment once the link is closed or past `expiresAt`.
 */
export async function syncPayosPayment(orderId: string): Promise<PayosPaymentState | null> {
  const payment = await latestPayosPayment(orderId);
  if (!payment) return null;
  if (payment.status !== "pending") return settledState(payment);

  let info: PayosPaymentInfo | null = null;
  try {
    info = await getPayosPayment(payment.reference);
  } catch (error) {
    console.error(`[payos] Status check failed for order ${orderId}`, error);
  }

  if (info?.status === "PAID") {
    const outcome = await applyPaymentResult("payos", {
      reference: payment.reference,
      amount: info.amountPaid,
      success: true,
      transactionId: info.transactionId,
      raw: { status: info.status, amountPaid: String(info.amountPaid) },
    });
    if (outcome.status === "amount_mismatch") {
      console.error(`[payos] Paid amount ${info.amountPaid} differs for order ${orderId}`);
    }
  } else {
    const closed = info !== null && PAYOS_CLOSED.includes(info.status);
    const expired = payment.expiresAt !== null && payment.expiresAt.getTime() <= Date.now();
    if (closed || expired) {
      if (!closed) {
        await cancelPayosPayment(payment.reference, "Hết thời gian thanh toán").catch((error) =>
          console.error(`[payos] Cancel failed for order ${orderId}`, error),
        );
      }
      if (info?.status === "UNDERPAID") {
        console.error(`[payos] Order ${orderId} expired after a partial transfer (${info.amountPaid})`);
      }
      await abandonPayment(payment.reference);
    }
  }

  const current = await latestPayosPayment(orderId);
  if (!current) return null;
  return current.status === "pending" ? { state: "pending", payment: current } : settledState(current);
}

/** Shopper gave up on the transfer: closes the payOS link and frees the stock. */
export async function cancelPayosOrder(orderId: string): Promise<PayosPaymentState | null> {
  const payment = await latestPayosPayment(orderId);
  if (!payment) return null;
  if (payment.status === "pending") {
    // A transfer may have landed moments ago; never cancel a paid link.
    const synced = await syncPayosPayment(orderId);
    if (!synced || synced.state !== "pending") return synced;
    await cancelPayosPayment(payment.reference, "Khách đổi phương thức thanh toán").catch((error) =>
      console.error(`[payos] Cancel failed for order ${orderId}`, error),
    );
    await abandonPayment(payment.reference);
  }
  const current = await latestPayosPayment(orderId);
  return current ? settledState(current) : null;
}
