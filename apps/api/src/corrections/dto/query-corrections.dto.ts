import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryCorrectionsDto {
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
    description: 'Filter by status: PENDING_REVIEW, ACCEPTED, or REJECTED',
    enum: ['PENDING_REVIEW', 'ACCEPTED', 'REJECTED'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by type: GATE_CONFLICT, PIN_DRIFT_ALERT, or CONFIRMATION',
    enum: ['GATE_CONFLICT', 'PIN_DRIFT_ALERT', 'CONFIRMATION'],
  })
  @IsOptional()
  @IsString()
  type?: string;
}
