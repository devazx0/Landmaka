import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminService } from './admin.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;

  const mockPrisma = {
    merchant: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    location: {
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    delivery: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    correction: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    invoice: {
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    apiKey: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    platformPricing: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    adminAuditLog: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
    $transaction: vi.fn().mockImplementation(async (callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getOverview should aggregate platform statistics and return map markers', async () => {
    mockPrisma.merchant.count.mockResolvedValue(5);
    mockPrisma.location.count.mockResolvedValue(250);
    mockPrisma.delivery.count.mockResolvedValue(42);
    mockPrisma.correction.count.mockResolvedValue(3);
    mockPrisma.invoice.findMany.mockResolvedValue([{ amountNgn: 50000 }, { amountNgn: 75000 }]);
    mockPrisma.delivery.findMany.mockResolvedValue([]);
    mockPrisma.correction.findMany.mockResolvedValue([]);

    const result = await service.getOverview();

    expect(result.metrics.totalBusinesses).toBe(5);
    expect(result.metrics.totalRevenueNgn).toBe(125000);
    expect(result.adminMapLocations.length).toBeGreaterThanOrEqual(1);
    expect(result.systemTelemetry.status).toBe('ALL_SYSTEMS_OPERATIONAL');
  });

  it('getPricingConfig and updatePricingConfig should manage platform billing rates', async () => {
    mockPrisma.platformPricing.findFirst.mockResolvedValue({
      id: 'price_1',
      baseLocationCaptureNgn: 25.0,
      baseRouteOptimizationStopNgn: 40.0,
      basePodVerificationNgn: 15.0,
    });

    const current = await service.getPricingConfig();
    expect(current.baseLocationCaptureNgn).toBe(25.0);

    mockPrisma.platformPricing.update.mockResolvedValue({
      id: 'price_1',
      baseLocationCaptureNgn: 30.0,
      baseRouteOptimizationStopNgn: 45.0,
      basePodVerificationNgn: 20.0,
    });

    const updated = await service.updatePricingConfig({
      baseLocationCaptureNgn: 30.0,
      baseRouteOptimizationStopNgn: 45.0,
    });

    expect(updated.baseLocationCaptureNgn).toBe(30.0);
  });

  it('getSystemTelemetry should ping database and report healthy cluster telemetry', async () => {
    const telemetry = await service.getSystemTelemetry();

    expect(telemetry.status).toBe('OPERATIONAL');
    expect(telemetry.database.status).toBe('UP');
    expect(telemetry.database.latencyMs).toBeDefined();
    expect(telemetry.osrmRouter.status).toBe('UP');
  });
});
