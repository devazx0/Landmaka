import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateZoneDto {
  @ApiProperty({
    description: 'Name of the pilot delivery zone',
    example: 'Lekki Phase 1 Pilot Zone',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'GeoJSON Polygon boundary coordinates string',
    example: '{"type":"Polygon","coordinates":[[[3.450,6.435],[3.495,6.435],[3.495,6.465],[3.450,6.465],[3.450,6.435]]]}',
  })
  @IsString()
  @IsNotEmpty()
  boundaryGeoJson!: string;

  @ApiPropertyOptional({
    description: 'Whether this zone is actively being used for the pilot',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
