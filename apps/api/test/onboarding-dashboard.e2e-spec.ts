import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('Onboarding & Dashboard Endpoints (e2e)', () => {
  let app: INestApplication;
  let testMerchantKey: string;
  let testMerchantId: string;
  let testLocationId: string;
  let testDeliveryId: string;
  let testAuthCookie: string;
  const uniqueOrg = `Test Org ${Date.now()}`;
  const testEmail = `admin_${Date.now()}@testorg.io`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/auth/ping - Live latency and handshake check', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/ping')
      .expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.cluster).toBe('af-south-1');
    expect(res.body.timestamp).toBeDefined();
  });

  it('POST /api/v1/auth/onboard - Complete onboarding & sign up', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/onboard')
      .send({
        orgName: uniqueOrg,
        leadName: 'Chinedu Test',
        adminEmail: testEmail,
        deliveryTier: 'Pilot Tier - 1k to 10k',
        password: 'Password123#Secure',
        profile: 'logistics',
        techStack: 'Node.js / NestJS',
        corridor: 'Lagos - Lekki Phase 1',
        webhookUrl: 'https://api.testorg.io/webhooks',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.merchant.slug).toBeDefined();
    expect(res.body.credentials.secretKey).toMatch(/^sk_live_/);
    expect(res.body.credentials.clientKey).toMatch(/^pk_live_/);
    expect(res.body.zone.name).toContain('Lekki Phase 1');
    expect(res.body.token).toBeDefined();

    testMerchantKey = res.body.credentials.secretKey;
    testMerchantId = res.body.merchant.id;

    // Verify Set-Cookie header contains access_token
    const cookies = res.headers['set-cookie'] as unknown as string[] | undefined;
    expect(cookies).toBeDefined();
    const authCookie = cookies?.find((c) => c.includes('access_token='));
    expect(authCookie).toBeDefined();
    testAuthCookie = authCookie || '';
  });

  it('POST /api/v1/auth/login - Authenticate with email and password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'Password123#Secure',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.token).toBeDefined();
  });

  it('GET /api/v1/auth/me - Access profile via cookie session', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', testAuthCookie)
      .expect(200);

    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.merchant.name).toBe(uniqueOrg);
  });

  it('POST /api/v1/locations/capture - Location capture alias endpoint', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/locations/capture')
      .set('x-api-key', testMerchantKey)
      .send({
        latitude: 6.4474,
        longitude: 3.4731,
        landmarkText: 'Opposite TotalEnergies, Lekki Phase 1',
        gateDescription: 'Black sliding gate with intercom',
        contactName: 'Chinedu Okafor',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.version).toBe(1);
    testLocationId = res.body.id;
  });

  it('POST /api/v1/proof-of-delivery - Record proof of delivery evidence', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/proof-of-delivery')
      .set('x-api-key', testMerchantKey)
      .send({
        trackingReference: 'KWK-LOS-9922',
        recipientName: 'Chinedu Okafor',
        landmarkText: 'Opposite TotalEnergies, Lekki Phase 1',
        gateDescription: 'Black security gate with intercom',
        latitude: 6.4474,
        longitude: 3.4731,
        otpCode: '7712',
        podPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
        riderName: 'Emeka Nwosu',
        riderVehicle: 'TVS Neo XR',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.proof.otpVerified).toBe(true);
    expect(res.body.certificate.verificationHash).toMatch(/^SHA256:/);
  });

  it('GET /api/v1/proof-of-delivery - Retrieve proof records', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/proof-of-delivery')
      .set('x-api-key', testMerchantKey)
      .expect(200);

    expect(res.body.items).toBeDefined();
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/corrections - Location conflict audit', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/corrections')
      .set('x-api-key', testMerchantKey)
      .send({
        deliveryRef: 'KWK-LOS-9924',
        landmarkText: 'Ikeja GRA Behind Zenith Bank',
        originalGate: 'Black gate with spikes',
        reportedGate: 'Blue gate with tailor shop',
        pinDriftMeters: 45,
        riderName: 'Sunday Oladipo',
      })
      .expect(202); // 202 FLAGGED for conflict review

    expect(res.body.isFlagged).toBe(true);
    expect(res.body.correction.type).toBe('GATE_CONFLICT');
  });

  it('GET /api/v1/corrections - List audit items', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/corrections')
      .set('x-api-key', testMerchantKey)
      .expect(200);

    expect(res.body.items).toBeDefined();
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('GET and POST /api/v1/api-keys - Manage partner keys', async () => {
    // List keys
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/api-keys')
      .set('x-api-key', testMerchantKey)
      .expect(200);

    expect(listRes.body.items.length).toBeGreaterThanOrEqual(2); // Master secret + Client public

    // Create a new key
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/api-keys')
      .set('x-api-key', testMerchantKey)
      .send({
        name: 'Staging Fleet Key',
        type: 'SECRET',
        rateLimitPerMin: 1500,
      })
      .expect(201);

    expect(createRes.body.key.key).toMatch(/^sk_live_/);
  });

  it('GET and POST /api/v1/webhooks - Webhook config and test event dispatch', async () => {
    // Config
    const configRes = await request(app.getHttpServer())
      .get('/api/v1/webhooks')
      .set('x-api-key', testMerchantKey)
      .expect(200);

    expect(configRes.body.subscribedEvents).toContain('delivery.delivered');

    // Test Event
    const testRes = await request(app.getHttpServer())
      .post('/api/v1/webhooks/test')
      .set('x-api-key', testMerchantKey)
      .send({
        event: 'delivery.delivered',
      })
      .expect(200);

    expect(testRes.body.success).toBe(true);
    expect(testRes.body.log.statusCode).toBeDefined();
  });

  it('PATCH /api/v1/locations/:id - Edit pin and bump version history', async () => {
    const patchRes = await request(app.getHttpServer())
      .patch(`/api/v1/locations/${testLocationId}`)
      .set('x-api-key', testMerchantKey)
      .send({
        gateDescription: 'Upgraded to blue motorized gate with security camera',
        status: 'TRUSTED',
        confidenceScore: 0.95,
        changeSummary: 'Rider confirmed automated gate installed',
      })
      .expect(200);

    expect(patchRes.body.version).toBe(2);
    expect(patchRes.body.gateDescription).toContain('blue motorized gate');
    expect(patchRes.body.status).toBe('TRUSTED');
    expect(patchRes.body.versions.length).toBeGreaterThanOrEqual(2);
  });

  it('POST and PATCH /api/v1/deliveries - Create and update delivery dispatch status and notes', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/deliveries')
      .set('x-api-key', testMerchantKey)
      .send({
        trackingReference: `KWK-E2E-${Date.now()}`,
        recipientName: 'Chinedu Test Recipient',
        locationId: testLocationId,
        notes: 'Initial dispatch creation',
      })
      .expect(201);

    testDeliveryId = createRes.body.id;
    expect(testDeliveryId).toBeDefined();

    const patchRes = await request(app.getHttpServer())
      .patch(`/api/v1/deliveries/${testDeliveryId}`)
      .set('x-api-key', testMerchantKey)
      .send({
        status: 'IN_TRANSIT',
        notes: 'Rider assigned and en route with package',
      })
      .expect(200);

    expect(patchRes.body.status).toBe('IN_TRANSIT');
    expect(patchRes.body.dispatchedAt).toBeDefined();
    expect(patchRes.body.notes).toContain('en route');
  });

  it('GET /api/v1/admin/overview and /api/v1/admin/system - Admin Mission Control telemetry', async () => {
    const overviewRes = await request(app.getHttpServer())
      .get('/api/v1/admin/overview')
      .set('x-api-key', testMerchantKey)
      .expect(200);

    expect(overviewRes.body.metrics.totalBusinesses).toBeGreaterThanOrEqual(1);
    expect(overviewRes.body.systemTelemetry.status).toBe('ALL_SYSTEMS_OPERATIONAL');

    const systemRes = await request(app.getHttpServer())
      .get('/api/v1/admin/system')
      .set('x-api-key', testMerchantKey)
      .expect(200);

    expect(systemRes.body.database.status).toBe('UP');
    expect(systemRes.body.database.latencyMs).toBeDefined();
    expect(systemRes.body.osrmRouter.status).toBe('UP');
  });

  it('GET and PATCH /api/v1/admin/businesses - Manage partner business status and rates', async () => {
    const bizRes = await request(app.getHttpServer())
      .get('/api/v1/admin/businesses')
      .set('x-api-key', testMerchantKey)
      .expect(200);

    expect(Array.isArray(bizRes.body)).toBe(true);
    const merchant = bizRes.body.find((b: any) => b.id === testMerchantId);
    expect(merchant).toBeDefined();
    expect(merchant.locationsCount).toBeGreaterThanOrEqual(1);

    // Toggle status to SUSPENDED
    const suspendRes = await request(app.getHttpServer())
      .patch(`/api/v1/admin/businesses/${testMerchantId}/status`)
      .set('x-api-key', testMerchantKey)
      .send({
        status: 'SUSPENDED',
        reason: 'Periodic audit check',
      })
      .expect(200);

    expect(suspendRes.body.status).toBe('SUSPENDED');

    // Reactivate to ACTIVE
    const reactivateRes = await request(app.getHttpServer())
      .patch(`/api/v1/admin/businesses/${testMerchantId}/status`)
      .set('x-api-key', testMerchantKey)
      .send({
        status: 'ACTIVE',
      })
      .expect(200);

    expect(reactivateRes.body.status).toBe('ACTIVE');

    // Custom rates
    const ratesRes = await request(app.getHttpServer())
      .patch(`/api/v1/admin/businesses/${testMerchantId}/rates`)
      .set('x-api-key', testMerchantKey)
      .send({
        customCaptureRateNgn: 45,
        customRoutingRateNgn: 18,
        customPodRateNgn: 25,
      })
      .expect(200);

    expect(ratesRes.body.customRates.customCaptureRateNgn).toBe(45);
  });

  it('POST /api/v1/admin/businesses and wallet topup', async () => {
    const newBizRes = await request(app.getHttpServer())
      .post('/api/v1/admin/businesses')
      .set('x-api-key', testMerchantKey)
      .send({
        name: `Enterprise Freight ${Date.now()}`,
        category: '3PL Logistics',
        contactPerson: 'Babatunde Fashola',
        email: `dispatch_${Date.now()}@freight.ng`,
        tier: 'Enterprise',
        corridor: 'Lagos - Surulere',
      })
      .expect(201);

    expect(newBizRes.body.id).toBeDefined();
    expect(newBizRes.body.clientKey).toMatch(/^pk_live_/);
    expect(newBizRes.body.secretKey).toMatch(/^sk_live_/);

    // Top up wallet
    const topupRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/businesses/${newBizRes.body.id}/wallet/topup`)
      .set('x-api-key', testMerchantKey)
      .send({
        amountNgn: 750000,
        notes: 'Prepaid logistics deposit verified by bank alert',
      })
      .expect(201);

    expect(topupRes.body.walletBalanceNgn).toBeGreaterThanOrEqual(750000);
  });

  it('Admin API Keys - Cross-tenant list, generate, rotate, and rate limit update', async () => {
    // List across all tenants
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/admin/api-keys')
      .set('x-api-key', testMerchantKey)
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);

    // Create new key for test merchant
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/admin/api-keys')
      .set('x-api-key', testMerchantKey)
      .send({
        businessId: testMerchantId,
        label: 'Courier Android App Key',
        environment: 'production',
        rateLimitPerMin: 2000,
      })
      .expect(201);

    expect(createRes.body.key).toMatch(/^sk_live_/);
    const keyId = createRes.body.id;

    // Rotate key
    const rotateRes = await request(app.getHttpServer())
      .post(`/api/v1/admin/api-keys/${keyId}/rotate`)
      .set('x-api-key', testMerchantKey)
      .expect(201);

    expect(rotateRes.body.newKey).toMatch(/^sk_live_/);
    expect(rotateRes.body.oldKeyId).toBe(keyId);

    // Update rate limit
    const rateRes = await request(app.getHttpServer())
      .patch(`/api/v1/admin/api-keys/${rotateRes.body.newKeyId}/rate-limit`)
      .set('x-api-key', testMerchantKey)
      .send({ rateLimitPerMin: 3500 })
      .expect(200);

    expect(rateRes.body.rateLimitPerMin).toBe(3500);
  });

  it('Admin Corrections - Global review queue and superadmin approval', async () => {
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/admin/corrections')
      .set('x-api-key', testMerchantKey)
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);
    if (listRes.body.length > 0) {
      const correctionId = listRes.body[0].id;
      const approveRes = await request(app.getHttpServer())
        .patch(`/api/v1/admin/corrections/${correctionId}/approve`)
        .set('x-api-key', testMerchantKey)
        .expect(200);

      expect(approveRes.body.status).toBe('APPROVED');
    }
  });

  it('Admin Finances - Platform pricing config and invoice billing', async () => {
    // Get pricing
    const pricingRes = await request(app.getHttpServer())
      .get('/api/v1/admin/finances/pricing')
      .set('x-api-key', testMerchantKey)
      .expect(200);

    expect(pricingRes.body.baseLocationCaptureNgn).toBeDefined();

    // Update pricing
    const updatePricingRes = await request(app.getHttpServer())
      .put('/api/v1/admin/finances/pricing')
      .set('x-api-key', testMerchantKey)
      .send({
        baseLocationCaptureNgn: 28.0,
        baseRouteOptimizationStopNgn: 42.0,
        basePodVerificationNgn: 18.0,
      })
      .expect(200);

    expect(updatePricingRes.body.baseLocationCaptureNgn).toBe(28.0);

    // Generate Invoice
    const invoiceRes = await request(app.getHttpServer())
      .post('/api/v1/admin/finances/invoices')
      .set('x-api-key', testMerchantKey)
      .send({
        businessId: testMerchantId,
        amountNgn: 245000,
        period: 'Aug 01 - Aug 31, 2026',
        paymentGateway: 'Paystack',
        itemBreakdown: {
          locationCaptures: 1400,
          routeStops: 3600,
          podVerifications: 1350,
        },
      })
      .expect(201);

    expect(invoiceRes.body.invoiceNumber).toMatch(/^INV-2026-/);
    const invoiceId = invoiceRes.body.id;

    // List invoices
    const listInvoicesRes = await request(app.getHttpServer())
      .get('/api/v1/admin/finances/invoices')
      .set('x-api-key', testMerchantKey)
      .expect(200);

    expect(Array.isArray(listInvoicesRes.body)).toBe(true);

    // Mark invoice PAID
    const payRes = await request(app.getHttpServer())
      .patch(`/api/v1/admin/finances/invoices/${invoiceId}/status`)
      .set('x-api-key', testMerchantKey)
      .send({ status: 'PAID' })
      .expect(200);

    expect(payRes.body.status).toBe('PAID');
    expect(payRes.body.paidAt).toBeDefined();
  });

  it('Admin System - Audit logs creation and query', async () => {
    // Record administrative action
    const logRes = await request(app.getHttpServer())
      .post('/api/v1/admin/system/audit-logs')
      .set('x-api-key', testMerchantKey)
      .send({
        adminUser: 'Superadmin Lead',
        action: 'RATE_LIMIT_INCREASED',
        targetEntity: 'Kwik Logistics',
        details: 'Increased throughput for seasonal Lagos surge',
        level: 'INFO',
      })
      .expect(201);

    expect(logRes.body.id).toBeDefined();

    // Query audit logs
    const listLogsRes = await request(app.getHttpServer())
      .get('/api/v1/admin/system/audit-logs?level=INFO')
      .set('x-api-key', testMerchantKey)
      .expect(200);

    expect(Array.isArray(listLogsRes.body)).toBe(true);
    expect(listLogsRes.body.length).toBeGreaterThanOrEqual(1);
  });
});
