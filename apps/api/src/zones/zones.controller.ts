import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { ZonesService, type ZoneCheckResult } from './zones.service.js';
import { CreateZoneDto } from './dto/create-zone.dto.js';
import { CheckCoordinateDto } from './dto/check-coordinate.dto.js';
import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { CurrentMerchant } from '../auth/current-merchant.decorator.js';
import type { Merchant } from '../generated/prisma/client.js';

@ApiTags('Zones (Pilot Scoping)')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('api/v1/zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Define a pilot delivery zone',
    description: 'Registers an active polygon boundary for the agreed pilot zone (e.g. Lekki Phase 1).',
  })
  async create(
    @CurrentMerchant() merchant: Merchant,
    @Body() dto: CreateZoneDto,
  ) {
    return this.zonesService.create(merchant.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List pilot zones for merchant',
  })
  async findAll(@CurrentMerchant() merchant: Merchant) {
    return this.zonesService.findAll(merchant.id);
  }

  @Post('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check if coordinate is inside pilot boundary',
    description:
      'Given lat/lng, verifies if the drop-off location falls within the active pilot coverage area.',
  })
  @ApiResponse({
    status: 200,
    description: 'Coverage result showing isCovered and matching zone names.',
  })
  async checkCoordinate(
    @CurrentMerchant() merchant: Merchant,
    @Body() dto: CheckCoordinateDto,
  ): Promise<ZoneCheckResult> {
    return this.zonesService.checkCoordinate(
      merchant.id,
      dto.latitude,
      dto.longitude,
    );
  }
}
