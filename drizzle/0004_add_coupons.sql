CREATE TYPE "public"."coupon_type" AS ENUM('percent', 'fixed');--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"type" "coupon_type" NOT NULL,
	"value" integer NOT NULL,
	"min_subtotal" integer DEFAULT 0 NOT NULL,
	"max_discount" integer,
	"starts_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"usage_limit" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_upper" CHECK ("coupons"."code" = upper("coupons"."code") and "coupons"."code" <> ''),
	CONSTRAINT "coupons_value_range" CHECK ("coupons"."value" > 0 and ("coupons"."type" <> 'percent' or "coupons"."value" <= 100)),
	CONSTRAINT "coupons_min_subtotal_nonnegative" CHECK ("coupons"."min_subtotal" >= 0),
	CONSTRAINT "coupons_max_discount_positive" CHECK ("coupons"."max_discount" is null or "coupons"."max_discount" > 0),
	CONSTRAINT "coupons_usage_limit_positive" CHECK ("coupons"."usage_limit" is null or "coupons"."usage_limit" > 0)
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "coupon_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "coupon_code" text;--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_coupon_idx" ON "orders" USING btree ("coupon_id");