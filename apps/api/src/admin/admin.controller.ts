import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import { ApiKeyGuard } from '../auth/api-key.guard.js';
import {
  CreateBusinessDto,
  UpdateBusinessStatusDto,
  UpdateBusinessRatesDto,
  TopupWalletDto,
  AdminCreateApiKeyDto,
  UpdateApiKeyRateLimitDto,
  UpdatePricingConfigDto,
  CreateInvoiceDto,
  CreateAuditLogDto,
} from './dto/admin.dto.js';

@ApiTags('Admin Mission Control')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // 1. OVERVIEW & MISSION CONTROL
  // ==========================================
  @Get('overview')
  @ApiOperation({
    summary: 'Platform-wide overview statistics',
    description:
      'Aggregates active merchant count, deliveries dispatched today, total locations captured, open corrections, and pilot corridor map markers.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Overview platform metrics.',
  })
  async getOverview() {
    return this.adminService.getOverview();
  }

  // ==========================================
  // 2. BUSINESSES
  // ==========================================
  @Get('businesses')
  @ApiOperation({
    summary: 'List partner businesses',
    description:
      'Returns all registered partner logistics businesses with their tier, corridor, wallet balance, and usage counts.',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tier', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getBusinesses(
    @Query('search') search?: string,
    @Query('tier') tier?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getBusinesses({ search, tier, status });
  }

  @Post('businesses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new partner business',
    description:
      'Provisions a new merchant account with client and master secret keys, corridor assignment, and initial wallet balance.',
  })
  async createBusiness(@Body() dto: CreateBusinessDto) {
    return this.adminService.createBusiness(dto);
  }

  @Patch('businesses/:id/status')
  @ApiOperation({
    summary: 'Update business status (Suspend or Reactivate)',
    description: 'Toggles business state between ACTIVE and SUSPENDED with mandatory reason.',
  })
  @ApiParam({ name: 'id', description: 'Merchant CUID' })
  async updateBusinessStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBusinessStatusDto,
  ) {
    return this.adminService.updateBusinessStatus(id, dto.status, dto.reason);
  }

  @Patch('businesses/:id/rates')
  @ApiOperation({
    summary: 'Set custom pricing rates for partner merchant',
    description:
      'Overrides negotiated rates for location capture, route stops, and POD verification.',
  })
  @ApiParam({ name: 'id', description: 'Merchant CUID' })
  async updateBusinessRates(
    @Param('id') id: string,
    @Body() dto: UpdateBusinessRatesDto,
  ) {
    return this.adminService.updateBusinessRates(id, dto);
  }

  @Post('businesses/:id/wallet/topup')
  @ApiOperation({
    summary: 'Credit partner prepaid wallet balance',
    description: 'Adds funds to partner merchant prepaid wallet.',
  })
  @ApiParam({ name: 'id', description: 'Merchant CUID' })
  async topupWallet(
    @Param('id') id: string,
    @Body() dto: TopupWalletDto,
  ) {
    return this.adminService.topupWallet(id, dto);
  }

  // ==========================================
  // 3. API KEYS (CROSS-TENANT)
  // ==========================================
  @Get('api-keys')
  @ApiOperation({
    summary: 'List API keys across all tenants',
    description: 'Superadmin view of all active and revoked keys with masked formats and rate limits.',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'environment', required: false })
  async getApiKeys(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('environment') environment?: string,
  ) {
    return this.adminService.getApiKeys({ search, status, environment });
  }

  @Post('api-keys')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Issue an API key for any business',
    description: 'Generates a new production or staging API key for a specified partner merchant.',
  })
  async createApiKey(@Body() dto: AdminCreateApiKeyDto) {
    return this.adminService.createApiKey(dto);
  }

  @Post('api-keys/:id/rotate')
  @ApiOperation({
    summary: 'Rotate an API key',
    description: 'Revokes the existing key and immediately issues a newly generated key with matching metadata.',
  })
  @ApiParam({ name: 'id', description: 'API Key CUID' })
  async rotateApiKey(@Param('id') id: string) {
    return this.adminService.rotateApiKey(id);
  }

  @Patch('api-keys/:id/rate-limit')
  @ApiOperation({
    summary: 'Update throughput rate limit for an API key',
  })
  @ApiParam({ name: 'id', description: 'API Key CUID' })
  async updateApiKeyRateLimit(
    @Param('id') id: string,
    @Body() dto: UpdateApiKeyRateLimitDto,
  ) {
    return this.adminService.updateApiKeyRateLimit(id, dto.rateLimitPerMin);
  }

  @Patch('api-keys/:id/status')
  @ApiOperation({
    summary: 'Revoke or activate an API key',
  })
  @ApiParam({ name: 'id', description: 'API Key CUID' })
  async updateApiKeyStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'REVOKED' },
  ) {
    return this.adminService.updateApiKeyStatus(id, body.status);
  }

  // ==========================================
  // 4. CORRECTIONS QUEUE & FRAUD REVIEW
  // ==========================================
  @Get('corrections')
  @ApiOperation({
    summary: 'Global address correction & fraud review queue',
    description: 'Superadmin queue for arbitrating conflicting gate descriptions and pin drift >100m.',
  })
  @ApiQuery({ name: 'status', required: false })
  async getCorrections(@Query('status') status?: string) {
    return this.adminService.getCorrections({ status });
  }

  @Patch('corrections/:id/approve')
  @ApiOperation({
    summary: 'Superadmin approval of address correction',
    description: 'Updates destination coordinates, creates append-only version, promotes location to TRUSTED.',
  })
  @ApiParam({ name: 'id', description: 'Correction CUID' })
  async approveCorrection(@Param('id') id: string) {
    return this.adminService.approveCorrection(id);
  }

  @Patch('corrections/:id/reject')
  @ApiOperation({
    summary: 'Superadmin rejection of suspicious address correction',
    description: 'Discards correction and preserves original destination pin.',
  })
  @ApiParam({ name: 'id', description: 'Correction CUID' })
  async rejectCorrection(@Param('id') id: string) {
    return this.adminService.rejectCorrection(id);
  }

  // ==========================================
  // 5. FINANCES & BILLING ENGINE
  // ==========================================
  @Get('finances/pricing')
  @ApiOperation({
    summary: 'Get platform pricing configuration',
    description: 'Retrieves base rates for location captures, route stops, and monthly tier subscriptions.',
  })
  async getPricingConfig() {
    return this.adminService.getPricingConfig();
  }

  @Put('finances/pricing')
  @ApiOperation({
    summary: 'Update platform pricing configuration',
    description: 'Saves updated platform charging rates and billing thresholds.',
  })
  async updatePricingConfig(@Body() dto: UpdatePricingConfigDto) {
    return this.adminService.updatePricingConfig(dto);
  }

  @Get('finances/invoices')
  @ApiOperation({
    summary: 'List billing invoices',
    description: 'Retrieves all platform invoices filterable by status.',
  })
  @ApiQuery({ name: 'status', required: false })
  async getInvoices(@Query('status') status?: string) {
    return this.adminService.getInvoices({ status });
  }

  @Post('finances/invoices')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate an invoice for a partner business',
  })
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.adminService.createInvoice(dto);
  }

  @Patch('finances/invoices/:id/status')
  @ApiOperation({
    summary: 'Update invoice payment status (e.g. mark PAID)',
  })
  @ApiParam({ name: 'id', description: 'Invoice CUID' })
  async updateInvoiceStatus(
    @Param('id') id: string,
    @Body() body: { status: 'PAID' | 'PENDING' | 'OVERDUE' },
  ) {
    return this.adminService.updateInvoiceStatus(id, body.status);
  }

  // ==========================================
  // 6. SYSTEM TELEMETRY & AUDIT TRAIL
  // ==========================================
  @Get(['system', 'system/telemetry'])
  @ApiOperation({
    summary: 'Infrastructure telemetry & cluster health checks',
    description: 'Live latency check to PostGIS database, OSRM router, edge gateways, and Redis queues.',
  })
  async getSystemTelemetry() {
    return this.adminService.getSystemTelemetry();
  }

  @Get('system/audit-logs')
  @ApiOperation({
    summary: 'Superadmin action and security audit trail',
    description: 'Immutable historical logs of all administrative privileges and rate modifications.',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'level', required: false })
  async getAuditLogs(
    @Query('search') search?: string,
    @Query('level') level?: string,
  ) {
    return this.adminService.getAuditLogs({ search, level });
  }

  @Post('system/audit-logs')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Record administrative audit action',
  })
  async createAuditLog(@Body() dto: CreateAuditLogDto) {
    return this.adminService.createAuditLog(dto);
  }
}
