/** NAPAS BIN → short bank name, for the account details on the pay page. */
const BANKS: Record<string, string> = {
  "970436": "Vietcombank",
  "970415": "VietinBank",
  "970418": "BIDV",
  "970405": "Agribank",
  "970422": "MB Bank",
  "970407": "Techcombank",
  "970416": "ACB",
  "970432": "VPBank",
  "970423": "TPBank",
  "970403": "Sacombank",
  "970437": "HDBank",
  "970441": "VIB",
  "970443": "SHB",
  "970431": "Eximbank",
  "970426": "MSB",
  "970448": "OCB",
  "970440": "SeABank",
  "970449": "LPBank",
  "970454": "BVBank",
  "970428": "Nam A Bank",
  "970452": "KienlongBank",
  "970412": "PVcomBank",
  "970425": "ABBANK",
};

export function bankName(bin: string): string | null {
  return BANKS[bin] ?? null;
}
