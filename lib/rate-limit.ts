import { createHash } from "node:crypto";
import { lt, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { rateLimits } from "@/lib/db/schema";

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

/**
 * Fixed-window counter shared by every server instance. Keys are hashed so IPs
 * and emails are not stored in clear.
 */
export async function rateLimit(
  key: string,
  { limit, windowSeconds }: { limit: number; windowSeconds: number },
): Promise<RateLimitResult> {
  const db = getDb();
  const hashed = createHash("sha256").update(key).digest("hex");
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

  return {
    ok: row.count <= limit,
    retryAfterSeconds: Math.max(0, Math.ceil((row.resetAt.getTime() - Date.now()) / 1000)),
  };
}
