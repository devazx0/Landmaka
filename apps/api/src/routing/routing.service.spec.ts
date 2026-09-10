import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RoutingService } from './routing.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('RoutingService', () => {
  let service: RoutingService;
  let mockPrisma: PrismaService;

  beforeEach(() => {
    mockPrisma = {
      location: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaService;

    service = new RoutingService(mockPrisma);
  });

  it('should optimize a 5-stop single-rider route in Lagos correctly', async () => {
    const origin = {
      latitude: 6.5954,
      longitude: 3.3431,
      label: 'Ikeja Dispatch Hub',
    };

    const stops = [
      {
        id: 'stop_1',
        latitude: 6.4281,
        longitude: 3.4219,
        label: 'Victoria Island Drop',
      },
      {
        id: 'stop_2',
        latitude: 6.4474,
        longitude: 3.4842,
        label: 'Lekki Admiralty Drop',
      },
      {
        id: 'stop_3',
        latitude: 6.452,
        longitude: 3.472,
        label: 'Lekki Filmhouse Drop',
      },
      {
        id: 'stop_4',
        latitude: 6.5015,
        longitude: 3.3581,
        label: 'Surulere Drop',
      },
      {
        id: 'stop_5',
        latitude: 6.5165,
        longitude: 3.3768,
        label: 'Yaba Drop',
      },
    ];

    const result = await service.optimizeRoute('merchant_01', {
      origin,
      stops,
      roundTrip: false,
    });

    expect(result).toBeDefined();
    expect(result.totalStops).toBe(5);
    expect(result.orderedStops).toHaveLength(5);
    expect(result.totalDistanceMeters).toBeGreaterThan(0);
    expect(result.totalDurationSeconds).toBeGreaterThan(0);
    expect(result.geometry.coordinates.length).toBeGreaterThanOrEqual(6);

    result.orderedStops.forEach((stop, index) => {
      expect(stop.sequenceIndex).toBe(index + 1);
    });
  });
});
