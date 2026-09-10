import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({
    description: 'Human-readable key description',
    example: 'Pilot Mobile App Key',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Key type (SECRET or PUBLIC)',
    enum: ['SECRET', 'PUBLIC'],
    default: 'SECRET',
  })
  @IsOptional()
  @IsString()
  type?: 'SECRET' | 'PUBLIC';

  @ApiPropertyOptional({
    description: 'Max allowed requests per minute (FR15)',
    example: 1000,
    default: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  rateLimitPerMin?: number;
}
