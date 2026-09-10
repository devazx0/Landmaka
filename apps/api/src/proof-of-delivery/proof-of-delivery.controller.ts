import {
  Controller,
  Get,
  Post,
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
import { ProofOfDeliveryService } from './proof-of-delivery.service.js';
import { CreateProofOfDeliveryDto } from './dto/create-proof-of-delivery.dto.js';
import { QueryProofOfDeliveryDto } from './dto/query-proof-of-delivery.dto.js';
import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { CurrentMerchant } from '../auth/current-merchant.decorator.js';
import type { Merchant } from '../generated/prisma/client.js';

@ApiTags('Proof of Delivery (POD Evidence)')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('api/v1/proof-of-delivery')
export class ProofOfDeliveryController {
  constructor(
    private readonly proofOfDeliveryService: ProofOfDeliveryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Log proof of delivery (FR7–FR9)',
    description:
      'Records geostamped entrance photo, device GPS geotag coordinates, courier phone calls, and recipient OTP verification. Generates a tamper-proof SHA-256 certificate hash and marks the delivery as DELIVERED.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Proof of delivery recorded and tamper-proof certificate generated.',
  })
  async create(
    @CurrentMerchant() merchant: Merchant,
    @Body() dto: CreateProofOfDeliveryDto,
  ) {
    return this.proofOfDeliveryService.create(merchant.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List proof of delivery records',
    description: 'Retrieves stored POD evidence with filtering by OTP verification, flags, and pagination.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of proof of delivery records.',
  })
  async findAll(
    @CurrentMerchant() merchant: Merchant,
    @Query() query: QueryProofOfDeliveryDto,
  ) {
    return this.proofOfDeliveryService.findAll(merchant.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get proof of delivery record by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Proof record CUID',
  })
  async findOne(
    @CurrentMerchant() merchant: Merchant,
    @Param('id') id: string,
  ) {
    return this.proofOfDeliveryService.findOne(merchant.id, id);
  }
}
