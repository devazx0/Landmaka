import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryProofOfDeliveryDto {
  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Filter type: ALL, OTP, or FLAGGED',
    enum: ['ALL', 'OTP', 'FLAGGED'],
  })
  @IsOptional()
  @IsString()
  filterType?: string;

  @ApiPropertyOptional({
    description: 'Search string across tracking reference, recipient, landmark, or rider',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
