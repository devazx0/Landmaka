import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiKeysService } from './api-keys.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('ApiKeysService', () => {
  let service: ApiKeysService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      apiKey: {
        findMany: vi.fn(),
        create: vi.fn((args) => Promise.resolve({ id: 'key_123', ...args.data })),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    };

    service = new ApiKeysService(mockPrisma as PrismaService);
  });

  it('should generate a secret key with sk_live_ prefix', async () => {
    const result = await service.create('mer_123', {
      name: 'Test Secret Key',
      type: 'SECRET',
    });

    expect(result.success).toBe(true);
    expect(result.key.key).toMatch(/^sk_live_/);
    expect(result.key.isActive).toBe(true);
  });

  it('should generate a public key with pk_live_ prefix', async () => {
    const result = await service.create('mer_123', {
      name: 'Client Key',
      type: 'PUBLIC',
    });

    expect(result.success).toBe(true);
    expect(result.key.key).toMatch(/^pk_live_/);
  });

  it('should revoke a key successfully', async () => {
    mockPrisma.apiKey.findFirst.mockResolvedValue({ id: 'key_123', merchantId: 'mer_123' });
    mockPrisma.apiKey.update.mockResolvedValue({ id: 'key_123', isActive: false });

    const result = await service.revoke('mer_123', 'key_123');
    expect(result.success).toBe(true);
    expect(mockPrisma.apiKey.update).toHaveBeenCalledWith({
      where: { id: 'key_123' },
      data: { isActive: false },
    });
  });
});
