import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CorrectionsService } from './corrections.service.js';
import { CreateCorrectionDto } from './dto/create-correction.dto.js';
import { QueryCorrectionsDto } from './dto/query-corrections.dto.js';
import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { CurrentMerchant } from '../auth/current-merchant.decorator.js';
import type { Merchant } from '../generated/prisma/client.js';

@ApiTags('Corrections & Audit Loop')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('api/v1/corrections')
export class CorrectionsController {
  constructor(private readonly correctionsService: CorrectionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit post-delivery location correction or confirmation (FR10–FR12)',
    description:
      'Submitted by riders or dispatchers. If pin drift exceeds 200m or gate descriptions conflict, flags for ops audit (HTTP 202 FLAGGED). Safe confirmations increment accuracy score (HTTP 201).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Confirmation accepted cleanly.',
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Conflict or excessive drift flagged for review queue.',
  })
  async create(
    @CurrentMerchant() merchant: Merchant,
    @Body() dto: CreateCorrectionDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.correctionsService.create(merchant.id, dto);
    if (result.isFlagged) {
      res.status(HttpStatus.ACCEPTED);
    } else {
      res.status(HttpStatus.CREATED);
    }
    return result;
  }

  @Get()
  @ApiOperation({
    summary: 'List correction audit items',
    description: 'Filterable by review status (PENDING_REVIEW, ACCEPTED, REJECTED) and category.',
  })
  async findAll(
    @CurrentMerchant() merchant: Merchant,
    @Query() query: QueryCorrectionsDto,
  ) {
    return this.correctionsService.findAll(merchant.id, query);
  }

  @Patch(':id/accept')
  @ApiOperation({
    summary: 'Accept correction and graduate/promote location version (FR11)',
    description: 'Creates a new append-only LocationVersion (v2) with rider verified gate details.',
  })
  @ApiParam({ name: 'id', description: 'Correction CUID' })
  async accept(
    @CurrentMerchant() merchant: Merchant,
    @Param('id') id: string,
  ) {
    return this.correctionsService.accept(merchant.id, id);
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject correction',
  })
  @ApiParam({ name: 'id', description: 'Correction CUID' })
  async reject(
    @CurrentMerchant() merchant: Merchant,
    @Param('id') id: string,
  ) {
    return this.correctionsService.reject(merchant.id, id);
  }
}
