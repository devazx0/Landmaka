import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MetricsService } from './metrics.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('MetricsService', () => {
  let service: MetricsService;
  let mockPrisma: PrismaService;

  beforeEach(() => {
    mockPrisma = {
      merchant: {
        findUnique: vi.fn().mockResolvedValue({ id: 'mer_1', name: 'Pilot Partner' }),
      },
      delivery: {
        findMany: vi.fn(),
      },
      location: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'loc_1', status: 'TRUSTED' },
          { id: 'loc_2', status: 'UNVERIFIED' },
        ]),
      },
    } as unknown as PrismaService;

    service = new MetricsService(mockPrisma);
  });

  it('should compute baseline vs. pilot comparisons and reduction percentages', async () => {
    const mockDeliveries = [
      // Baseline deliveries (higher failure rate, high call count)
      { id: 'b1', isBaseline: true, status: 'DELIVERED', callAttempts: 4, transitDurationMinutes: 50, failureReason: null },
      { id: 'b2', isBaseline: true, status: 'FAILED', callAttempts: 5, transitDurationMinutes: 40, failureReason: 'COULD_NOT_LOCATE_ADDRESS' },
      { id: 'b3', isBaseline: true, status: 'DELIVERED', callAttempts: 3, transitDurationMinutes: 45, failureReason: null },
      { id: 'b4', isBaseline: true, status: 'FAILED', callAttempts: 4, transitDurationMinutes: 60, failureReason: 'CUSTOMER_UNREACHABLE' },

      // Pilot deliveries (lower failure rate, near-zero calls)
      { id: 'p1', isBaseline: false, status: 'DELIVERED', callAttempts: 0, transitDurationMinutes: 20, failureReason: null },
      { id: 'p2', isBaseline: false, status: 'DELIVERED', callAttempts: 1, transitDurationMinutes: 25, failureReason: null },
      { id: 'p3', isBaseline: false, status: 'DELIVERED', callAttempts: 0, transitDurationMinutes: 22, failureReason: null },
      { id: 'p4', isBaseline: false, status: 'DELIVERED', callAttempts: 0, transitDurationMinutes: 18, failureReason: null },
    ];

    (mockPrisma.delivery.findMany as any).mockResolvedValue(mockDeliveries);

    const report = await service.getPilotSummary('mer_1');

    expect(report).toBeDefined();
    expect(report.baseline.totalDeliveries).toBe(4);
    expect(report.baseline.failedDeliveryRatePct).toBe(50); // 2 out of 4 failed = 50%
    expect(report.baseline.avgCallAttemptsPerDelivery).toBe(4); // 16 calls / 4 deliveries = 4.0

    expect(report.pilot.totalDeliveries).toBe(4);
    expect(report.pilot.failedDeliveryRatePct).toBe(0); // 0 out of 4 failed = 0%
    expect(report.pilot.avgCallAttemptsPerDelivery).toBe(0.3); // 1 call / 4 = 0.25 -> 0.3

    // Reductions
    expect(report.improvements.failedDeliveryRateReductionPct).toBe(100); // 50% -> 0% is 100% reduction
    expect(report.improvements.callAttemptsReductionPct).toBeGreaterThan(90);
    expect(report.improvements.avgMinutesSavedPerDelivery).toBeGreaterThan(20);
  });
});
