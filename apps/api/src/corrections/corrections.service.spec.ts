import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CorrectionsService } from './corrections.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('CorrectionsService', () => {
  let service: CorrectionsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      correction: {
        create: vi.fn((args) => Promise.resolve({ id: 'cor_123', ...args.data })),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      location: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      locationVersion: {
        create: vi.fn(),
      },
      $transaction: vi.fn((cb) => cb(mockPrisma)),
    };

    service = new CorrectionsService(mockPrisma as PrismaService);
  });

  it('should flag excessive pin drift (>200m) as PIN_DRIFT_ALERT', async () => {
    const result = await service.create('mer_123', {
      deliveryRef: 'KWK-LOS-9918',
      landmarkText: 'Freedom Way, Lekki',
      originalGate: 'White wall',
      reportedGate: 'White wall verified',
      pinDriftMeters: 240,
      riderName: 'Babatunde Alabi',
    });

    expect(result.isFlagged).toBe(true);
    expect(result.correction.type).toBe('PIN_DRIFT_ALERT');
    expect(result.correction.status).toBe('PENDING_REVIEW');
  });

  it('should flag gate discrepancies as GATE_CONFLICT', async () => {
    const result = await service.create('mer_123', {
      deliveryRef: 'KWK-LOS-9924',
      landmarkText: 'Ikeja GRA',
      originalGate: 'Black gate',
      reportedGate: 'Blue gate',
      pinDriftMeters: 20,
      riderName: 'Sunday Oladipo',
    });

    expect(result.isFlagged).toBe(true);
    expect(result.correction.type).toBe('GATE_CONFLICT');
    expect(result.correction.status).toBe('PENDING_REVIEW');
  });

  it('should accept correction and increment location version', async () => {
    mockPrisma.correction.findFirst.mockResolvedValue({
      id: 'cor_123',
      locationId: 'loc_001',
      reportedGate: 'Blue sliding gate',
      riderName: 'Sunday Oladipo',
    });
    mockPrisma.location.findFirst.mockResolvedValue({
      id: 'loc_001',
      version: 1,
      latitude: 6.5,
      longitude: 3.3,
      landmarkText: 'Ikeja',
      unitPath: null,
      photoUrl: null,
    });
    mockPrisma.correction.update.mockResolvedValue({ id: 'cor_123', status: 'ACCEPTED' });

    const result = await service.accept('mer_123', 'cor_123');
    expect(result.success).toBe(true);
    expect(mockPrisma.location.update).toHaveBeenCalledWith({
      where: { id: 'loc_001' },
      data: expect.objectContaining({ version: 2, status: 'TRUSTED' }),
    });
    expect(mockPrisma.locationVersion.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ versionNumber: 2, gateDescription: 'Blue sliding gate' }),
    });
  });
});
