import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const orderStatus = pgEnum("order_status", [
  "pending_payment",
  "paid",
  "awaiting_fulfillment",
  "payment_failed",
  "cancelled",
  "fulfilled",
]);

export const paymentMethod = pgEnum("payment_method", ["vnpay", "momo", "cod"]);

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
]);

export const reservationStatus = pgEnum("reservation_status", [
  "active",
  "committed",
  "released",
]);

export type ShippingAddress = {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  /** Vietnam: province → ward (2-level divisions since 1/7/2025). */
  ward?: string;
  wardCode?: string;
  province?: string;
  provinceCode?: string;
  /** Orders placed before phase 1.6 used an international address. */
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
};

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** Money columns are integers in the order's `currency` (no minor units). */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: integer("number").notNull().generatedAlwaysAsIdentity({ startWith: 100001 }),
    status: orderStatus("status").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    shippingAddress: jsonb("shipping_address").$type<ShippingAddress>().notNull(),
    shippingMethod: text("shipping_method").notNull(),
    paymentMethod: paymentMethod("payment_method").notNull(),
    currency: text("currency").notNull(),
    subtotal: integer("subtotal").notNull(),
    discount: integer("discount").notNull(),
    deliveryFee: integer("delivery_fee").notNull(),
    total: integer("total").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    confirmationSentAt: timestamp("confirmation_sent_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("orders_number_idx").on(table.number),
    index("orders_email_idx").on(table.email),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    image: text("image").notNull(),
    color: text("color").notNull(),
    size: text("size").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: integer("line_total").notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: paymentMethod("provider").notNull(),
    status: paymentStatus("status").notNull().default("pending"),
    /** Amount charged by the provider, in `currency` (VND for VNPay). */
    amount: integer("amount").notNull(),
    currency: text("currency").notNull(),
    /** Our reference sent to the provider (VNPay `vnp_TxnRef`, MoMo `orderId`). */
    reference: text("reference").notNull(),
    /** Provider's transaction id (VNPay `vnp_TransactionNo`, MoMo `transId`). */
    providerTransactionId: text("provider_transaction_id"),
    raw: jsonb("raw").$type<Record<string, string>>(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("payments_reference_idx").on(table.reference),
    index("payments_order_idx").on(table.orderId),
  ],
);

export const inventoryReservations = pgTable(
  "inventory_reservations",
  {
    id: serial("id").primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    quantity: integer("quantity").notNull(),
    status: reservationStatus("status").notNull().default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    index("inventory_reservations_active_idx")
      .on(table.sku)
      .where(sql`${table.status} = 'active'`),
    index("inventory_reservations_order_idx").on(table.orderId),
  ],
);

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
