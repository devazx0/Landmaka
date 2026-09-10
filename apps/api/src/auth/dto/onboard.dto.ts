import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsIn,
} from 'class-validator';

export class OnboardDto {
  @ApiProperty({
    description: 'Organization legal business name',
    example: 'Apex Logistics Ltd',
  })
  @IsString()
  @IsNotEmpty()
  orgName: string;

  @ApiProperty({
    description: 'Technical or operations lead name',
    example: 'Chinedu Okeke',
  })
  @IsString()
  @IsNotEmpty()
  leadName: string;

  @ApiProperty({
    description: 'Administrator work email',
    example: 'admin@apexlogistics.io',
  })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({
    description: 'Estimated monthly delivery tier',
    example: 'Pilot Tier - 1k to 10k',
  })
  @IsString()
  @IsNotEmpty()
  deliveryTier: string;

  @ApiProperty({
    description: 'Strong account password (minimum 8 characters)',
    example: 'K9#m$L29!vQz81@L',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Architecture profile',
    enum: ['logistics', 'ecommerce', 'quickcommerce'],
    example: 'logistics',
  })
  @IsIn(['logistics', 'ecommerce', 'quickcommerce'])
  profile: 'logistics' | 'ecommerce' | 'quickcommerce';

  @ApiProperty({
    description: 'Primary backend technology stack',
    example: 'Node.js / NestJS',
  })
  @IsString()
  @IsNotEmpty()
  techStack: string;

  @ApiProperty({
    description: 'Pilot delivery corridor',
    example: 'Lagos - Lekki Phase 1',
  })
  @IsString()
  @IsNotEmpty()
  corridor: string;

  @ApiPropertyOptional({
    description: 'Webhook dispatch endpoint URL',
    example: 'https://api.merchant.com/webhooks/landmaka',
  })
  @IsOptional()
  @IsString()
  webhookUrl?: string;
}
