import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum DeliveryOutcomeStatusDto {
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RESCHEDULED = 'RESCHEDULED',
}

export enum DeliveryFailureReasonDto {
  COULD_NOT_LOCATE_ADDRESS = 'COULD_NOT_LOCATE_ADDRESS',
  CUSTOMER_UNREACHABLE = 'CUSTOMER_UNREACHABLE',
  CUSTOMER_UNAVAILABLE = 'CUSTOMER_UNAVAILABLE',
  RESTRICTED_ACCESS_GATE = 'RESTRICTED_ACCESS_GATE',
  OTHER = 'OTHER',
}

export class RecordDeliveryOutcomeDto {
  @ApiProperty({
    description: 'Final status of the delivery attempt',
    enum: DeliveryOutcomeStatusDto,
    example: DeliveryOutcomeStatusDto.DELIVERED,
  })
  @IsEnum(DeliveryOutcomeStatusDto)
  @IsNotEmpty()
  status!: DeliveryOutcomeStatusDto;

  @ApiProperty({
    description: 'Total number of phone calls the rider made to customer to find address',
    example: 0,
  })
  @IsInt()
  @Min(0)
  callAttempts!: number;

  @ApiPropertyOptional({
    description: 'Reason if the delivery attempt failed',
    enum: DeliveryFailureReasonDto,
    example: DeliveryFailureReasonDto.COULD_NOT_LOCATE_ADDRESS,
  })
  @IsEnum(DeliveryFailureReasonDto)
  @IsOptional()
  failureReason?: DeliveryFailureReasonDto;

  @ApiPropertyOptional({
    description: 'Total transit duration in minutes from dispatch to drop-off',
    example: 22,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  transitDurationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Field notes or rider feedback on the delivery experience',
    example: 'Gate description made unit easy to find without calls.',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
