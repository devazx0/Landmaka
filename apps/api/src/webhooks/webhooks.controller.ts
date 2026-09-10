import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service.js';
import { UpdateWebhookDto } from './dto/update-webhook.dto.js';
import { TestWebhookDto } from './dto/test-webhook.dto.js';
import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { CurrentMerchant } from '../auth/current-merchant.decorator.js';
import type { Merchant } from '../generated/prisma/client.js';

@ApiTags('Webhooks & Event Streams')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('api/v1/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({
    summary: 'Get partner webhook configuration and recent dispatch logs (FR14)',
    description: 'Retrieves destination endpoint, subscribed delivery lifecycle events, and audit logs.',
  })
  async getWebhookConfig(@CurrentMerchant() merchant: Merchant) {
    return this.webhooksService.getWebhookConfig(merchant.id);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update partner destination webhook URL',
  })
  async updateWebhook(
    @CurrentMerchant() merchant: Merchant,
    @Body() dto: UpdateWebhookDto,
  ) {
    return this.webhooksService.updateWebhook(merchant.id, dto);
  }

  @Post()
  @ApiOperation({
    summary: 'Update partner destination webhook URL (POST alias)',
  })
  async updateWebhookPost(
    @CurrentMerchant() merchant: Merchant,
    @Body() dto: UpdateWebhookDto,
  ) {
    return this.webhooksService.updateWebhook(merchant.id, dto);
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send test webhook event payload to destination URL',
    description: 'Fires an immediate test HTTP POST event to verify connectivity and records dispatch status.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook test executed.',
  })
  async testWebhook(
    @CurrentMerchant() merchant: Merchant,
    @Body() dto: TestWebhookDto,
  ) {
    return this.webhooksService.testWebhook(merchant.id, dto);
  }
}
