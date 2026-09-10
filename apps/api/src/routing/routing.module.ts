import { Module } from '@nestjs/common';
import { RoutingController } from './routing.controller.js';
import { RoutingService } from './routing.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RoutingController],
  providers: [RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}
