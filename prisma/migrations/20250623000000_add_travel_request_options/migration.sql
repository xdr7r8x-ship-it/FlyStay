-- CreateTable
CREATE TABLE "travel_request_options" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description_ar" TEXT NOT NULL,
    "option_type" TEXT NOT NULL DEFAULT 'SUGGESTION',
    "price_hint_ar" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_request_options_pkey" PRIMARY KEY ("id")
);

-- AddIndex
CREATE INDEX "travel_request_options_request_id_idx" ON "travel_request_options"("request_id");
CREATE INDEX "travel_request_options_status_idx" ON "travel_request_options"("status");
CREATE INDEX "travel_request_options_request_id_status_idx" ON "travel_request_options"("request_id", "status");

-- AddForeignKey
ALTER TABLE "travel_request_options" ADD CONSTRAINT "travel_request_options_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "travel_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
