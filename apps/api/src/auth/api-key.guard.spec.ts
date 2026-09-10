import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let mockPrisma: PrismaService;

  beforeEach(() => {
    mockPrisma = {
      merchant: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
      },
    } as unknown as PrismaService;

    const mockJwt = {
      verify: vi.fn(),
    };

    guard = new ApiKeyGuard(mockPrisma, mockJwt as any);
  });

  const createMockContext = (headers: Record<string, string> = {}) => {
    const request: { headers: Record<string, string>; query: Record<string, string>; merchant?: unknown } = {
      headers,
      query: {},
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should throw UnauthorizedException if x-api-key is missing', async () => {
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should attach merchant and return true when valid API key is provided', async () => {
    const mockMerchant = {
      id: 'mer_123',
      name: 'Pilot Partner',
      apiKey: 'lm_test_key_pilot_01',
    };
    (mockPrisma.merchant.findUnique as any).mockResolvedValue(mockMerchant);

    const context = createMockContext({ 'x-api-key': 'lm_test_key_pilot_01' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const req = context.switchToHttp().getRequest();
    expect(req.merchant).toEqual(mockMerchant);
  });
});
