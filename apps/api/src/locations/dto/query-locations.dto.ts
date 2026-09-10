import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum LocationStatusFilter {
  UNVERIFIED = 'UNVERIFIED',
  TRUSTED = 'TRUSTED',
  FLAGGED = 'FLAGGED',
}

export class QueryLocationsDto {
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
    description: 'Filter by location status (UNVERIFIED, TRUSTED, FLAGGED)',
    enum: LocationStatusFilter,
  })
  @IsOptional()
  @IsEnum(LocationStatusFilter)
  status?: LocationStatusFilter;

  @ApiPropertyOptional({
    description: 'Fuzzy search query on landmark, gate, or contact',
    example: 'Admiralty',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
