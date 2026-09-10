import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProofOfDeliveryService } from './proof-of-delivery.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('ProofOfDeliveryService', () => {
  let service: ProofOfDeliveryService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      delivery: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      proofOfDelivery: {
        create: vi.fn((args) => Promise.resolve({ id: 'pod_123', ...args.data, createdAt: new Date() })),
        findMany: vi.fn(),
        count: vi.fn(),
        findFirst: vi.fn(),
      },
      $transaction: vi.fn((cb) => cb(mockPrisma)),
    };

    service = new ProofOfDeliveryService(mockPrisma as PrismaService);
  });

  it('should create proof of delivery with OTP verification and tamper-proof hash', async () => {
    mockPrisma.delivery.findFirst.mockResolvedValue({
      id: 'dlv_9922',
      trackingReference: 'KWK-LOS-9922',
      status: 'EN_ROUTE',
    });

    const result = await service.create('mer_123', {
      trackingReference: 'KWK-LOS-9922',
      recipientName: 'Chinedu Okafor',
      landmarkText: 'Admiralty Way, Lekki',
      gateDescription: 'Black security gate',
      latitude: 6.4474,
      longitude: 3.4731,
      otpCode: '7712',
      callAttempts: 0,
      podPhotoUrl: 'https://example.com/photo.jpg',
      riderName: 'Emeka Nwosu',
    });

    expect(result.success).toBe(true);
    expect(result.proof.otpVerified).toBe(true);
    expect(result.proof.verificationHash).toMatch(/^SHA256: [a-f0-9]{12}$/);
    expect(mockPrisma.delivery.update).toHaveBeenCalledWith({
      where: { id: 'dlv_9922' },
      data: expect.objectContaining({ status: 'DELIVERED' }),
    });
  });
});
