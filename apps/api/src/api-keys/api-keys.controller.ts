import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
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
import { ApiKeysService } from './api-keys.service.js';
import { CreateApiKeyDto } from './dto/create-api-key.dto.js';
import { ApiKeyGuard } from '../auth/api-key.guard.js';
import { CurrentMerchant } from '../auth/current-merchant.decorator.js';
import type { Merchant } from '../generated/prisma/client.js';

@ApiTags('API Keys & Tokens')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('api/v1/api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  @ApiOperation({
    summary: 'List active partner API keys (FR13, FR15)',
    description: 'Returns active secret and client keys, rate limits, and creation dates.',
  })
  async findAll(@CurrentMerchant() merchant: Merchant) {
    return this.apiKeysService.findAll(merchant.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate a new partner API key',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Key generated.',
  })
  async create(
    @CurrentMerchant() merchant: Merchant,
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.apiKeysService.create(merchant.id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Revoke an API key by ID',
  })
  @ApiParam({ name: 'id', description: 'API Key CUID' })
  async revoke(
    @CurrentMerchant() merchant: Merchant,
    @Param('id') id: string,
  ) {
    return this.apiKeysService.revoke(merchant.id, id);
  }

  @Post(':id/revoke')
  @ApiOperation({
    summary: 'Revoke an API key alias',
  })
  @ApiParam({ name: 'id', description: 'API Key CUID' })
  async revokeAlias(
    @CurrentMerchant() merchant: Merchant,
    @Param('id') id: string,
  ) {
    return this.apiKeysService.revoke(merchant.id, id);
  }
}
