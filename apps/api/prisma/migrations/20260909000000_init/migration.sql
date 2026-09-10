-- Baseline initial migration for existing database
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."DeliveryFailureReason" AS ENUM ('COULD_NOT_LOCATE_ADDRESS', 'CUSTOMER_UNREACHABLE', 'CUSTOMER_UNAVAILABLE', 'RESTRICTED_ACCESS_GATE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DeliveryStatus" AS ENUM ('PENDING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "public"."LocationCreator" AS ENUM ('CUSTOMER', 'RIDER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."LocationStatus" AS ENUM ('UNVERIFIED', 'TRUSTED', 'FLAGGED');

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."deliveries" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "location_id" TEXT,
    "tracking_reference" TEXT NOT NULL,
    "recipient_name" TEXT,
    "recipient_phone" TEXT,
    "status" "public"."DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "is_baseline" BOOLEAN NOT NULL DEFAULT false,
    "call_attempts" INTEGER NOT NULL DEFAULT 0,
    "failure_reason" "public"."DeliveryFailureReason",
    "transit_duration_minutes" INTEGER,
    "notes" TEXT,
    "dispatched_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."location_versions" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "landmark_text" TEXT NOT NULL,
    "gate_description" TEXT,
    "unit_path" TEXT,
    "photo_url" TEXT,
    "submitted_by_rider_id" TEXT,
    "change_summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "landmark_text" TEXT NOT NULL,
    "gate_description" TEXT,
    "unit_path" TEXT,
    "photo_url" TEXT,
    "contact_name" TEXT,
    "contact_phone" TEXT,
    "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "status" "public"."LocationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" "public"."LocationCreator" NOT NULL DEFAULT 'CUSTOMER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "geom" geography GENERATED ALWAYS AS (st_setsrid(st_makepoint(longitude, latitude), 4326)::geography) STORED,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."merchants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "webhook_url" TEXT,
    "rate_limit_tier" TEXT NOT NULL DEFAULT 'standard',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."zones" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "boundary_geojson" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "deliveries_is_baseline_idx" ON "public"."deliveries"("is_baseline" ASC);
CREATE INDEX IF NOT EXISTS "deliveries_merchant_id_idx" ON "public"."deliveries"("merchant_id" ASC);
CREATE INDEX IF NOT EXISTS "deliveries_status_idx" ON "public"."deliveries"("status" ASC);
CREATE INDEX IF NOT EXISTS "location_versions_location_id_idx" ON "public"."location_versions"("location_id" ASC);
CREATE INDEX IF NOT EXISTS "idx_locations_geom" ON "public"."locations" USING GIST ("geom");
CREATE INDEX IF NOT EXISTS "locations_latitude_longitude_idx" ON "public"."locations"("latitude" ASC, "longitude" ASC);
CREATE INDEX IF NOT EXISTS "locations_merchant_id_idx" ON "public"."locations"("merchant_id" ASC);
CREATE UNIQUE INDEX IF NOT EXISTS "merchants_api_key_key" ON "public"."merchants"("api_key" ASC);
CREATE INDEX IF NOT EXISTS "zones_merchant_id_idx" ON "public"."zones"("merchant_id" ASC);

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "public"."deliveries" ADD CONSTRAINT "deliveries_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."deliveries" ADD CONSTRAINT "deliveries_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."location_versions" ADD CONSTRAINT "location_versions_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."locations" ADD CONSTRAINT "locations_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "public"."zones" ADD CONSTRAINT "zones_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
