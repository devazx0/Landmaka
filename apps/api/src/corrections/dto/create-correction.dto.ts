import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class CreateCorrectionDto {
  @ApiProperty({
    description: 'Delivery tracking reference code',
    example: 'KWK-LOS-9924',
  })
  @IsString()
  @IsNotEmpty()
  deliveryRef: string;

  @ApiPropertyOptional({
    description: 'Target location ID if known',
    example: 'loc_lag_004',
  })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiProperty({
    description: 'Landmark / area text',
    example: 'Ikeja GRA (Behind Zenith Bank, Isaac John St)',
  })
  @IsString()
  @IsNotEmpty()
  landmarkText: string;

  @ApiPropertyOptional({
    description: 'Original recorded gate description',
    example: 'Black gate with spike fence',
  })
  @IsOptional()
  @IsString()
  originalGate?: string;

  @ApiProperty({
    description: 'Rider reported gate description or correction note',
    example: 'Blue gate. Small tailor shop right beside gate entrance',
  })
  @IsString()
  @IsNotEmpty()
  reportedGate: string;

  @ApiPropertyOptional({
    description: 'Meters of pin drift between recorded and actual gate',
    example: 45,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pinDriftMeters?: number;

  @ApiProperty({
    description: 'Rider or reporting courier name',
    example: 'Sunday Oladipo',
  })
  @IsString()
  @IsNotEmpty()
  riderName: string;

  @ApiPropertyOptional({
    description: 'Rider confidence score percentage (0-100)',
    example: 85,
    default: 80,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  riderConfidence?: number;

  @ApiPropertyOptional({
    description: 'Correction type (GATE_CONFLICT, PIN_DRIFT_ALERT, CONFIRMATION)',
    enum: ['GATE_CONFLICT', 'PIN_DRIFT_ALERT', 'CONFIRMATION'],
  })
  @IsOptional()
  @IsString()
  type?: 'GATE_CONFLICT' | 'PIN_DRIFT_ALERT' | 'CONFIRMATION';
}
