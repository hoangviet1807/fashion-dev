import provinces from "./data/provinces.json";

export type Division = { code: string; name: string };

/** Vietnam's 34 provinces and centrally-run cities (since 1/7/2025). */
export const PROVINCES: Division[] = provinces;

export function findProvince(code: string) {
  return PROVINCES.find((province) => province.code === code);
}
