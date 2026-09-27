import { createHmac, timingSafeEqual } from "node:crypto";

const SANDBOX_ENDPOINT = "https://test-payment.momo.vn";

function config() {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  if (!partnerCode || !accessKey || !secretKey) {
    throw new Error("MOMO_PARTNER_CODE, MOMO_ACCESS_KEY and MOMO_SECRET_KEY must be set.");
  }
  return {
    partnerCode,
    accessKey,
    secretKey,
    endpoint: process.env.MOMO_ENDPOINT ?? SANDBOX_ENDPOINT,
  };
}

export function isMomoConfigured() {
  return Boolean(
    process.env.MOMO_PARTNER_CODE && process.env.MOMO_ACCESS_KEY && process.env.MOMO_SECRET_KEY,
  );
}

/** MoMo signs `key=value` pairs joined in a fixed, alphabetical key order (values not encoded). */
function sign(fields: [string, string][], secretKey: string) {
  const data = fields.map(([key, value]) => `${key}=${value}`).join("&");
  return createHmac("sha256", secretKey).update(data, "utf-8").digest("hex");
}

export class MomoRequestError extends Error {}

/** Creates a MoMo wallet payment and returns the hosted payment page URL. */
export async function createMomoPayment({
  reference,
  amountVnd,
  orderInfo,
  redirectUrl,
  ipnUrl,
  lang = "vi",
}: {
  reference: string;
  amountVnd: number;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
  lang?: "vi" | "en";
}): Promise<string> {
  const { partnerCode, accessKey, secretKey, endpoint } = config();
  const requestType = "captureWallet";
  const extraData = "";
  const amount = String(amountVnd);

  const signature = sign(
    [
      ["accessKey", accessKey],
      ["amount", amount],
      ["extraData", extraData],
      ["ipnUrl", ipnUrl],
      ["orderId", reference],
      ["orderInfo", orderInfo],
      ["partnerCode", partnerCode],
      ["redirectUrl", redirectUrl],
      ["requestId", reference],
      ["requestType", requestType],
    ],
    secretKey,
  );

  let response: Response;
  try {
    response = await fetch(`${endpoint}/v2/gateway/api/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partnerCode,
        requestId: reference,
        orderId: reference,
        amount: amountVnd,
        orderInfo,
        redirectUrl,
        ipnUrl,
        requestType,
        extraData,
        lang,
        signature,
      }),
      // MoMo asks for a timeout of at least 30s on this call.
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    throw new MomoRequestError("MoMo create request failed", { cause: error });
  }

  const body = (await response.json().catch(() => null)) as {
    resultCode?: number;
    message?: string;
    payUrl?: string;
  } | null;
  if (!body || body.resultCode !== 0 || !body.payUrl) {
    throw new MomoRequestError(
      `MoMo create failed (HTTP ${response.status}, resultCode ${body?.resultCode}): ${body?.message}`,
    );
  }
  return body.payUrl;
}

/** Initiated, processing, or authorized-awaiting-capture: not a final result. */
const PENDING_CODES = new Set(["1000", "7000", "7002", "9000"]);

export type MomoResult = {
  reference: string;
  amountVnd: number;
  success: boolean;
  pending: boolean;
  resultCode: string;
  transactionId: string | null;
  raw: Record<string, string>;
};

const RESULT_FIELDS = [
  "accessKey",
  "amount",
  "extraData",
  "message",
  "orderId",
  "orderInfo",
  "orderType",
  "partnerCode",
  "payType",
  "requestId",
  "responseTime",
  "resultCode",
  "transId",
] as const;

/**
 * Verifies a payment result from the IPN body or the redirect query (same fields);
 * returns null when the signature or partner code doesn't match.
 */
export function verifyMomoResult(
  input: URLSearchParams | Record<string, unknown>,
): MomoResult | null {
  const { partnerCode, accessKey, secretKey } = config();

  const raw: Record<string, string> = {};
  const entries = input instanceof URLSearchParams ? input.entries() : Object.entries(input);
  for (const [key, value] of entries) {
    if (value === null || value === undefined || typeof value === "object") continue;
    raw[key] = String(value);
  }

  const expected = sign(
    RESULT_FIELDS.map((key) => [key, key === "accessKey" ? accessKey : (raw[key] ?? "")]),
    secretKey,
  );
  const received = (raw.signature ?? "").toLowerCase();
  if (
    raw.partnerCode !== partnerCode ||
    received.length !== expected.length ||
    !timingSafeEqual(Buffer.from(received), Buffer.from(expected))
  ) {
    return null;
  }

  return {
    reference: raw.orderId ?? "",
    amountVnd: Number(raw.amount ?? 0),
    success: raw.resultCode === "0",
    pending: PENDING_CODES.has(raw.resultCode ?? ""),
    resultCode: raw.resultCode ?? "",
    transactionId: raw.transId || null,
    raw,
  };
}
