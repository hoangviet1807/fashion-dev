import { headers } from "next/headers";

/** Caller's IP as reported by the proxy; IPv4-mapped and loopback forms normalised. */
export async function clientIp() {
  const list = await headers();
  const ip =
    list.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    list.get("x-real-ip") ||
    "127.0.0.1";
  return ip === "::1" ? "127.0.0.1" : ip.replace(/^::ffff:/, "");
}
