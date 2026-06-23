-- Encyclopedia Tables for FlyStay Travel Encyclopedia

-- TravelDestination: Cities and destinations
CREATE TABLE "travel_destinations" (
    "id" TEXT PRIMARY KEY,
    "slug" TEXT UNIQUE NOT NULL,
    "city_ar" TEXT NOT NULL,
    "city_en" TEXT,
    "country_ar" TEXT NOT NULL,
    "country_en" TEXT,
    "continent_ar" TEXT NOT NULL DEFAULT 'غير محدد',
    "region_ar" TEXT,
    "description_ar" TEXT NOT NULL,
    "short_summary_ar" TEXT,
    "hero_image_url" TEXT,
    "gallery_images" JSONB DEFAULT '[]',
    "travel_styles" JSONB DEFAULT '[]',
    "best_for_ar" JSONB DEFAULT '[]',
    "not_best_for_ar" JSONB DEFAULT '[]',
    "popular_areas_ar" JSONB DEFAULT '[]',
    "top_activities_ar" JSONB DEFAULT '[]',
    "suggested_durations" JSONB DEFAULT '[]',
    "budget_level" TEXT DEFAULT 'MIXED',
    "season_notes_ar" TEXT,
    "airport_info_ar" TEXT,
    "visa_notes_ar" TEXT,
    "transport_notes_ar" TEXT,
    "family_notes_ar" TEXT,
    "honeymoon_notes_ar" TEXT,
    "safety_notes_ar" TEXT,
    "local_tips_ar" TEXT,
    "status" TEXT DEFAULT 'ACTIVE',
    "source_type" TEXT DEFAULT 'CURATED',
    "last_reviewed_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "travel_destinations_slug_idx" ON "travel_destinations"("slug");
CREATE INDEX "travel_destinations_status_idx" ON "travel_destinations"("status");
CREATE INDEX "travel_destinations_country_idx" ON "travel_destinations"("country_ar");

-- TravelArea: Areas within destinations
CREATE TABLE "travel_areas" (
    "id" TEXT PRIMARY KEY,
    "destination_id" TEXT REFERENCES "travel_destinations"("id") ON DELETE CASCADE,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT,
    "description_ar" TEXT,
    "best_for_ar" JSONB DEFAULT '[]',
    "nearby_highlights_ar" JSONB DEFAULT '[]',
    "budget_level" TEXT,
    "status" TEXT DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "travel_areas_destination_idx" ON "travel_areas"("destination_id");

-- TravelActivity: Activities in destinations
CREATE TABLE "travel_activities" (
    "id" TEXT PRIMARY KEY,
    "destination_id" TEXT REFERENCES "travel_destinations"("id") ON DELETE CASCADE,
    "title_ar" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description_ar" TEXT,
    "duration_hint_ar" TEXT,
    "family_friendly" BOOLEAN DEFAULT false,
    "status" TEXT DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "travel_activities_destination_idx" ON "travel_activities"("destination_id");
CREATE INDEX "travel_activities_category_idx" ON "travel_activities"("category");

-- TripTemplate: Pre-built trip ideas
CREATE TABLE "trip_templates" (
    "id" TEXT PRIMARY KEY,
    "slug" TEXT UNIQUE NOT NULL,
    "title_ar" TEXT NOT NULL,
    "service_type" TEXT NOT NULL,
    "destination_id" TEXT REFERENCES "travel_destinations"("id") ON DELETE SET NULL,
    "city_ar" TEXT,
    "summary_ar" TEXT NOT NULL,
    "ideal_for" JSONB DEFAULT '[]',
    "duration_days" INTEGER,
    "includes_ar" JSONB DEFAULT '[]',
    "itinerary" JSONB DEFAULT '[]',
    "budget_level" TEXT DEFAULT 'MIXED',
    "requirements_ar" JSONB DEFAULT '[]',
    "disclaimers_ar" JSONB DEFAULT '[]',
    "status" TEXT DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "trip_templates_slug_idx" ON "trip_templates"("slug");
CREATE INDEX "trip_templates_status_idx" ON "trip_templates"("status");
CREATE INDEX "trip_templates_service_type_idx" ON "trip_templates"("service_type");

-- StayGuide: Chalets, hotels, resthouses guide
CREATE TABLE "stay_guides" (
    "id" TEXT PRIMARY KEY,
    "type" TEXT NOT NULL,
    "city_ar" TEXT NOT NULL,
    "destination_id" TEXT REFERENCES "travel_destinations"("id") ON DELETE SET NULL,
    "title_ar" TEXT NOT NULL,
    "description_ar" TEXT,
    "capacity_hint_ar" TEXT,
    "features_ar" JSONB DEFAULT '[]',
    "ideal_for" JSONB DEFAULT '[]',
    "has_pool_hint" BOOLEAN,
    "has_outdoor_seating_hint" BOOLEAN,
    "budget_level" TEXT DEFAULT 'MID',
    "disclaimer_ar" TEXT,
    "status" TEXT DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "stay_guides_type_idx" ON "stay_guides"("type");
CREATE INDEX "stay_guides_status_idx" ON "stay_guides"("status");
CREATE INDEX "stay_guides_city_idx" ON "stay_guides"("city_ar");
CREATE INDEX "stay_guides_destination_id_idx" ON "stay_guides"("destination_id");

-- TravelRequest: User travel requests from encyclopedia/AI
CREATE TABLE "travel_requests" (
    "id" TEXT PRIMARY KEY,
    "reference_number" TEXT UNIQUE NOT NULL,
    "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "source_type" TEXT DEFAULT 'MANUAL',
    "service_type" TEXT NOT NULL,
    "destination_id" TEXT REFERENCES "travel_destinations"("id") ON DELETE SET NULL,
    "template_id" TEXT REFERENCES "trip_templates"("id") ON DELETE SET NULL,
    "stay_guide_id" TEXT REFERENCES "stay_guides"("id") ON DELETE SET NULL,
    "city_ar" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "guests" INTEGER,
    "rooms" INTEGER,
    "budget_level" TEXT,
    "notes" TEXT,
    "details" JSONB DEFAULT '{}',
    "status" TEXT DEFAULT 'NEW',
    "payment_status" "PaymentStatus" DEFAULT 'CREATED',
    "booking_status" "BookingStatus" DEFAULT 'REQUESTED',
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "travel_requests_user_idx" ON "travel_requests"("user_id");
CREATE INDEX "travel_requests_status_idx" ON "travel_requests"("status");
CREATE INDEX "travel_requests_reference_number_idx" ON "travel_requests"("reference_number");
CREATE INDEX "travel_requests_stay_guide_id_idx" ON "travel_requests"("stay_guide_id");

CREATE TABLE "provider_statuses" (
    "id" TEXT PRIMARY KEY,
    "provider_name" TEXT NOT NULL,
    "provider_type" TEXT NOT NULL,
    "configured" BOOLEAN NOT NULL DEFAULT false,
    "environment" TEXT,
    "last_checked_at" TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
    "safe_message_ar" TEXT NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX "provider_statuses_provider_name_provider_type_key" ON "provider_statuses"("provider_name", "provider_type");
CREATE INDEX "provider_statuses_provider_type_idx" ON "provider_statuses"("provider_type");

CREATE TABLE "live_search_logs" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT,
    "provider_type" TEXT NOT NULL,
    "provider_name" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "request_summary" JSONB NOT NULL,
    "response_summary" JSONB,
    "error_code" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP DEFAULT NOW()
);
CREATE INDEX "live_search_logs_user_id_idx" ON "live_search_logs"("user_id");
CREATE INDEX "live_search_logs_provider_type_action_idx" ON "live_search_logs"("provider_type", "action");

CREATE TABLE "quotes" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "provider_type" TEXT NOT NULL,
    "provider_name" TEXT NOT NULL,
    "travel_request_id" TEXT REFERENCES "travel_requests"("id") ON DELETE SET NULL,
    "external_quote_id" TEXT,
    "title_ar" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "terms_ar" TEXT,
    "expires_at" TIMESTAMP NOT NULL,
    "raw_provider_reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);
CREATE INDEX "quotes_user_id_idx" ON "quotes"("user_id");
CREATE INDEX "quotes_travel_request_id_idx" ON "quotes"("travel_request_id");
CREATE INDEX "quotes_status_idx" ON "quotes"("status");
