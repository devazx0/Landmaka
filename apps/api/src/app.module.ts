import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { LocationsModule } from './locations/locations.module.js';
import { RoutingModule } from './routing/routing.module.js';
import { DeliveriesModule } from './deliveries/deliveries.module.js';
import { MetricsModule } from './metrics/metrics.module.js';
import { ZonesModule } from './zones/zones.module.js';
import { ProofOfDeliveryModule } from './proof-of-delivery/proof-of-delivery.module.js';
import { CorrectionsModule } from './corrections/corrections.module.js';
import { ApiKeysModule } from './api-keys/api-keys.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';
import { AdminModule } from './admin/admin.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    LocationsModule,
    RoutingModule,
    DeliveriesModule,
    MetricsModule,
    ZonesModule,
    ProofOfDeliveryModule,
    CorrectionsModule,
    ApiKeysModule,
    WebhooksModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
