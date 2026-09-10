import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDeliveryDto {
  @ApiProperty({
    description: "Partner's external tracking or order reference",
    example: 'ORD-98231',
  })
  @IsString()
  @IsNotEmpty()
  trackingReference!: string;

  @ApiPropertyOptional({
    description: 'Optional ID of an existing Landmaka location record',
    example: 'cmtrr1knl00055kuxrck70mac',
  })
  @IsString()
  @IsOptional()
  locationId?: string;

  @ApiPropertyOptional({
    description: 'Recipient full name',
    example: 'Dare Olatunji',
  })
  @IsString()
  @IsOptional()
  recipientName?: string;

  @ApiPropertyOptional({
    description: 'Recipient phone number',
    example: '+2348011223344',
  })
  @IsString()
  @IsOptional()
  recipientPhone?: string;

  @ApiPropertyOptional({
    description: 'Whether this delivery is recorded as part of the pre-pilot baseline window',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isBaseline?: boolean = false;

  @ApiPropertyOptional({
    description: 'Special dispatch or package notes',
    example: 'Perishable item, deliver before 2pm',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
