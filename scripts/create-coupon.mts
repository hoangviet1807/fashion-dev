/**
 * Creates or updates a promo code.
 *
 *   pnpm coupon:create SALE20 --percent 20 --max 100000 --min 300000 --expires 2026-12-31 --limit 100
 *   pnpm coupon:create GIAM50K --fixed 50000 --min 500000
 *   pnpm coupon:create SALE20 --disable
 *
 * Dates are end-of-day in Vietnam time (UTC+7). Re-running with the same code
 * overwrites its terms; usage is counted from orders, so it is never reset.
 */
import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import postgres from "postgres";

if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    percent: { type: "string" },
    fixed: { type: "string" },
    min: { type: "string" },
    max: { type: "string" },
    starts: { type: "string" },
    expires: { type: "string" },
    limit: { type: "string" },
    disable: { type: "boolean", default: false },
  },
});

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function int(name: string, raw: string | undefined) {
  if (raw === undefined) return null;
  const value = Number(raw.replace(/[._]/g, ""));
  if (!Number.isInteger(value) || value < 0) fail(`--${name} must be a non-negative integer.`);
  return value;
}

function date(name: string, raw: string | undefined, endOfDay: boolean) {
  if (raw === undefined) return null;
  const value = new Date(`${raw}T${endOfDay ? "23:59:59" : "00:00:00"}+07:00`);
  if (Number.isNaN(value.getTime())) fail(`--${name} must be a date like 2026-12-31.`);
  return value;
}

const code = positionals[0]?.trim().toUpperCase();
if (!code || !/^[A-Z0-9_-]{1,40}$/.test(code)) {
  fail("Usage: pnpm coupon:create CODE (--percent N | --fixed VND) [--min VND] [--max VND] [--starts YYYY-MM-DD] [--expires YYYY-MM-DD] [--limit N] [--disable]");
}

const url = process.env.DATABASE_URL;
if (!url) fail("DATABASE_URL is not set.");
const sql = postgres(url, { max: 1 });

try {
  if (values.disable) {
    const rows = await sql`update coupons set active = false, updated_at = now() where code = ${code} returning code`;
    console.log(rows.length > 0 ? `Disabled ${code}.` : `No coupon ${code}.`);
  } else {
    if ((values.percent === undefined) === (values.fixed === undefined)) {
      fail("Pass exactly one of --percent or --fixed.");
    }
    const type = values.percent !== undefined ? "percent" : "fixed";
    const value = int(type, values.percent ?? values.fixed);
    if (!value || (type === "percent" && value > 100)) fail(`--${type} is out of range.`);

    const coupon = {
      code,
      type,
      value,
      min_subtotal: int("min", values.min) ?? 0,
      max_discount: int("max", values.max),
      starts_at: date("starts", values.starts, false),
      expires_at: date("expires", values.expires, true),
      usage_limit: int("limit", values.limit),
      active: true,
    };

    const [row] = await sql`
      insert into coupons ${sql(coupon)}
      on conflict (code) do update set
        type = excluded.type,
        value = excluded.value,
        min_subtotal = excluded.min_subtotal,
        max_discount = excluded.max_discount,
        starts_at = excluded.starts_at,
        expires_at = excluded.expires_at,
        usage_limit = excluded.usage_limit,
        active = true,
        updated_at = now()
      returning *`;
    console.log("Saved coupon:", row);
  }
} finally {
  await sql.end();
}
