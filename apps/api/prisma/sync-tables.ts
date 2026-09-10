import 'dotenv/config';
import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:Nov52002%23@localhost:5432/landmaka?schema=public';

async function main() {
  const pool = new Pool({ connectionString });
  console.log('Synchronizing database schema safely for Phase 2...');

  try {
    // 1. Create Enums if not exists
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RESCHEDULED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE "DeliveryFailureReason" AS ENUM ('COULD_NOT_LOCATE_ADDRESS', 'CUSTOMER_UNREACHABLE', 'CUSTOMER_UNAVAILABLE', 'RESTRICTED_ACCESS_GATE', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Create deliveries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "deliveries" (
        "id" TEXT NOT NULL,
        "merchant_id" TEXT NOT NULL,
        "location_id" TEXT,
        "tracking_reference" TEXT NOT NULL,
        "recipient_name" TEXT,
        "recipient_phone" TEXT,
        "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
        "is_baseline" BOOLEAN NOT NULL DEFAULT false,
        "call_attempts" INTEGER NOT NULL DEFAULT 0,
        "failure_reason" "DeliveryFailureReason",
        "transit_duration_minutes" INTEGER,
        "notes" TEXT,
        "dispatched_at" TIMESTAMP(3),
        "completed_at" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "deliveries_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "deliveries_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS "deliveries_merchant_id_idx" ON "deliveries"("merchant_id");`);
    await pool.query(`CREATE INDEX IF NOT EXISTS "deliveries_is_baseline_idx" ON "deliveries"("is_baseline");`);
    await pool.query(`CREATE INDEX IF NOT EXISTS "deliveries_status_idx" ON "deliveries"("status");`);

    // 3. Create zones table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "zones" (
        "id" TEXT NOT NULL,
        "merchant_id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "boundary_geojson" TEXT NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "zones_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "zones_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS "zones_merchant_id_idx" ON "zones"("merchant_id");`);

    console.log('Phase 2 tables (deliveries, zones) created successfully in PostgreSQL without data loss!');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
