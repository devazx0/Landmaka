import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
} from '@nestjs/swagger';
import { DeliveriesService } from './deliveries.service.js';
import { CreateDeliveryDto } from './dto/create-delivery.dto.js';
import { UpdateDeliveryDto } from './dto/update-delivery.dto.js';
import { RecordDeliveryOutcomeDto } from './dto/record-delivery-outcome.dto.js';
import { QueryDeliveriesDto } from './dto/query-deliveries.dto.js';
import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { CurrentMerchant } from '../auth/current-merchant.decorator.js';
import type { Merchant } from '../generated/prisma/client.js';

@ApiTags('Deliveries (Pilot Integration)')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('api/v1/deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a delivery job',
    description:
      'Creates a delivery record. Can be flagged as isBaseline: true to log pre-pilot performance, or linked to a locationId for live Landmaka routing.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Delivery registered.',
  })
  async create(
    @CurrentMerchant() merchant: Merchant,
    @Body() dto: CreateDeliveryDto,
  ) {
    return this.deliveriesService.create(merchant.id, dto);
  }

  @Patch(':id/outcome')
  @ApiOperation({
    summary: 'Record delivery outcome & rider call attempts',
    description:
      'Updates a delivery with its final outcome (DELIVERED, FAILED, RESCHEDULED), rider call attempts count, transit duration, and failure reason. Feeds the baseline vs. pilot comparison.',
  })
  @ApiParam({
    name: 'id',
    description: 'Delivery ID',
    example: 'cm123abc456',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery outcome recorded.',
  })
  async recordOutcome(
    @CurrentMerchant() merchant: Merchant,
    @Param('id') id: string,
    @Body() dto: RecordDeliveryOutcomeDto,
  ) {
    return this.deliveriesService.recordOutcome(merchant.id, id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List deliveries',
    description:
      'Retrieves deliveries for the merchant, filterable by baseline flag and status.',
  })
  async findAll(
    @CurrentMerchant() merchant: Merchant,
    @Query() query: QueryDeliveriesDto,
  ) {
    return this.deliveriesService.findAll(merchant.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single delivery',
  })
  async findOne(
    @CurrentMerchant() merchant: Merchant,
    @Param('id') id: string,
  ) {
    return this.deliveriesService.findOne(merchant.id, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update delivery status or dispatcher notes',
    description:
      'Allows updating delivery state (e.g. ASSIGNED, EN_ROUTE, DELIVERED, FAILED), recipient info, or dispatcher notes.',
  })
  @ApiParam({
    name: 'id',
    description: 'Delivery ID',
    example: 'cm123abc456',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delivery updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Delivery not found.',
  })
  async update(
    @CurrentMerchant() merchant: Merchant,
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryDto,
  ) {
    return this.deliveriesService.update(merchant.id, id, dto);
  }
}
