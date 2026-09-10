import { ApiProperty } from '@nestjs/swagger';
import { IsLatitude, IsLongitude } from 'class-validator';

export class CheckCoordinateDto {
  @ApiProperty({
    description: 'Latitude coordinate to check against pilot zones',
    example: 6.4474,
  })
  @IsLatitude()
  latitude!: number;

  @ApiProperty({
    description: 'Longitude coordinate to check against pilot zones',
    example: 3.4842,
  })
  @IsLongitude()
  longitude!: number;
}
