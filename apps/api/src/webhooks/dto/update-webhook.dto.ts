import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class UpdateWebhookDto {
  @ApiProperty({
    description: 'Partner destination HTTPS webhook URL',
    example: 'https://api.kwik.delivery/webhooks/landmaka',
  })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  webhookUrl: string;
}
