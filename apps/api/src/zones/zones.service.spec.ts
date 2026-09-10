import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ZonesService } from './zones.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('ZonesService', () => {
  let service: ZonesService;
  let mockPrisma: PrismaService;

  beforeEach(() => {
    mockPrisma = {
      zone: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
    } as unknown as PrismaService;

    service = new ZonesService(mockPrisma);
  });

  it('should correctly determine if a coordinate is within a pilot zone polygon', async () => {
    // Polygon covering [lon: 3.45 to 3.50, lat: 6.43 to 6.47] (Lekki Phase 1)
    const lekkiZone = {
      id: 'z_lekki',
      merchantId: 'mer_1',
      name: 'Lekki Phase 1 Pilot Zone',
      isActive: true,
      boundaryGeoJson: JSON.stringify({
        type: 'Polygon',
        coordinates: [
          [
            [3.45, 6.43],
            [3.50, 6.43],
            [3.50, 6.47],
            [3.45, 6.47],
            [3.45, 6.43],
          ],
        ],
      }),
    };

    (mockPrisma.zone.findMany as any).mockResolvedValue([lekkiZone]);

    // Point inside Lekki Phase 1 (Admiralty Way: lat 6.4474, lon 3.4842)
    const insideResult = await service.checkCoordinate('mer_1', 6.4474, 3.4842);
    expect(insideResult.isCovered).toBe(true);
    expect(insideResult.matchingZones[0].name).toBe('Lekki Phase 1 Pilot Zone');

    // Point outside Lekki Phase 1 (Ikeja: lat 6.5954, lon 3.3431)
    const outsideResult = await service.checkCoordinate('mer_1', 6.5954, 3.3431);
    expect(outsideResult.isCovered).toBe(false);
    expect(outsideResult.matchingZones).toHaveLength(0);
  });
});
