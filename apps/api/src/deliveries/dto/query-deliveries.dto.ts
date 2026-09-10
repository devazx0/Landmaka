import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { DeliveryOutcomeStatusDto } from './record-delivery-outcome.dto.js';

export class QueryDeliveriesDto {
  @ApiPropertyOptional({
    description: 'Number of records to return (1-100)',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Pagination offset',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Filter by delivery status',
    enum: DeliveryOutcomeStatusDto,
  })
  @IsOptional()
  @IsEnum(DeliveryOutcomeStatusDto)
  status?: DeliveryOutcomeStatusDto;

  @ApiPropertyOptional({
    description: 'Filter for baseline deliveries (true) or pilot deliveries (false)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isBaseline?: boolean;

  @ApiPropertyOptional({
    description: 'Search by tracking reference or recipient name',
    example: 'ORD-98231',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
