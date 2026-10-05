import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const orderStatus = pgEnum("order_status", [
  "pending_payment",
  "paid",
  "awaiting_fulfillment",
  "payment_failed",
  "cancelled",
  "shipped",
  "fulfilled",
]);

export const paymentMethod = pgEnum("payment_method", ["vnpay", "momo", "payos", "cod"]);

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

export const couponType = pgEnum("coupon_type", ["percent", "fixed"]);

export const newsletterStatus = pgEnum("newsletter_status", [
  "pending",
  "subscribed",
  "unsubscribed",
]);

/** `staff` runs fulfilment; `admin` may also refund. See `lib/admin/roles.ts`. */
export const userRole = pgEnum("user_role", ["customer", "staff", "admin"]);

export const orderEventType = pgEnum("order_event_type", [
  "shipped",
  "tracking_updated",
  "delivered",
  "cancelled",
  "refunded",
]);

/** VietQR transfer instructions returned when a payOS payment link is created. */
export type BankTransfer = {
  /** EMVCo VietQR payload; rendered as the QR image. */
  qrCode: string;
  /** NAPAS bank identifier (e.g. 970422). */
  bin: string;
  accountNumber: string;
  accountName: string;
  /** Transfer note payOS matches the payment by. */
  description: string;
  /** Hosted payOS page, used as a fallback on phones. */
  checkoutUrl: string;
};

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
    /** Null for guest checkouts. */
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
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
    couponId: uuid("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
    /** Code as applied, kept if the coupon is later deleted. */
    couponCode: text("coupon_code"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    confirmationSentAt: timestamp("confirmation_sent_at", { withTimezone: true }),
    carrier: text("carrier"),
    trackingNumber: text("tracking_number"),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    shippingNotifiedAt: timestamp("shipping_notified_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("orders_number_idx").on(table.number),
    index("orders_email_idx").on(table.email),
    index("orders_user_idx").on(table.userId),
    index("orders_coupon_idx").on(table.couponId),
  ],
);

/**
 * Promo codes. Uses are counted from orders (see `lib/coupons/server.ts`), so a
 * failed or abandoned payment frees its use without bookkeeping.
 */
export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Stored upper-case; lookups normalise the input. */
    code: text("code").notNull(),
    type: couponType("type").notNull(),
    /** Percent (1–100) or a fixed amount in VND. */
    value: integer("value").notNull(),
    minSubtotal: integer("min_subtotal").notNull().default(0),
    /** Cap for percent coupons; null = uncapped. */
    maxDiscount: integer("max_discount"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    /** Total uses across all customers; null = unlimited. */
    usageLimit: integer("usage_limit"),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("coupons_code_idx").on(table.code),
    check("coupons_code_upper", sql`${table.code} = upper(${table.code}) and ${table.code} <> ''`),
    check(
      "coupons_value_range",
      sql`${table.value} > 0 and (${table.type} <> 'percent' or ${table.value} <= 100)`,
    ),
    check("coupons_min_subtotal_nonnegative", sql`${table.minSubtotal} >= 0`),
    check("coupons_max_discount_positive", sql`${table.maxDiscount} is null or ${table.maxDiscount} > 0`),
    check("coupons_usage_limit_positive", sql`${table.usageLimit} is null or ${table.usageLimit} > 0`),
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
    /** Our reference sent to the provider (VNPay `vnp_TxnRef`, MoMo / payOS `orderCode`). */
    reference: text("reference").notNull(),
    /** Provider's transaction id (VNPay `vnp_TransactionNo`, MoMo `transId`, payOS `reference`). */
    providerTransactionId: text("provider_transaction_id"),
    raw: jsonb("raw").$type<Record<string, string>>(),
    /** Bank transfer details shown on `/order/[id]/pay` (payOS only). */
    transfer: jsonb("transfer").$type<BankTransfer>(),
    /** When the payment link stops accepting money; matches the stock reservation. */
    expiresAt: timestamp("expires_at", { withTimezone: true }),
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

/** Auth.js users; `passwordHash` is null for accounts created through Google only. */
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
  image: text("image"),
  phone: text("phone"),
  passwordHash: text("password_hash"),
  role: userRole("role").notNull().default("customer"),
  ...timestamps,
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index("accounts_user_idx").on(table.userId),
  ],
);

/** Only the SHA-256 of the emailed token is stored. */
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("password_reset_tokens_user_idx").on(table.userId)],
);

/** Address book; names are stored alongside codes so old entries survive division changes. */
export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    apartment: text("apartment").notNull().default(""),
    provinceCode: text("province_code").notNull(),
    province: text("province").notNull(),
    wardCode: text("ward_code").notNull(),
    ward: text("ward").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index("addresses_user_idx").on(table.userId),
    uniqueIndex("addresses_user_default_idx")
      .on(table.userId)
      .where(sql`${table.isDefault}`),
  ],
);

/** Signed-in shoppers' carts; prices and stock are re-read from Sanity on load. */
export const cartItems = pgTable(
  "cart_items",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    quantity: integer("quantity").notNull(),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.userId, table.sku] })],
);

/**
 * Product reviews, keyed by product slug (as stored on `order_items`). Only
 * shoppers with a confirmed order for the product may write one; one per user.
 */
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productSlug: text("product_slug").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Purchase that qualified the review. */
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    rating: smallint("rating").notNull(),
    content: text("content").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("reviews_product_user_idx").on(table.productSlug, table.userId),
    index("reviews_product_created_idx").on(table.productSlug, table.createdAt),
    index("reviews_user_idx").on(table.userId),
    check("reviews_rating_range", sql`${table.rating} between 1 and 5`),
  ],
);

/**
 * Double opt-in: rows start `pending` until the emailed link is opened. Only the
 * SHA-256 of the confirmation token is stored; the unsubscribe token is a
 * random handle that only allows opting out.
 */
export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Stored lower-case. */
    email: text("email").notNull(),
    status: newsletterStatus("status").notNull().default("pending"),
    confirmTokenHash: text("confirm_token_hash"),
    confirmSentAt: timestamp("confirm_sent_at", { withTimezone: true }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    unsubscribeToken: text("unsubscribe_token").notNull(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("newsletter_subscribers_email_idx").on(table.email),
    uniqueIndex("newsletter_subscribers_confirm_token_idx").on(table.confirmTokenHash),
    uniqueIndex("newsletter_subscribers_unsubscribe_token_idx").on(table.unsubscribeToken),
    check("newsletter_subscribers_email_lower", sql`${table.email} = lower(${table.email})`),
  ],
);

/**
 * Money returned to the customer, recorded by an admin after refunding through
 * the payment provider's portal (or in cash / by transfer for COD).
 */
export const refunds = pgTable(
  "refunds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    /** In the order's `currency`. */
    amount: integer("amount").notNull(),
    reason: text("reason").notNull(),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("refunds_order_idx").on(table.orderId),
    check("refunds_amount_positive", sql`${table.amount} > 0`),
  ],
);

/** Audit trail of admin / CLI changes to an order; `actorId` is null for the CLI. */
export const orderEvents = pgTable(
  "order_events",
  {
    id: serial("id").primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    type: orderEventType("type").notNull(),
    note: text("note"),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("order_events_order_idx").on(table.orderId, table.createdAt)],
);

/** Fixed-window counters for `lib/rate-limit.ts`; keys are hashed. */
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull(),
    resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("rate_limits_reset_idx").on(table.resetAt)],
);

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type User = typeof users.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Refund = typeof refunds.$inferSelect;
export type OrderEvent = typeof orderEvents.$inferSelect;
export type UserRole = User["role"];
