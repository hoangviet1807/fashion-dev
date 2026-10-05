/**
 * Grants or revokes access to /admin. The user must have signed up first.
 *
 *   pnpm user:role admin@example.com admin      # everything, including refunds
 *   pnpm user:role kho@example.com staff        # orders, inventory, reviews
 *   pnpm user:role kho@example.com customer     # revoke
 *   pnpm user:role --list                       # current staff / admins
 *
 * Takes effect on the next request; no sign-out needed.
 */
import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import postgres from "postgres";

if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const ROLES = ["customer", "staff", "admin"];

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { list: { type: "boolean", default: false } },
});

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) fail("DATABASE_URL is not set.");
const sql = postgres(url, { max: 1 });

try {
  if (values.list) {
    const rows = await sql`select email, role from users where role <> 'customer' order by role, email`;
    if (rows.length === 0) console.log("No staff or admins yet.");
    for (const row of rows) console.log(`${row.role.padEnd(6)} ${row.email}`);
  } else {
    const email = positionals[0]?.trim().toLowerCase();
    const role = positionals[1]?.trim().toLowerCase();
    if (!email || !role || !ROLES.includes(role)) {
      fail(`Usage: pnpm user:role EMAIL (${ROLES.join(" | ")})  |  pnpm user:role --list`);
    }
    const rows = await sql`
      update users set role = ${role}, updated_at = now()
      where lower(email) = ${email}
      returning email, role`;
    if (rows.length === 0) fail(`No user with email ${email}. Register on the site first.`);
    console.log(`${rows[0].email} is now ${rows[0].role}.`);
  }
} finally {
  await sql.end();
}
