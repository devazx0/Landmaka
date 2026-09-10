import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwt: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      merchant: {
        create: vi.fn(),
      },
      apiKey: {
        create: vi.fn(),
      },
      zone: {
        create: vi.fn(),
      },
      $transaction: vi.fn((cb) => cb(mockPrisma)),
    };

    mockJwt = {
      sign: vi.fn().mockReturnValue('mock_jwt_token'),
      verify: vi.fn(),
    };

    service = new AuthService(mockPrisma as PrismaService, mockJwt as JwtService);
  });

  it('should hash and verify passwords correctly', () => {
    const password = 'SuperSecretPassword123!';
    const hash = service.hashPassword(password);
    expect(hash).toContain(':');
    expect(service.verifyPassword(password, hash)).toBe(true);
    expect(service.verifyPassword('WrongPassword', hash)).toBe(false);
  });

  it('should onboard a new merchant and admin user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.merchant.create.mockResolvedValue({
      id: 'mer_123',
      name: 'Apex Logistics Ltd',
      slug: 'apex-logistics-ltd',
      profile: 'logistics',
      techStack: 'Node.js / NestJS',
      corridor: 'Lagos - Lekki Phase 1',
      deliveryTier: 'Pilot Tier - 1k to 10k',
      createdAt: new Date(),
    });
    mockPrisma.user.create.mockResolvedValue({
      id: 'usr_123',
      name: 'Chinedu Okeke',
      email: 'admin@apexlogistics.io',
      role: 'ADMIN',
    });
    mockPrisma.zone.create.mockResolvedValue({
      id: 'zn_123',
      name: 'Lekki Phase 1 Pilot Zone',
    });

    const res = { cookie: vi.fn() } as any;

    const result = await service.onboard(
      {
        orgName: 'Apex Logistics Ltd',
        leadName: 'Chinedu Okeke',
        adminEmail: 'admin@apexlogistics.io',
        deliveryTier: 'Pilot Tier - 1k to 10k',
        password: 'K9#m$L29!vQz81@L',
        profile: 'logistics',
        techStack: 'Node.js / NestJS',
        corridor: 'Lagos - Lekki Phase 1',
        webhookUrl: 'https://api.merchant.com/webhooks/landmaka',
      },
      res,
    );

    expect(result.success).toBe(true);
    expect(result.token).toBe('mock_jwt_token');
    expect(result.credentials.secretKey).toMatch(/^sk_live_/);
    expect(result.credentials.clientKey).toMatch(/^pk_live_/);
    expect(res.cookie).toHaveBeenCalled();
  });
});
