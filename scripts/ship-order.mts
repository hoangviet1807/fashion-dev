/**
 * Updates fulfilment from the command line (same as /admin/orders).
 *
 *   pnpm order:ship 100001 --carrier GHN --tracking GHN123456   # → "Đang giao" + email
 *   pnpm order:ship 100001 --delivered                          # → "Hoàn tất"
 *
 * The shipping email is sent once per order; re-running only updates the
 * carrier / tracking number.
 */
import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { OrderTransitionError, markOrderDelivered, markOrderShipped } from "@/lib/orders/fulfillment";

// Modules above read env lazily, so loading it after the imports is fine.
if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    carrier: { type: "string" },
    tracking: { type: "string" },
    delivered: { type: "boolean", default: false },
  },
});

const orderNumber = Number(positionals[0]?.replace(/^#/, ""));
if (!Number.isInteger(orderNumber) || orderNumber <= 0) {
  console.error("Usage: pnpm order:ship ORDER_NUMBER [--carrier NAME] [--tracking CODE] | --delivered");
  process.exit(1);
}

let exitCode = 0;
try {
  if (values.delivered) {
    await markOrderDelivered({ orderNumber });
    console.log(`Order #${orderNumber} marked delivered.`);
  } else {
    const { emailed } = await markOrderShipped({
      orderNumber,
      carrier: values.carrier,
      trackingNumber: values.tracking,
    });
    console.log(
      `Order #${orderNumber} marked shipped.${emailed ? " Shipping email sent." : " No email sent (already sent earlier, or see the error above)."}`,
    );
  }
} catch (error) {
  console.error(error instanceof OrderTransitionError ? error.message : error);
  exitCode = 1;
}
// Also closes the pooled DB connection.
process.exit(exitCode);
