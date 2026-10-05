ALTER TYPE "public"."payment_method" ADD VALUE 'payos' BEFORE 'cod';--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "transfer" jsonb;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "expires_at" timestamp with time zone;