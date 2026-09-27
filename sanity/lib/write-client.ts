import { client } from "./client";

/** Server-only client for inventory writes; null when no token is configured. */
export function getWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) return null;
  return client.withConfig({ token, useCdn: false, perspective: "raw" });
}
