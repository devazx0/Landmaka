-- AlterTable
ALTER TABLE "deliveries" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "merchants" ADD COLUMN     "client_key" TEXT,
ADD COLUMN     "corridor" TEXT,
ADD COLUMN     "delivery_tier" TEXT DEFAULT 'Pilot Tier - 1k to 10k',
ADD COLUMN     "profile" TEXT DEFAULT 'logistics',
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tech_stack" TEXT;

-- AlterTable
ALTER TABLE "zones" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SECRET',
    "rate_limit_per_min" INTEGER NOT NULL DEFAULT 1000,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proof_of_deliveries" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "delivery_id" TEXT,
    "tracking_reference" TEXT NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "landmark_text" TEXT NOT NULL,
    "gate_description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geotag" TEXT,
    "pod_photo_url" TEXT,
    "otp_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp_code" TEXT,
    "call_attempts" INTEGER NOT NULL DEFAULT 0,
    "rider_name" TEXT,
    "rider_vehicle" TEXT,
    "verification_hash" TEXT,
    "status_category" TEXT NOT NULL DEFAULT 'TRUSTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proof_of_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corrections" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "delivery_ref" TEXT NOT NULL,
    "location_id" TEXT,
    "landmark_text" TEXT NOT NULL,
    "original_gate" TEXT,
    "reported_gate" TEXT NOT NULL,
    "pin_drift_meters" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rider_name" TEXT NOT NULL,
    "rider_confidence" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "type" TEXT NOT NULL DEFAULT 'GATE_CONFLICT',
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corrections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "payload" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_merchant_id_idx" ON "users"("merchant_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_merchant_id_idx" ON "api_keys"("merchant_id");

-- CreateIndex
CREATE INDEX "api_keys_key_idx" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "proof_of_deliveries_merchant_id_idx" ON "proof_of_deliveries"("merchant_id");

-- CreateIndex
CREATE INDEX "proof_of_deliveries_tracking_reference_idx" ON "proof_of_deliveries"("tracking_reference");

-- CreateIndex
CREATE INDEX "corrections_merchant_id_idx" ON "corrections"("merchant_id");

-- CreateIndex
CREATE INDEX "corrections_status_idx" ON "corrections"("status");

-- CreateIndex
CREATE INDEX "webhook_logs_merchant_id_idx" ON "webhook_logs"("merchant_id");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_slug_key" ON "merchants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_client_key_key" ON "merchants"("client_key");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proof_of_deliveries" ADD CONSTRAINT "proof_of_deliveries_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proof_of_deliveries" ADD CONSTRAINT "proof_of_deliveries_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
