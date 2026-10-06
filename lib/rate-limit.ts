import { createHash } from "node:crypto";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { rateLimits } from "@/lib/db/schema";

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };
export type RateLimitOptions = { limit: number; windowSeconds: number };

const hashKey = (key: string) => createHash("sha256").update(key).digest("hex");

const retryAfter = (resetAt: Date) =>
  Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / 1000));

/** Minutes to show in "try again in N minutes" messages; never 0. */
export const retryMinutes = ({ retryAfterSeconds }: RateLimitResult) =>
  Math.max(1, Math.ceil(retryAfterSeconds / 60));

/**
 * Fixed-window counter shared by every server instance. Keys are hashed so IPs
 * and emails are not stored in clear.
 */
export async function rateLimit(
  key: string,
  { limit, windowSeconds }: RateLimitOptions,
): Promise<RateLimitResult> {
  const db = getDb();
  const hashed = hashKey(key);
  const window = sql`now() + make_interval(secs => ${windowSeconds})`;

  const [row] = await db
    .insert(rateLimits)
    .values({ key: hashed, count: 1, resetAt: window })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.resetAt} <= now() then 1 else ${rateLimits.count} + 1 end`,
        resetAt: sql`case when ${rateLimits.resetAt} <= now() then ${window} else ${rateLimits.resetAt} end`,
      },
    })
    .returning({ count: rateLimits.count, resetAt: rateLimits.resetAt });

  if (Math.random() < 0.01) {
    await db.delete(rateLimits).where(lt(rateLimits.resetAt, sql`now()`));
  }

  return { ok: row.count <= limit, retryAfterSeconds: retryAfter(row.resetAt) };
}

/**
 * Reads a counter without adding to it, for limits that only count some
 * outcomes (e.g. failed logins). `ok` is false once `limit` hits are recorded.
 */
export async function peekRateLimit(
  key: string,
  { limit }: Pick<RateLimitOptions, "limit">,
): Promise<RateLimitResult> {
  const [row] = await getDb()
    .select({ count: rateLimits.count, resetAt: rateLimits.resetAt })
    .from(rateLimits)
    .where(and(eq(rateLimits.key, hashKey(key)), gt(rateLimits.resetAt, sql`now()`)))
    .limit(1);
  if (!row) return { ok: true, retryAfterSeconds: 0 };
  return { ok: row.count < limit, retryAfterSeconds: retryAfter(row.resetAt) };
}
