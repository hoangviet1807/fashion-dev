import { headers } from "next/headers";

/** Client IP as reported by the proxy; IPv4-mapped and loopback forms normalised. */
export function ipFromHeaders(list: Headers) {
  const ip =
    list.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    list.get("x-real-ip") ||
    "127.0.0.1";
  return ip === "::1" ? "127.0.0.1" : ip.replace(/^::ffff:/, "");
}

/** Caller's IP for the current request. */
export async function clientIp() {
  return ipFromHeaders(await headers());
}
