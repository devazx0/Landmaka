import { Module } from '@nestjs/common';
import { ProofOfDeliveryController } from './proof-of-delivery.controller.js';
import { ProofOfDeliveryService } from './proof-of-delivery.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProofOfDeliveryController],
  providers: [ProofOfDeliveryService],
  exports: [ProofOfDeliveryService],
})
export class ProofOfDeliveryModule {}
