-- Encyclopedia Tables for FlyStay Travel Encyclopedia

-- TravelDestination: Cities and destinations
CREATE TABLE "travel_destinations" (
    "id" TEXT PRIMARY KEY DEFAULT cuid(),
    "slug" TEXT UNIQUE NOT NULL,
    "city_ar" TEXT NOT NULL,
    "city_en" TEXT,
    "country_ar" TEXT NOT NULL,
    "country_en" TEXT,
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
    "transport_notes_ar" TEXT,
    "family_notes_ar" TEXT,
    "safety_notes_ar" TEXT,
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
    "id" TEXT PRIMARY KEY DEFAULT cuid(),
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
    "id" TEXT PRIMARY KEY DEFAULT cuid(),
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
    "id" TEXT PRIMARY KEY DEFAULT cuid(),
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
    "id" TEXT PRIMARY KEY DEFAULT cuid(),
    "type" TEXT NOT NULL,
    "city_ar" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description_ar" TEXT,
    "capacity_hint_ar" TEXT,
    "features_ar" JSONB DEFAULT '[]',
    "ideal_for" JSONB DEFAULT '[]',
    "has_pool_hint" BOOLEAN,
    "has_outdoor_seating_hint" BOOLEAN,
    "budget_level" TEXT DEFAULT 'MID',
    "status" TEXT DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "stay_guides_type_idx" ON "stay_guides"("type");
CREATE INDEX "stay_guides_status_idx" ON "stay_guides"("status");
CREATE INDEX "stay_guides_city_idx" ON "stay_guides"("city_ar");

-- TravelRequest: User travel requests from encyclopedia/AI
CREATE TABLE "travel_requests" (
    "id" TEXT PRIMARY KEY DEFAULT cuid(),
    "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "source_type" TEXT DEFAULT 'MANUAL',
    "service_type" TEXT NOT NULL,
    "destination_id" TEXT REFERENCES "travel_destinations"("id") ON DELETE SET NULL,
    "template_id" TEXT REFERENCES "trip_templates"("id") ON DELETE SET NULL,
    "city_ar" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "guests" INTEGER,
    "rooms" INTEGER,
    "budget_level" TEXT,
    "notes" TEXT,
    "details" JSONB DEFAULT '{}',
    "status" TEXT DEFAULT 'NEW',
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "travel_requests_user_idx" ON "travel_requests"("user_id");
CREATE INDEX "travel_requests_status_idx" ON "travel_requests"("status");
