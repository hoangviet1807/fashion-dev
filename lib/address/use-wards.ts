"use client";

import { useEffect, useState } from "react";
import { PROVINCES, type Division } from "./provinces";

export const toOptions = (divisions: Division[]) =>
  divisions.map((division) => ({ value: division.code, label: division.name }));

export const PROVINCE_OPTIONS = toOptions(PROVINCES);

const wardCache = new Map<string, Division[]>();

/** Loads a province's wards from the API; each province is fetched once per session. */
export function useWards(provinceCode: string) {
  const [failed, setFailed] = useState<string | null>(null);
  const [, setVersion] = useState(0);
  const cached = provinceCode ? wardCache.get(provinceCode) : undefined;

  useEffect(() => {
    if (!provinceCode || wardCache.has(provinceCode)) return;
    let active = true;
    fetch(`/api/address/wards?province=${encodeURIComponent(provinceCode)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((wards: Division[]) => {
        wardCache.set(provinceCode, wards);
        if (active) setVersion((value) => value + 1);
      })
      .catch(() => {
        if (active) setFailed(provinceCode);
      });
    return () => {
      active = false;
    };
  }, [provinceCode]);

  return {
    wards: cached ?? [],
    loading: Boolean(provinceCode) && !cached && failed !== provinceCode,
  };
}
