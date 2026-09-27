import wards from "./data/wards.json";
import { findProvince, type Division } from "./provinces";

/** Server-only: the full ward list is too large to ship to the browser. */
const WARDS: Record<string, Division[]> = wards;

export function getWards(provinceCode: string): Division[] {
  return WARDS[provinceCode] ?? [];
}

/** Returns province and ward names, or null when the ward is not in the province. */
export function resolveAddress(provinceCode: string, wardCode: string) {
  const province = findProvince(provinceCode);
  const ward = getWards(provinceCode).find((item) => item.code === wardCode);
  if (!province || !ward) return null;
  return { province: province.name, ward: ward.name };
}
