import type { PaymentMethodId } from "@/lib/checkout/schema";

const BADGE = "inline-flex h-8 min-w-[52px] shrink-0 items-center justify-center rounded-[8px] px-2 text-[11px] font-extrabold tracking-tight";

/** Wordmark badges in each provider's brand colours; no external logo assets needed. */
export function PaymentLogo({ method }: { method: PaymentMethodId }) {
  switch (method) {
    case "vnpay":
      return (
        <span aria-hidden className={`${BADGE} border border-line bg-white`}>
          <span className="text-[#ED1C24]">VN</span>
          <span className="text-[#005BAA]">PAY</span>
        </span>
      );
    case "momo":
      return (
        <span aria-hidden className={`${BADGE} bg-[#A50064] text-white`}>
          MoMo
        </span>
      );
    case "payos":
      return (
        <span aria-hidden className={`${BADGE} border border-line bg-white`}>
          <span className="text-[#ED1C24]">Viet</span>
          <span className="text-[#005BAA]">QR</span>
        </span>
      );
    case "cod":
      return (
        <span aria-hidden className={`${BADGE} bg-black text-white`}>
          <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h18v10H3z" />
            <path d="M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            <path d="M6 10v4M18 10v4" />
          </svg>
          <span className="ml-1">COD</span>
        </span>
      );
  }
}
