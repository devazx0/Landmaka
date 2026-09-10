import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TestWebhookDto {
  @ApiPropertyOptional({
    description: 'Event type to simulate',
    example: 'delivery.delivered',
    default: 'delivery.delivered',
  })
  @IsOptional()
  @IsString()
  event?: string = 'delivery.delivered';

  @ApiPropertyOptional({
    description: 'Custom override endpoint URL for testing',
  })
  @IsOptional()
  @IsString()
  endpoint?: string;
}
