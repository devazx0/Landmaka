import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class RoutePointDto {
  @ApiProperty({
    description: 'Latitude of the point',
    example: 6.5954,
  })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({
    description: 'Longitude of the point',
    example: 3.3431,
  })
  @IsLongitude()
  longitude!: number;

  @ApiPropertyOptional({
    description: 'Optional human-readable label or hub name',
    example: 'Ikeja Dispatch Hub',
  })
  @IsString()
  @IsOptional()
  label?: string;
}

export class RouteStopDto {
  @ApiProperty({
    description: 'Unique client identifier for this package/stop',
    example: 'pkg_001',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiPropertyOptional({
    description: 'Optional reference to a stored Landmaka location ID',
    example: 'cm123abc456',
  })
  @IsString()
  @IsOptional()
  locationId?: string;

  @ApiProperty({
    description: 'Latitude of delivery stop',
    example: 6.4474,
  })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({
    description: 'Longitude of delivery stop',
    example: 3.4842,
  })
  @IsLongitude()
  longitude!: number;

  @ApiPropertyOptional({
    description: 'Optional label or customer name for this stop',
    example: 'Emeka Okonkwo - Lekki Drop',
  })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({
    description: 'Delivery notes or landmark instructions for the rider',
    example: 'Opposite FCMB, black gate, Flat 4B',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class OptimizeRouteDto {
  @ApiProperty({
    description: 'Starting location (rider start position or warehouse/hub)',
    type: RoutePointDto,
  })
  @ValidateNested()
  @Type(() => RoutePointDto)
  origin!: RoutePointDto;

  @ApiProperty({
    description: 'Set of stops to be visited in optimal order (FR5, FR6)',
    type: [RouteStopDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  stops!: RouteStopDto[];

  @ApiPropertyOptional({
    description: 'Optional ending point if different from the last delivery stop',
    type: RoutePointDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RoutePointDto)
  destination?: RoutePointDto;

  @ApiPropertyOptional({
    description: 'Whether the rider must return to the origin after completing all deliveries',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  roundTrip?: boolean = false;
}
