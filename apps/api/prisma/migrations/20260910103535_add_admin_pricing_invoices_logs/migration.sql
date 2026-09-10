-- CreateTable
CREATE TABLE "platform_pricing" (
    "id" TEXT NOT NULL,
    "base_location_capture_ngn" DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    "base_route_optimization_stop_ngn" DOUBLE PRECISION NOT NULL DEFAULT 40.0,
    "base_pod_verification_ngn" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "starter_monthly_fee_ngn" DOUBLE PRECISION NOT NULL DEFAULT 35000,
    "growth_monthly_fee_ngn" DOUBLE PRECISION NOT NULL DEFAULT 95000,
    "enterprise_monthly_fee_ngn" DOUBLE PRECISION NOT NULL DEFAULT 280000,
    "bulk_discount_percent_over_10k" DOUBLE PRECISION NOT NULL DEFAULT 12,
    "bulk_discount_percent_over_50k" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "free_trial_days" INTEGER NOT NULL DEFAULT 14,
    "auto_suspend_negative_balance_hours" INTEGER NOT NULL DEFAULT 48,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "amount_ngn" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_gateway" TEXT NOT NULL DEFAULT 'Paystack',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "item_breakdown" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "admin_user" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_entity" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "ip_address" TEXT,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_merchant_id_idx" ON "invoices"("merchant_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "admin_audit_logs_action_idx" ON "admin_audit_logs"("action");

-- CreateIndex
CREATE INDEX "admin_audit_logs_level_idx" ON "admin_audit_logs"("level");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
