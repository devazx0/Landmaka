import {
  Injectable,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://postgres:Nov52002%23@localhost:5432/landmaka?schema=public';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL (landmaka) via PrismaPg adapter.');
    } catch (error) {
      this.logger.warn(
        `Could not connect to database on startup: ${(error as Error).message}. Ensure DATABASE_URL is configured and database is running.`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end();
  }
}
