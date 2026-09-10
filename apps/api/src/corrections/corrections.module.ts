import { Module } from '@nestjs/common';
import { CorrectionsController } from './corrections.controller.js';
import { CorrectionsService } from './corrections.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CorrectionsController],
  providers: [CorrectionsService],
  exports: [CorrectionsService],
})
export class CorrectionsModule {}
