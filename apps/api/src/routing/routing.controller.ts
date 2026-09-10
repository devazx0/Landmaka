import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { RoutingService, type RouteOptimizationResult } from './routing.service.js';
import { OptimizeRouteDto } from './dto/optimize-route.dto.js';
import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { CurrentMerchant } from '../auth/current-merchant.decorator.js';
import type { Merchant } from '../generated/prisma/client.js';

@ApiTags('Routing')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller(['api/v1/routes', 'api/v1/routing'])
export class RoutingController {
  constructor(private readonly routingService: RoutingService) {}

  @Post('optimize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Optimize single-rider delivery route (FR5, FR6)',
    description:
      'Given an origin hub/rider location and an array of delivery stops, computes the optimal sequence of stops minimizing transit distance and time using OSRM with road-network graphs (or high-accuracy 2-opt TSP heuristic fallback).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Optimal route sequence, leg distances, ETAs, and GeoJSON geometry.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid API key.',
  })
  async optimizeRoute(
    @CurrentMerchant() merchant: Merchant,
    @Body() dto: OptimizeRouteDto,
  ): Promise<RouteOptimizationResult> {
    return this.routingService.optimizeRoute(merchant.id, dto);
  }
}
