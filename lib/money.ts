/** Currency of catalog prices and orders. Amounts are whole VND (no minor units). */
export const STORE_CURRENCY = "VND";

const vndNumber = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

/** `350000` → `350.000₫`. Orders placed before the VND switch keep their USD currency. */
export function formatPrice(amount: number, currency: string = STORE_CURRENCY) {
  if (currency === "USD") return `$${amount}`;
  return `${vndNumber.format(amount)}₫`;
}
