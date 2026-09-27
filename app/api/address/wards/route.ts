import { NextResponse, type NextRequest } from "next/server";
import { findProvince } from "@/lib/address/provinces";
import { getWards } from "@/lib/address/wards";

/** Wards of one province, loaded by the checkout form when a province is chosen. */
export function GET(request: NextRequest) {
  const province = request.nextUrl.searchParams.get("province") ?? "";
  if (!findProvince(province)) {
    return NextResponse.json({ error: "Unknown province" }, { status: 404 });
  }
  return NextResponse.json(getWards(province), {
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
  });
}
