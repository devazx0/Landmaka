import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { MetricsService, type PilotSummaryReport } from './metrics.service.js';
import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { CurrentMerchant } from '../auth/current-merchant.decorator.js';
import type { Merchant } from '../generated/prisma/client.js';

@ApiTags('Metrics (Pilot Scorecard)')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('api/v1/metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('pilot')
  @ApiOperation({
    summary: 'Get Pilot Scorecard (Baseline vs. Live Pilot)',
    description:
      'Aggregates primary and secondary success metrics from PRD Section 8: % reduction in failed deliveries, decrease in rider phone calls per drop, transit time savings, and location maturity.',
  })
  @ApiResponse({
    status: 200,
    description: 'Pilot scorecard comparing pre-pilot baseline with Landmaka live operations.',
  })
  async getPilotSummary(
    @CurrentMerchant() merchant: Merchant,
  ): Promise<PilotSummaryReport> {
    return this.metricsService.getPilotSummary(merchant.id);
  }
}
