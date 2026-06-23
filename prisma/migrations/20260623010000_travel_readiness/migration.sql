DO $$ BEGIN
  ALTER TYPE "ServiceType" ADD VALUE IF NOT EXISTS 'MIXED';
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "ProviderActionStatus" ADD VALUE IF NOT EXISTS 'SERVICE_NOT_CONFIGURED';
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'REVIEWING';
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'OFFER_SENT';
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE "travel_destinations"
  ADD COLUMN IF NOT EXISTS "continent_ar" TEXT NOT NULL DEFAULT 'غير محدد',
  ADD COLUMN IF NOT EXISTS "visa_notes_ar" TEXT,
  ADD COLUMN IF NOT EXISTS "honeymoon_notes_ar" TEXT,
  ADD COLUMN IF NOT EXISTS "local_tips_ar" TEXT;

ALTER TABLE "stay_guides"
  ADD COLUMN IF NOT EXISTS "destination_id" TEXT,
  ADD COLUMN IF NOT EXISTS "disclaimer_ar" TEXT;

DO $$ BEGIN
  ALTER TABLE "stay_guides" ADD CONSTRAINT "stay_guides_destination_id_fkey"
  FOREIGN KEY ("destination_id") REFERENCES "travel_destinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "travel_requests"
  ADD COLUMN IF NOT EXISTS "reference_number" TEXT,
  ADD COLUMN IF NOT EXISTS "stay_guide_id" TEXT,
  ADD COLUMN IF NOT EXISTS "payment_status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
  ADD COLUMN IF NOT EXISTS "booking_status" "BookingStatus" NOT NULL DEFAULT 'REQUESTED';

UPDATE "travel_requests"
SET "reference_number" = 'TR-' || upper(substr(md5("id"), 1, 10))
WHERE "reference_number" IS NULL;

ALTER TABLE "travel_requests" ALTER COLUMN "reference_number" SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE "travel_requests" ADD CONSTRAINT "travel_requests_stay_guide_id_fkey"
  FOREIGN KEY ("stay_guide_id") REFERENCES "stay_guides"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "travel_requests_reference_number_key" ON "travel_requests"("reference_number");
CREATE INDEX IF NOT EXISTS "travel_requests_reference_number_idx" ON "travel_requests"("reference_number");
CREATE INDEX IF NOT EXISTS "travel_requests_stay_guide_id_idx" ON "travel_requests"("stay_guide_id");
CREATE INDEX IF NOT EXISTS "stay_guides_destination_id_idx" ON "stay_guides"("destination_id");

CREATE TABLE IF NOT EXISTS "provider_statuses" (
  "id" TEXT NOT NULL,
  "provider_name" TEXT NOT NULL,
  "provider_type" TEXT NOT NULL,
  "configured" BOOLEAN NOT NULL DEFAULT false,
  "environment" TEXT,
  "last_checked_at" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
  "safe_message_ar" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "provider_statuses_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "provider_statuses_provider_name_provider_type_key" ON "provider_statuses"("provider_name", "provider_type");
CREATE INDEX IF NOT EXISTS "provider_statuses_provider_type_idx" ON "provider_statuses"("provider_type");

CREATE TABLE IF NOT EXISTS "live_search_logs" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "provider_type" TEXT NOT NULL,
  "provider_name" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "request_summary" JSONB NOT NULL,
  "response_summary" JSONB,
  "error_code" TEXT,
  "error_message" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "live_search_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "live_search_logs_user_id_idx" ON "live_search_logs"("user_id");
CREATE INDEX IF NOT EXISTS "live_search_logs_provider_type_action_idx" ON "live_search_logs"("provider_type", "action");

CREATE TABLE IF NOT EXISTS "quotes" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "provider_type" TEXT NOT NULL,
  "provider_name" TEXT NOT NULL,
  "travel_request_id" TEXT,
  "external_quote_id" TEXT,
  "title_ar" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'SAR',
  "terms_ar" TEXT,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "raw_provider_reference" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_travel_request_id_fkey"
  FOREIGN KEY ("travel_request_id") REFERENCES "travel_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "quotes_user_id_idx" ON "quotes"("user_id");
CREATE INDEX IF NOT EXISTS "quotes_travel_request_id_idx" ON "quotes"("travel_request_id");
CREATE INDEX IF NOT EXISTS "quotes_status_idx" ON "quotes"("status");
