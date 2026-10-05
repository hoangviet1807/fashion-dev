import { createHmac, timingSafeEqual } from "node:crypto";
import type { BankTransfer } from "@/lib/db/schema";

const DEFAULT_ENDPOINT = "https://api-merchant.payos.vn";

function config() {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
  if (!clientId || !apiKey || !checksumKey) {
    throw new Error("PAYOS_CLIENT_ID, PAYOS_API_KEY and PAYOS_CHECKSUM_KEY must be set.");
  }
  return {
    clientId,
    apiKey,
    checksumKey,
    endpoint: process.env.PAYOS_ENDPOINT ?? DEFAULT_ENDPOINT,
  };
}

export function isPayosConfigured() {
  return Boolean(
    process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY,
  );
}

/** payOS limits the transfer note to 9 characters for bank accounts not linked through payOS. */
export const PAYOS_DESCRIPTION_MAX = 9;

export class PayosRequestError extends Error {}

function hmac(data: string, key: string) {
  return createHmac("sha256", key).update(data, "utf-8").digest("hex");
}

function safeEqual(received: string, expected: string) {
  const a = Buffer.from(received.toLowerCase());
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function fieldValue(value: unknown): string {
  if (value === null || value === undefined || value === "null" || value === "undefined") {
    return "";
  }
  if (Array.isArray(value)) {
    return JSON.stringify(
      value.map((item) =>
        item && typeof item === "object"
          ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
          : item,
      ),
    );
  }
  return String(value);
}

/** payOS signs every field of `data` as `key=value`, keys sorted alphabetically. */
function signData(data: Record<string, unknown>, key: string) {
  const payload = Object.keys(data)
    .sort()
    .map((name) => `${name}=${fieldValue(data[name])}`)
    .join("&");
  return hmac(payload, key);
}

async function request<T>(path: string, init: { method: "GET" | "POST"; body?: unknown }) {
  const { clientId, apiKey, endpoint } = config();
  let response: Response;
  try {
    response = await fetch(`${endpoint}${path}`, {
      method: init.method,
      headers: {
        "x-client-id": clientId,
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    throw new PayosRequestError(`payOS ${init.method} ${path} failed`, { cause: error });
  }

  const body = (await response.json().catch(() => null)) as {
    code?: string;
    desc?: string;
    data?: T | null;
  } | null;
  if (!body || body.code !== "00" || !body.data) {
    throw new PayosRequestError(
      `payOS ${init.method} ${path} failed (HTTP ${response.status}, code ${body?.code}): ${body?.desc}`,
    );
  }
  return body.data;
}

/** Creates a payOS payment link and returns the VietQR transfer details. */
export async function createPayosPayment({
  orderCode,
  amountVnd,
  description,
  returnUrl,
  cancelUrl,
  expiresAt,
  buyer,
}: {
  /** Positive integer, unique per merchant forever. */
  orderCode: number;
  amountVnd: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  expiresAt: Date;
  buyer: { name: string; email: string; phone: string };
}): Promise<BankTransfer> {
  const { checksumKey } = config();
  const signature = signData(
    { amount: amountVnd, cancelUrl, description, orderCode, returnUrl },
    checksumKey,
  );

  const data = await request<{
    bin: string;
    accountNumber: string;
    accountName: string;
    description: string;
    checkoutUrl: string;
    qrCode: string;
  }>("/v2/payment-requests", {
    method: "POST",
    body: {
      orderCode,
      amount: amountVnd,
      description,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      buyerPhone: buyer.phone,
      cancelUrl,
      returnUrl,
      expiredAt: Math.floor(expiresAt.getTime() / 1000),
      signature,
    },
  });

  return {
    qrCode: data.qrCode,
    bin: data.bin,
    accountNumber: data.accountNumber,
    accountName: data.accountName,
    description: data.description,
    checkoutUrl: data.checkoutUrl,
  };
}

export type PayosLinkStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "UNDERPAID"
  | "CANCELLED"
  | "EXPIRED"
  | "FAILED";

export type PayosPaymentInfo = {
  status: PayosLinkStatus;
  amount: number;
  amountPaid: number;
  /** Bank reference of the latest transfer, if any. */
  transactionId: string | null;
};

/** Reads a payment link's status straight from payOS. */
export async function getPayosPayment(orderCode: number | string): Promise<PayosPaymentInfo> {
  const data = await request<{
    status: PayosLinkStatus;
    amount: number;
    amountPaid: number;
    transactions?: { reference?: string }[];
  }>(`/v2/payment-requests/${encodeURIComponent(String(orderCode))}`, { method: "GET" });

  return {
    status: data.status,
    amount: data.amount,
    amountPaid: data.amountPaid,
    transactionId: data.transactions?.at(-1)?.reference || null,
  };
}

/** Stops a payment link from accepting transfers. */
export async function cancelPayosPayment(orderCode: number | string, reason: string) {
  await request(`/v2/payment-requests/${encodeURIComponent(String(orderCode))}/cancel`, {
    method: "POST",
    body: { cancellationReason: reason },
  });
}

export type PayosWebhookResult = {
  reference: string;
  amountVnd: number;
  success: boolean;
  transactionId: string | null;
  raw: Record<string, string>;
};

/** Verifies a payOS webhook body; null when the signature doesn't match. */
export function verifyPayosWebhook(body: Record<string, unknown>): PayosWebhookResult | null {
  const { checksumKey } = config();
  const data = body.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  if (typeof body.signature !== "string") return null;

  const fields = data as Record<string, unknown>;
  if (!safeEqual(body.signature, signData(fields, checksumKey))) return null;

  const raw: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) raw[key] = fieldValue(value);

  return {
    reference: raw.orderCode ?? "",
    amountVnd: Number(raw.amount ?? 0),
    success: body.code === "00" && raw.code === "00",
    transactionId: raw.reference || null,
    raw,
  };
}
