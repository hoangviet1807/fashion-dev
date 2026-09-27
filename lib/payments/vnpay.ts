import { createHmac, timingSafeEqual } from "node:crypto";

const SANDBOX_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

/** Minutes a VNPay payment link stays valid; matches the stock reservation. */
export const VNPAY_EXPIRE_MINUTES = 15;

function config() {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  if (!tmnCode || !hashSecret) {
    throw new Error("VNPAY_TMN_CODE and VNPAY_HASH_SECRET must be set.");
  }
  return {
    tmnCode,
    hashSecret,
    payUrl: process.env.VNPAY_PAY_URL ?? SANDBOX_URL,
  };
}

export function isVnpayConfigured() {
  return Boolean(process.env.VNPAY_TMN_CODE && process.env.VNPAY_HASH_SECRET);
}

/** yyyyMMddHHmmss in Vietnam time (GMT+7), as VNPay requires. */
function vnDate(date: Date) {
  const vn = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    vn.getUTCFullYear() +
    pad(vn.getUTCMonth() + 1) +
    pad(vn.getUTCDate()) +
    pad(vn.getUTCHours()) +
    pad(vn.getUTCMinutes()) +
    pad(vn.getUTCSeconds())
  );
}

/** VNPay signs the sorted, form-encoded query (spaces as "+"). */
function signData(params: Record<string, string>) {
  return Object.keys(params)
    .sort()
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(params[key]).replace(/%20/g, "+")}`,
    )
    .join("&");
}

function sign(data: string, secret: string) {
  return createHmac("sha512", secret).update(Buffer.from(data, "utf-8")).digest("hex");
}

export function buildVnpayUrl({
  reference,
  amountVnd,
  orderInfo,
  ipAddr,
  returnUrl,
  bankCode,
  locale = "vn",
  now = new Date(),
}: {
  reference: string;
  amountVnd: number;
  orderInfo: string;
  ipAddr: string;
  returnUrl: string;
  /** `VNPAYQR`, `VNBANK`, `INTCARD` or a bank code; omitted = VNPay shows every method. */
  bankCode?: string;
  /** Language of the VNPay payment page. */
  locale?: "vn" | "en";
  now?: Date;
}) {
  const { tmnCode, hashSecret, payUrl } = config();
  const expires = new Date(now.getTime() + VNPAY_EXPIRE_MINUTES * 60 * 1000);

  const params: Record<string, string> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: String(amountVnd * 100),
    vnp_CurrCode: "VND",
    vnp_TxnRef: reference,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Locale: locale,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: vnDate(now),
    vnp_ExpireDate: vnDate(expires),
  };
  if (bankCode) params.vnp_BankCode = bankCode;

  const data = signData(params);
  return `${payUrl}?${data}&vnp_SecureHash=${sign(data, hashSecret)}`;
}

export type VnpayCallback = {
  reference: string;
  amountVnd: number;
  success: boolean;
  responseCode: string;
  transactionNo: string | null;
  raw: Record<string, string>;
};

/** Verifies a return/IPN query string; returns null when the signature is invalid. */
export function verifyVnpayCallback(query: URLSearchParams): VnpayCallback | null {
  const { hashSecret } = config();

  const raw: Record<string, string> = {};
  const signed: Record<string, string> = {};
  for (const [key, value] of query) {
    if (!key.startsWith("vnp_")) continue;
    raw[key] = value;
    if (key !== "vnp_SecureHash" && key !== "vnp_SecureHashType") signed[key] = value;
  }

  const received = (raw.vnp_SecureHash ?? "").toLowerCase();
  const expected = sign(signData(signed), hashSecret);
  if (
    received.length !== expected.length ||
    !timingSafeEqual(Buffer.from(received), Buffer.from(expected))
  ) {
    return null;
  }

  return {
    reference: raw.vnp_TxnRef ?? "",
    amountVnd: Math.round(Number(raw.vnp_Amount ?? 0) / 100),
    success: raw.vnp_ResponseCode === "00" && raw.vnp_TransactionStatus === "00",
    responseCode: raw.vnp_ResponseCode ?? "",
    transactionNo: raw.vnp_TransactionNo ?? null,
    raw,
  };
}
