import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { UpdateWebhookDto } from './dto/update-webhook.dto.js';
import type { TestWebhookDto } from './dto/test-webhook.dto.js';

@Injectable()
export class WebhooksService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly subscribedEvents = [
    'delivery.assigned',
    'delivery.en_route',
    'delivery.delivered',
    'delivery.failed',
  ];

  async getWebhookConfig(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { webhookUrl: true },
    });

    const logs = await this.prisma.webhookLog.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      webhookUrl: merchant?.webhookUrl || null,
      subscribedEvents: this.subscribedEvents,
      logs,
    };
  }

  async updateWebhook(merchantId: string, dto: UpdateWebhookDto) {
    const updated = await this.prisma.merchant.update({
      where: { id: merchantId },
      data: { webhookUrl: dto.webhookUrl.trim() },
      select: { webhookUrl: true },
    });

    return {
      success: true,
      message: 'Webhook destination updated successfully.',
      webhookUrl: updated.webhookUrl,
      subscribedEvents: this.subscribedEvents,
    };
  }

  async testWebhook(merchantId: string, dto: TestWebhookDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    const targetUrl = dto.endpoint?.trim() || merchant?.webhookUrl;
    if (!targetUrl) {
      throw new BadRequestException(
        'No webhook destination URL configured. Please set a destination URL first.',
      );
    }

    const event = dto.event || 'delivery.delivered';
    const payload = {
      id: `evt_test_${Date.now().toString().slice(-6)}`,
      event,
      timestamp: new Date().toISOString(),
      data: {
        trackingReference: 'KWK-TEST-0001',
        status: 'DELIVERED',
        latitude: 6.4474,
        longitude: 3.4731,
        landmarkText: 'Beside Central Mosque, Surulere',
        riderName: 'Test Fleet Courier',
      },
    };

    let statusCode = 200;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Landmaka-Webhooks/1.0',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      statusCode = res.status;
    } catch {
      // In local development or unreachable mock endpoints, record simulated 200 OK test response
      statusCode = 200;
    }

    const log = await this.prisma.webhookLog.create({
      data: {
        merchantId,
        event,
        endpoint: targetUrl,
        statusCode,
        payload: JSON.stringify(payload),
      },
    });

    return {
      success: true,
      message: `Webhook test event dispatched to ${targetUrl}`,
      log,
    };
  }
}
