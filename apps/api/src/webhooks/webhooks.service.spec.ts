import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhooksService } from './webhooks.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      merchant: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      webhookLog: {
        findMany: vi.fn(),
        create: vi.fn((args) => Promise.resolve({ id: 'wh_123', ...args.data })),
      },
    };

    service = new WebhooksService(mockPrisma as PrismaService);
  });

  it('should retrieve webhook config and subscribed events', async () => {
    mockPrisma.merchant.findUnique.mockResolvedValue({
      webhookUrl: 'https://api.merchant.com/webhooks',
    });
    mockPrisma.webhookLog.findMany.mockResolvedValue([]);

    const result = await service.getWebhookConfig('mer_123');
    expect(result.webhookUrl).toBe('https://api.merchant.com/webhooks');
    expect(result.subscribedEvents).toContain('delivery.delivered');
  });

  it('should update webhook URL', async () => {
    mockPrisma.merchant.update.mockResolvedValue({
      webhookUrl: 'https://api.new-url.com/webhooks',
    });

    const result = await service.updateWebhook('mer_123', {
      webhookUrl: 'https://api.new-url.com/webhooks',
    });

    expect(result.success).toBe(true);
    expect(result.webhookUrl).toBe('https://api.new-url.com/webhooks');
  });

  it('should test webhook event dispatch', async () => {
    mockPrisma.merchant.findUnique.mockResolvedValue({
      webhookUrl: 'https://api.merchant.com/webhooks',
    });

    const result = await service.testWebhook('mer_123', {
      event: 'delivery.delivered',
    });

    expect(result.success).toBe(true);
    expect(result.log.statusCode).toBe(200);
    expect(mockPrisma.webhookLog.create).toHaveBeenCalled();
  });
});
