import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ApiKeyGuard } from './api-key.guard.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'landmaka_jwt_secret_pilot_key_2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, ApiKeyGuard],
  exports: [AuthService, ApiKeyGuard, JwtModule],
})
export class AuthModule {}

