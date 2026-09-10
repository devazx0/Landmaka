import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateProofOfDeliveryDto {
  @ApiProperty({
    description: 'Unique delivery tracking code',
    example: 'KWK-LOS-9922',
  })
  @IsString()
  @IsNotEmpty()
  trackingReference: string;

  @ApiProperty({
    description: 'Name of the parcel recipient',
    example: 'Chinedu Okafor',
  })
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @ApiProperty({
    description: 'Verified landmark / drop-off destination',
    example: 'Opposite TotalEnergies, Admiralty Way, Lekki Phase 1',
  })
  @IsString()
  @IsNotEmpty()
  landmarkText: string;

  @ApiPropertyOptional({
    description: 'Physical gate description or compound access note',
    example: 'Black security gate with intercom buzzer',
  })
  @IsOptional()
  @IsString()
  gateDescription?: string;

  @ApiProperty({
    description: 'Drop-off GPS latitude coordinate',
    example: 6.4474,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Drop-off GPS longitude coordinate',
    example: 3.4731,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({
    description: 'Formatted GPS coordinate geotag string',
    example: '6.4474° N, 3.4731° E',
  })
  @IsOptional()
  @IsString()
  geotag?: string;

  @ApiPropertyOptional({
    description: 'Customer 4-digit drop-off verification OTP',
    example: '7712',
  })
  @IsOptional()
  @IsString()
  otpCode?: string;

  @ApiPropertyOptional({
    description: 'Number of phone calls courier attempted prior to drop-off',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  callAttempts?: number;

  @ApiPropertyOptional({
    description: 'URL of geostamped entrance or parcel photo',
    example: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
  })
  @IsOptional()
  @IsString()
  podPhotoUrl?: string;

  @ApiPropertyOptional({
    description: 'Courier / rider name',
    example: 'Emeka Nwosu',
  })
  @IsOptional()
  @IsString()
  riderName?: string;

  @ApiPropertyOptional({
    description: 'Courier delivery vehicle model',
    example: 'TVS Neo XR',
  })
  @IsOptional()
  @IsString()
  riderVehicle?: string;
}
