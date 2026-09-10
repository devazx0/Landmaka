import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DeliveryStatus } from '../../generated/prisma/client.js';

export class UpdateDeliveryDto {
  @ApiPropertyOptional({
    description: 'Current status in delivery lifecycle',
    enum: DeliveryStatus,
    example: DeliveryStatus.IN_TRANSIT,
  })
  @IsEnum(DeliveryStatus)
  @IsOptional()
  status?: DeliveryStatus;

  @ApiPropertyOptional({
    description: 'Updated recipient name',
    example: 'Chinedu Okafor',
  })
  @IsString()
  @IsOptional()
  recipientName?: string;

  @ApiPropertyOptional({
    description: 'Updated recipient contact phone number',
    example: '+2348020000000',
  })
  @IsString()
  @IsOptional()
  recipientPhone?: string;

  @ApiPropertyOptional({
    description: 'Total number of phone calls made to find the address',
    example: 1,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  callAttempts?: number;

  @ApiPropertyOptional({
    description: 'Transit duration in minutes',
    example: 25,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  transitDurationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Rider or dispatcher notes',
    example: 'Rider assigned and en route to pickup hub.',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
