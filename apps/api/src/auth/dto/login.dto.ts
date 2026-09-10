import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Account email address',
    example: 'admin@apexlogistics.io',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Account password',
    example: 'K9#m$L29!vQz81@L',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
