import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Kwik Delivery Nigeria' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: '3PL Logistics' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'Adewale Adeleke' })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'ops@kwik.delivery' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+234 803 123 4567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Growth' })
  @IsString()
  @IsOptional()
  tier?: string;

  @ApiPropertyOptional({ example: 'Lagos - Surulere Hub' })
  @IsString()
  @IsOptional()
  corridor?: string;
}

export class UpdateBusinessStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'SUSPENDED'] })
  @IsEnum(['ACTIVE', 'SUSPENDED'])
  status!: 'ACTIVE' | 'SUSPENDED';

  @ApiPropertyOptional({ example: 'Administrative review' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateBusinessRatesDto {
  @ApiPropertyOptional({ example: 20.0 })
  @IsNumber()
  @IsOptional()
  customCaptureRateNgn?: number;

  @ApiPropertyOptional({ example: 32.0 })
  @IsNumber()
  @IsOptional()
  customRoutingRateNgn?: number;

  @ApiPropertyOptional({ example: 12.0 })
  @IsNumber()
  @IsOptional()
  customPodRateNgn?: number;
}

export class TopupWalletDto {
  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(1)
  amountNgn!: number;

  @ApiPropertyOptional({ example: 'Prepaid bank transfer credited by finance' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class AdminCreateApiKeyDto {
  @ApiProperty({ description: 'Merchant / Business CUID' })
  @IsString()
  @IsNotEmpty()
  businessId!: string;

  @ApiProperty({ example: 'Fleet Dispatch Key' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiPropertyOptional({ enum: ['production', 'staging', 'sandbox'], default: 'production' })
  @IsEnum(['production', 'staging', 'sandbox'])
  @IsOptional()
  environment?: 'production' | 'staging' | 'sandbox' = 'production';

  @ApiPropertyOptional({ example: 1000, default: 1000 })
  @IsInt()
  @Min(1)
  @IsOptional()
  rateLimitPerMin?: number = 1000;
}

export class UpdateApiKeyRateLimitDto {
  @ApiProperty({ example: 2500 })
  @IsInt()
  @Min(1)
  rateLimitPerMin!: number;
}

export class UpdatePricingConfigDto {
  @ApiPropertyOptional({ example: 25.0 })
  @IsNumber()
  @IsOptional()
  baseLocationCaptureNgn?: number;

  @ApiPropertyOptional({ example: 40.0 })
  @IsNumber()
  @IsOptional()
  baseRouteOptimizationStopNgn?: number;

  @ApiPropertyOptional({ example: 15.0 })
  @IsNumber()
  @IsOptional()
  basePodVerificationNgn?: number;

  @ApiPropertyOptional({ example: 35000 })
  @IsNumber()
  @IsOptional()
  starterMonthlyFeeNgn?: number;

  @ApiPropertyOptional({ example: 95000 })
  @IsNumber()
  @IsOptional()
  growthMonthlyFeeNgn?: number;

  @ApiPropertyOptional({ example: 280000 })
  @IsNumber()
  @IsOptional()
  enterpriseMonthlyFeeNgn?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  @IsOptional()
  bulkDiscountPercentOver10k?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsNumber()
  @IsOptional()
  bulkDiscountPercentOver50k?: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Merchant / Business CUID' })
  @IsString()
  @IsNotEmpty()
  businessId!: string;

  @ApiProperty({ example: 185000 })
  @IsNumber()
  @Min(0)
  amountNgn!: number;

  @ApiProperty({ example: 'Aug 01 - Aug 31, 2026' })
  @IsString()
  @IsNotEmpty()
  period!: string;

  @ApiPropertyOptional({ example: 'Paystack' })
  @IsString()
  @IsOptional()
  paymentGateway?: string = 'Paystack';

  @ApiPropertyOptional({
    example: { locationCaptures: 1200, routeStops: 3200, podVerifications: 1150 },
  })
  @IsOptional()
  itemBreakdown?: {
    locationCaptures: number;
    routeStops: number;
    podVerifications: number;
  };
}

export class CreateAuditLogDto {
  @ApiProperty({ example: 'Azeem Sanusi' })
  @IsString()
  @IsNotEmpty()
  adminUser!: string;

  @ApiProperty({ example: 'RATE_LIMIT_INCREASED' })
  @IsString()
  @IsNotEmpty()
  action!: string;

  @ApiProperty({ example: 'Kwik Delivery Nigeria' })
  @IsString()
  @IsNotEmpty()
  targetEntity!: string;

  @ApiProperty({ example: 'Increased throughput limit from 1000 to 2500 req/min' })
  @IsString()
  @IsNotEmpty()
  details!: string;

  @ApiPropertyOptional({ enum: ['INFO', 'WARN', 'CRITICAL'], default: 'INFO' })
  @IsEnum(['INFO', 'WARN', 'CRITICAL'])
  @IsOptional()
  level?: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO';
}
