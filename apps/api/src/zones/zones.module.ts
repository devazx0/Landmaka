import { Module } from '@nestjs/common';
import { ZonesController } from './zones.controller.js';
import { ZonesService } from './zones.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ZonesController],
  providers: [ZonesService],
  exports: [ZonesService],
})
export class ZonesModule {}
