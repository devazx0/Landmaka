import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export enum LocationCreatorDto {
  CUSTOMER = 'CUSTOMER',
  RIDER = 'RIDER',
  SYSTEM = 'SYSTEM',
}

export class CreateLocationDto {
  @ApiProperty({
    description: 'Latitude coordinate of the location/compound',
    example: 6.4474,
  })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({
    description: 'Longitude coordinate of the location/compound',
    example: 3.4842,
  })
  @IsLongitude()
  longitude!: number;

  @ApiProperty({
    description:
      'Freeform prominent landmark description near the destination (FR1)',
    example: 'Directly opposite FCMB Bank, off Admiralty Way, Lekki Phase 1',
  })
  @IsString()
  @IsNotEmpty()
  landmarkText!: string;

  @ApiPropertyOptional({
    description:
      'Structured physical entrance / gate description (e.g. gate color, security booth)',
    example: 'Black electric sliding gate with spikes, intercom on pillar',
  })
  @IsString()
  @IsOptional()
  gateDescription?: string;

  @ApiPropertyOptional({
    description:
      'Structured path/directions from entrance to unit/door (FR1)',
    example: 'Driveway on left, walk past car park to rear white duplex, Flat 4B',
  })
  @IsString()
  @IsOptional()
  unitPath?: string;

  @ApiPropertyOptional({
    description:
      'URL of entrance/gate photo for visual identification (removes ambiguity)',
    example:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  })
  @IsUrl()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'Name of the recipient or point of contact at the location',
    example: 'Emeka Okonkwo',
  })
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number for delivery updates or emergency clarification',
    example: '+2348033334444',
  })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({
    enum: LocationCreatorDto,
    description: 'Who created/captured this location record',
    default: LocationCreatorDto.CUSTOMER,
  })
  @IsEnum(LocationCreatorDto)
  @IsOptional()
  createdBy?: LocationCreatorDto = LocationCreatorDto.CUSTOMER;
}
