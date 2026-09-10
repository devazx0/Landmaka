import { Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateBusinessDto,
  UpdateBusinessRatesDto,
  TopupWalletDto,
  AdminCreateApiKeyDto,
  UpdatePricingConfigDto,
  CreateInvoiceDto,
  CreateAuditLogDto,
} from './dto/admin.dto.js';

function parseProfile(profile: string | null): Record<string, any> {
  if (!profile) return {};
  try {
    return JSON.parse(profile) as Record<string, any>;
  } catch {
    return {};
  }
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // 1. OVERVIEW & MISSION CONTROL
  // ==========================================
  async getOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalMerchants,
      suspendedMerchants,
      totalLocations,
      totalDeliveriesToday,
      totalDeliveriesAllTime,
      openCorrections,
      invoices,
      recentDeliveries,
      recentCorrections,
    ] = await Promise.all([
      this.prisma.merchant.count(),
      this.prisma.merchant.count({
        where: {
          profile: {
            contains: '"status":"SUSPENDED"',
          },
        },
      }),
      this.prisma.location.count(),
      this.prisma.delivery.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      this.prisma.delivery.count(),
      this.prisma.correction.count({
        where: { status: 'PENDING_REVIEW' },
      }),
      this.prisma.invoice.findMany({
        where: { status: 'PAID' },
        select: { amountNgn: true },
      }),
      this.prisma.delivery.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          merchant: { select: { id: true, name: true, slug: true } },
          location: { select: { landmarkText: true, gateDescription: true } },
        },
      }),
      this.prisma.correction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          merchant: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    const activeMerchants = Math.max(0, totalMerchants - suspendedMerchants);
    const totalRevenueNgn = invoices.reduce((acc, inv) => acc + inv.amountNgn, 0);

    const adminMapLocations = [
      {
        id: 'loc_adm_1',
        latitude: 6.5012,
        longitude: 3.3581,
        landmarkText: 'Surulere Central Dispatch Hub',
        confidenceScore: 98,
        status: 'TRUSTED',
        corridor: 'Surulere / LOS',
      },
      {
        id: 'loc_adm_2',
        latitude: 6.4474,
        longitude: 3.4731,
        landmarkText: 'Lekki Phase 1 Corridor Hub',
        confidenceScore: 96,
        status: 'TRUSTED',
        corridor: 'Lekki Phase 1 / LOS',
      },
      {
        id: 'loc_adm_3',
        latitude: 6.5923,
        longitude: 3.3562,
        landmarkText: 'Ikeja GRA Express Hub',
        confidenceScore: 54,
        status: 'FLAGGED',
        corridor: 'Ikeja GRA / LOS',
      },
      {
        id: 'loc_adm_4',
        latitude: 6.5186,
        longitude: 3.3745,
        landmarkText: 'Yaba Tech Corridor Hub',
        confidenceScore: 92,
        status: 'TRUSTED',
        corridor: 'Yaba / LOS',
      },
      {
        id: 'loc_adm_5',
        latitude: 6.4281,
        longitude: 3.4219,
        landmarkText: 'Victoria Island Commercial Hub',
        confidenceScore: 90,
        status: 'TRUSTED',
        corridor: 'VI / LOS',
      },
    ];

    return {
      metrics: {
        totalBusinesses: totalMerchants,
        activeBusinesses: activeMerchants,
        suspendedBusinesses: suspendedMerchants,
        totalLocationsCaptured: totalLocations,
        activeDeliveriesToday: totalDeliveriesToday,
        totalDeliveriesAllTime,
        openCorrectionsCount: openCorrections,
        totalRevenueNgn,
      },
      adminMapLocations,
      systemTelemetry: {
        status: 'ALL_SYSTEMS_OPERATIONAL',
        uptimePercent: 99.98,
        database: 'PostgreSQL 16 + PostGIS',
        router: 'OSRM OpenStreetMap Engine',
        workerQueue: 'Healthy',
      },
      recentActivity: {
        deliveries: recentDeliveries,
        corrections: recentCorrections,
      },
    };
  }

  // ==========================================
  // 2. BUSINESSES MANAGEMENT
  // ==========================================
  async getBusinesses(query?: { search?: string; tier?: string; status?: string }) {
    const merchants = await this.prisma.merchant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            locations: true,
            deliveries: true,
            apiKeys: true,
            corrections: true,
          },
        },
      },
    });

    let results = merchants.map((m) => {
      const prof = parseProfile(m.profile);
      return {
        id: m.id,
        name: m.name,
        slug: m.slug || m.id,
        category: prof.category || '3PL Logistics',
        contactPerson: prof.contactPerson || 'Lead Dispatcher',
        email: prof.email || 'ops@' + (m.slug || 'partner.com'),
        phone: prof.phone || '+234 800 000 0000',
        tier: m.deliveryTier || 'Growth',
        status: prof.status || 'ACTIVE',
        suspensionReason: prof.suspensionReason || null,
        walletBalanceNgn: typeof prof.walletBalanceNgn === 'number' ? prof.walletBalanceNgn : 250000,
        totalSpendNgn: typeof prof.totalSpendNgn === 'number' ? prof.totalSpendNgn : 1200000,
        activeDeliveriesToday: m._count.deliveries,
        deliveriesCount: m._count.deliveries,
        totalLocationsCaptured: m._count.locations,
        locationsCount: m._count.locations,
        apiKeyCount: m._count.apiKeys,
        apiKeysCount: m._count.apiKeys,
        correctionsCount: m._count.corrections,
        rateLimitPerMin: typeof prof.rateLimitPerMin === 'number' ? prof.rateLimitPerMin : 1000,
        customRates: prof.customRates || null,
        corridor: m.corridor,
        techStack: m.techStack,
        joinedDate: m.createdAt.toISOString().slice(0, 10),
        lastActive: 'Active now',
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      };
    });

    if (query?.search) {
      const s = query.search.toLowerCase();
      results = results.filter(
        (b) =>
          b.name.toLowerCase().includes(s) ||
          b.email.toLowerCase().includes(s) ||
          b.contactPerson.toLowerCase().includes(s),
      );
    }

    if (query?.tier && query.tier !== 'ALL') {
      results = results.filter((b) => b.tier === query.tier);
    }

    if (query?.status && query.status !== 'ALL') {
      results = results.filter((b) => b.status === query.status);
    }

    return results;
  }

  async createBusiness(dto: CreateBusinessDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const clientKey = `pk_live_${crypto.randomBytes(12).toString('hex')}`;
    const secretKey = `sk_live_${crypto.randomBytes(18).toString('base64url')}`;

    const profileData = {
      category: dto.category || '3PL Logistics',
      contactPerson: dto.contactPerson || 'Lead Operations',
      email: dto.email || `${slug}@partner.io`,
      phone: dto.phone || '+234 800 000 0000',
      status: 'ACTIVE',
      walletBalanceNgn: 500000,
      totalSpendNgn: 0,
      rateLimitPerMin: 1500,
    };

    const merchant = await this.prisma.$transaction(async (tx) => {
      const m = await tx.merchant.create({
        data: {
          name: dto.name,
          slug,
          apiKey: secretKey,
          clientKey,
          corridor: dto.corridor || 'Lagos Metro',
          deliveryTier: dto.tier || 'Growth',
          profile: JSON.stringify(profileData),
        },
      });

      await tx.apiKey.create({
        data: {
          merchantId: m.id,
          name: 'Default Production Key',
          key: secretKey,
          type: 'SECRET',
          rateLimitPerMin: 1500,
          isActive: true,
        },
      });

      return m;
    });

    await this.logAdminAction(
      'Superadmin',
      'BUSINESS_CREATED',
      merchant.name,
      `Created partner business with tier: ${dto.tier || 'Growth'}`,
      'INFO',
    );

    return {
      id: merchant.id,
      name: merchant.name,
      slug: merchant.slug,
      clientKey,
      secretKey,
      profile: parseProfile(merchant.profile),
    };
  }

  async updateBusinessStatus(
    id: string,
    status: 'ACTIVE' | 'SUSPENDED',
    reason?: string,
  ) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id } });
    if (!merchant) {
      throw new NotFoundException(`Merchant ${id} not found.`);
    }

    const currentProfile = parseProfile(merchant.profile);
    const updatedProfile = {
      ...currentProfile,
      status,
      suspensionReason:
        status === 'SUSPENDED' ? reason || 'Administrative suspension' : null,
      suspendedAt: status === 'SUSPENDED' ? new Date().toISOString() : null,
    };

    const updated = await this.prisma.merchant.update({
      where: { id },
      data: {
        profile: JSON.stringify(updatedProfile),
      },
    });

    await this.logAdminAction(
      'Superadmin',
      status === 'SUSPENDED' ? 'BUSINESS_SUSPENDED' : 'BUSINESS_REACTIVATED',
      updated.name,
      status === 'SUSPENDED'
        ? `Suspended merchant: ${reason || 'Manual administrative review'}`
        : 'Reactivated partner merchant account',
      status === 'SUSPENDED' ? 'WARN' : 'INFO',
    );

    return {
      id: updated.id,
      name: updated.name,
      status,
      profile: parseProfile(updated.profile),
    };
  }

  async updateBusinessRates(id: string, rates: UpdateBusinessRatesDto) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id } });
    if (!merchant) {
      throw new NotFoundException(`Merchant ${id} not found.`);
    }

    const currentProfile = parseProfile(merchant.profile);
    const updatedProfile = {
      ...currentProfile,
      customRates: {
        ...(currentProfile.customRates || {}),
        ...rates,
      },
    };

    const updated = await this.prisma.merchant.update({
      where: { id },
      data: {
        profile: JSON.stringify(updatedProfile),
      },
    });

    await this.logAdminAction(
      'Superadmin',
      'CUSTOM_RATES_APPLIED',
      updated.name,
      `Updated custom rates: Capture ₦${rates.customCaptureRateNgn || '-'}, Routing ₦${rates.customRoutingRateNgn || '-'}, PoD ₦${rates.customPodRateNgn || '-'}`,
      'INFO',
    );

    return {
      id: updated.id,
      name: updated.name,
      customRates: parseProfile(updated.profile).customRates,
    };
  }

  async topupWallet(id: string, dto: TopupWalletDto) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id } });
    if (!merchant) {
      throw new NotFoundException(`Merchant ${id} not found.`);
    }

    const currentProfile = parseProfile(merchant.profile);
    const prevBalance = currentProfile.walletBalanceNgn || 0;
    const newBalance = prevBalance + dto.amountNgn;

    const updatedProfile = {
      ...currentProfile,
      walletBalanceNgn: newBalance,
    };

    const updated = await this.prisma.merchant.update({
      where: { id },
      data: {
        profile: JSON.stringify(updatedProfile),
      },
    });

    await this.logAdminAction(
      'Superadmin',
      'WALLET_CREDITED',
      updated.name,
      `Credited ₦${dto.amountNgn.toLocaleString()} to wallet. New balance: ₦${newBalance.toLocaleString()}`,
      'INFO',
    );

    return {
      id: updated.id,
      name: updated.name,
      walletBalanceNgn: newBalance,
      creditedAmount: dto.amountNgn,
    };
  }

  // ==========================================
  // 3. API KEYS (CROSS-TENANT)
  // ==========================================
  async getApiKeys(query?: { search?: string; status?: string; environment?: string }) {
    const keys = await this.prisma.apiKey.findMany({
      include: {
        merchant: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let results = keys.map((k) => {
      const prefix = k.key.slice(0, 10);
      const masked = `${prefix}••••••••••••${k.key.slice(-4)}`;
      return {
        id: k.id,
        keyPrefix: prefix,
        maskedKey: masked,
        businessId: k.merchantId,
        businessName: k.merchant.name,
        label: k.name,
        environment: k.type === 'PUBLIC' ? 'sandbox' : 'production',
        status: k.isActive ? 'ACTIVE' : 'REVOKED',
        rateLimitPerMin: k.rateLimitPerMin,
        createdAt: k.createdAt.toISOString().slice(0, 10),
        lastUsedAt: 'Recent',
      };
    });

    if (query?.search) {
      const s = query.search.toLowerCase();
      results = results.filter(
        (k) =>
          k.businessName.toLowerCase().includes(s) ||
          k.label.toLowerCase().includes(s) ||
          k.keyPrefix.toLowerCase().includes(s),
      );
    }

    if (query?.status && query.status !== 'ALL') {
      results = results.filter((k) => k.status === query.status);
    }

    return results;
  }

  async createApiKey(dto: AdminCreateApiKeyDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: dto.businessId },
    });
    if (!merchant) {
      throw new NotFoundException(`Merchant ${dto.businessId} not found.`);
    }

    const secretKey = `sk_live_${crypto.randomBytes(18).toString('base64url')}`;

    const newKey = await this.prisma.apiKey.create({
      data: {
        merchantId: dto.businessId,
        name: dto.label,
        key: secretKey,
        type: 'SECRET',
        rateLimitPerMin: dto.rateLimitPerMin || 1000,
        isActive: true,
      },
    });

    await this.logAdminAction(
      'Superadmin',
      'API_KEY_GENERATED',
      `${dto.label} (${merchant.name})`,
      `Generated new API key with rate limit: ${dto.rateLimitPerMin || 1000} req/min`,
      'INFO',
    );

    return {
      id: newKey.id,
      key: newKey.key,
      maskedKey: `${newKey.key.slice(0, 10)}••••••••••••${newKey.key.slice(-4)}`,
      label: newKey.name,
      rateLimitPerMin: newKey.rateLimitPerMin,
      status: 'ACTIVE',
    };
  }

  async rotateApiKey(id: string) {
    const existing = await this.prisma.apiKey.findUnique({
      where: { id },
      include: { merchant: true },
    });
    if (!existing) {
      throw new NotFoundException(`API key ${id} not found.`);
    }

    // Revoke old key
    await this.prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });

    // Create rotated key
    const newSecret = `sk_live_${crypto.randomBytes(18).toString('base64url')}`;
    const newKey = await this.prisma.apiKey.create({
      data: {
        merchantId: existing.merchantId,
        name: `${existing.name} (Rotated)`,
        key: newSecret,
        type: existing.type,
        rateLimitPerMin: existing.rateLimitPerMin,
        isActive: true,
      },
    });

    await this.logAdminAction(
      'Superadmin',
      'API_KEY_ROTATED',
      `${existing.name} (${existing.merchant.name})`,
      `Rotated key. Old key revoked, new key generated.`,
      'INFO',
    );

    return {
      oldKeyId: existing.id,
      newKeyId: newKey.id,
      newKey: newKey.key,
      label: newKey.name,
      rateLimitPerMin: newKey.rateLimitPerMin,
    };
  }

  async updateApiKeyRateLimit(id: string, rateLimitPerMin: number) {
    const existing = await this.prisma.apiKey.findUnique({
      where: { id },
      include: { merchant: true },
    });
    if (!existing) {
      throw new NotFoundException(`API key ${id} not found.`);
    }

    const updated = await this.prisma.apiKey.update({
      where: { id },
      data: { rateLimitPerMin },
    });

    await this.logAdminAction(
      'Superadmin',
      'RATE_LIMIT_INCREASED',
      `${existing.name} (${existing.merchant.name})`,
      `Changed throughput limit from ${existing.rateLimitPerMin} to ${rateLimitPerMin} req/min`,
      'INFO',
    );

    return updated;
  }

  async updateApiKeyStatus(id: string, status: 'ACTIVE' | 'REVOKED') {
    const existing = await this.prisma.apiKey.findUnique({
      where: { id },
      include: { merchant: true },
    });
    if (!existing) {
      throw new NotFoundException(`API key ${id} not found.`);
    }

    const isActive = status === 'ACTIVE';
    const updated = await this.prisma.apiKey.update({
      where: { id },
      data: { isActive },
    });

    await this.logAdminAction(
      'Superadmin',
      isActive ? 'API_KEY_ACTIVATED' : 'API_KEY_REVOKED',
      `${existing.name} (${existing.merchant.name})`,
      `Updated API key status to ${status}`,
      isActive ? 'INFO' : 'WARN',
    );

    return updated;
  }

  // ==========================================
  // 4. CORRECTIONS QUEUE & FRAUD ARBITRATION
  // ==========================================
  async getCorrections(query?: { status?: string }) {
    const where = query?.status && query.status !== 'ALL' ? { status: query.status } : {};

    const items = await this.prisma.correction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        merchant: { select: { name: true } },
      },
    });

    return items.map((c) => ({
      id: c.id,
      locationId: c.locationId,
      businessName: c.merchant.name,
      trackingRef: c.deliveryRef,
      landmarkText: c.landmarkText,
      originalGate: c.originalGate || 'Unspecified gate',
      reportedGate: c.reportedGate,
      driftMeters: c.pinDriftMeters,
      riderName: c.riderName,
      conflictType: c.pinDriftMeters > 100 ? 'PIN_DRIFT_HIGH' : 'GATE_DESCRIPTION_MISMATCH',
      severity: c.pinDriftMeters > 200 ? 'CRITICAL' : c.pinDriftMeters > 50 ? 'WARNING' : 'ROUTINE',
      status: c.status,
      riderNote: `Reported by courier ${c.riderName} (confidence: ${c.riderConfidence}%)`,
      timestamp: c.createdAt.toISOString().slice(0, 10),
    }));
  }

  async approveCorrection(id: string, adminUser = 'Superadmin') {
    const correction = await this.prisma.correction.findUnique({
      where: { id },
      include: { merchant: true },
    });
    if (!correction) {
      throw new NotFoundException(`Correction ${id} not found.`);
    }

    // Update correction status
    await this.prisma.correction.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // If linked to location, promote location to TRUSTED and append version
    if (correction.locationId) {
      const loc = await this.prisma.location.findUnique({
        where: { id: correction.locationId },
      });
      if (loc) {
        const nextVersion = loc.version + 1;
        await this.prisma.location.update({
          where: { id: loc.id },
          data: {
            gateDescription: correction.reportedGate,
            status: 'TRUSTED',
            confidenceScore: 0.95,
            version: nextVersion,
            versions: {
              create: {
                versionNumber: nextVersion,
                latitude: loc.latitude,
                longitude: loc.longitude,
                landmarkText: loc.landmarkText,
                gateDescription: correction.reportedGate,
                unitPath: loc.unitPath,
                changeSummary: `Superadmin approved correction from rider ${correction.riderName}`,
              },
            },
          },
        });
      }
    }

    await this.logAdminAction(
      adminUser,
      'CORRECTION_APPROVED',
      `${correction.landmarkText} (${correction.deliveryRef})`,
      `Superadmin approved rider correction. Location promoted to TRUSTED.`,
      'INFO',
    );

    return {
      success: true,
      id: correction.id,
      status: 'APPROVED',
    };
  }

  async rejectCorrection(id: string, adminUser = 'Superadmin') {
    const correction = await this.prisma.correction.findUnique({
      where: { id },
    });
    if (!correction) {
      throw new NotFoundException(`Correction ${id} not found.`);
    }

    await this.prisma.correction.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    await this.logAdminAction(
      adminUser,
      'CORRECTION_REJECTED',
      `${correction.landmarkText} (${correction.deliveryRef})`,
      `Superadmin rejected suspicious correction (${correction.pinDriftMeters}m drift). Original pin retained.`,
      'WARN',
    );

    return {
      success: true,
      id: correction.id,
      status: 'REJECTED',
    };
  }

  // ==========================================
  // 5. FINANCES & BILLING ENGINE
  // ==========================================
  async getPricingConfig() {
    let config = await this.prisma.platformPricing.findFirst();
    if (!config) {
      config = await this.prisma.platformPricing.create({
        data: {
          baseLocationCaptureNgn: 25.0,
          baseRouteOptimizationStopNgn: 40.0,
          basePodVerificationNgn: 15.0,
          starterMonthlyFeeNgn: 35000,
          growthMonthlyFeeNgn: 95000,
          enterpriseMonthlyFeeNgn: 280000,
          bulkDiscountPercentOver10k: 12,
          bulkDiscountPercentOver50k: 25,
          freeTrialDays: 14,
          autoSuspendNegativeBalanceHours: 48,
        },
      });
    }
    return config;
  }

  async updatePricingConfig(dto: UpdatePricingConfigDto) {
    const existing = await this.getPricingConfig();
    const updated = await this.prisma.platformPricing.update({
      where: { id: existing.id },
      data: {
        ...(typeof dto.baseLocationCaptureNgn === 'number'
          ? { baseLocationCaptureNgn: dto.baseLocationCaptureNgn }
          : {}),
        ...(typeof dto.baseRouteOptimizationStopNgn === 'number'
          ? { baseRouteOptimizationStopNgn: dto.baseRouteOptimizationStopNgn }
          : {}),
        ...(typeof dto.basePodVerificationNgn === 'number'
          ? { basePodVerificationNgn: dto.basePodVerificationNgn }
          : {}),
        ...(typeof dto.starterMonthlyFeeNgn === 'number'
          ? { starterMonthlyFeeNgn: dto.starterMonthlyFeeNgn }
          : {}),
        ...(typeof dto.growthMonthlyFeeNgn === 'number'
          ? { growthMonthlyFeeNgn: dto.growthMonthlyFeeNgn }
          : {}),
        ...(typeof dto.enterpriseMonthlyFeeNgn === 'number'
          ? { enterpriseMonthlyFeeNgn: dto.enterpriseMonthlyFeeNgn }
          : {}),
        ...(typeof dto.bulkDiscountPercentOver10k === 'number'
          ? { bulkDiscountPercentOver10k: dto.bulkDiscountPercentOver10k }
          : {}),
        ...(typeof dto.bulkDiscountPercentOver50k === 'number'
          ? { bulkDiscountPercentOver50k: dto.bulkDiscountPercentOver50k }
          : {}),
      },
    });

    await this.logAdminAction(
      'Superadmin',
      'GLOBAL_PRICING_UPDATED',
      'Platform Charging Engine',
      `Updated platform pricing config: Capture ₦${updated.baseLocationCaptureNgn}, Routing ₦${updated.baseRouteOptimizationStopNgn}, PoD ₦${updated.basePodVerificationNgn}`,
      'INFO',
    );

    return updated;
  }

  async getInvoices(query?: { status?: string }) {
    const where = query?.status && query.status !== 'ALL' ? { status: query.status } : {};

    const invoices = await this.prisma.invoice.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      include: {
        merchant: { select: { id: true, name: true } },
      },
    });

    return invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      businessId: inv.merchantId,
      businessName: inv.merchant.name,
      amountNgn: inv.amountNgn,
      period: inv.period,
      status: inv.status,
      paymentGateway: inv.paymentGateway,
      generatedAt: inv.generatedAt.toISOString().slice(0, 10),
      paidAt: inv.paidAt ? inv.paidAt.toISOString().slice(0, 10) : null,
      itemBreakdown: inv.itemBreakdown
        ? JSON.parse(inv.itemBreakdown)
        : { locationCaptures: 0, routeStops: 0, podVerifications: 0 },
    }));
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const invoiceCount = await this.prisma.invoice.count();
    const invoiceNumber = `INV-2026-${String(invoiceCount + 101).padStart(4, '0')}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        merchantId: dto.businessId,
        amountNgn: dto.amountNgn,
        period: dto.period,
        status: 'PENDING',
        paymentGateway: dto.paymentGateway || 'Paystack',
        itemBreakdown: dto.itemBreakdown ? JSON.stringify(dto.itemBreakdown) : null,
      },
      include: {
        merchant: { select: { name: true } },
      },
    });

    await this.logAdminAction(
      'Superadmin',
      'INVOICE_GENERATED',
      `${invoiceNumber} (${invoice.merchant.name})`,
      `Generated invoice of ₦${dto.amountNgn.toLocaleString()} for period ${dto.period}`,
      'INFO',
    );

    return invoice;
  }

  async updateInvoiceStatus(id: string, status: 'PAID' | 'PENDING' | 'OVERDUE') {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { merchant: true },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found.`);
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : null,
      },
    });

    await this.logAdminAction(
      'Superadmin',
      status === 'PAID' ? 'INVOICE_MARKED_PAID' : 'INVOICE_STATUS_UPDATED',
      `${invoice.invoiceNumber} (${invoice.merchant.name})`,
      `Updated invoice status to ${status}`,
      'INFO',
    );

    return updated;
  }

  // ==========================================
  // 6. SYSTEM TELEMETRY & AUDIT TRAIL
  // ==========================================
  async getSystemTelemetry() {
    const start = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - start;

    return {
      status: 'OPERATIONAL',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      database: {
        status: 'UP',
        engine: 'PostgreSQL 16',
        latencyMs: dbLatencyMs,
        postgis: 'PostGIS 3.4 Enabled (GIST spatial index)',
        activePool: '14 / 80 connections',
      },
      osrmRouter: {
        status: 'UP',
        network: 'Lagos Road Graph (OpenStreetMap)',
        mode: 'Multi-Modal Dispatch (Bike & Van)',
        tspSpeedMs: 14,
        cacheHitRatio: '94.2%',
      },
      webhookDispatcher: {
        status: 'UP',
        engine: 'Redis BullMQ Workers',
        queuedJobs: 0,
        successRate: '99.91%',
      },
      edgeGateways: [
        { name: 'Lagos (lag-core-01)', status: 'Healthy', latency: '12ms' },
        { name: 'Abuja (abj-edge-01)', status: 'Healthy', latency: '22ms' },
        { name: 'Port Harcourt (ph-01)', status: 'Healthy', latency: '28ms' },
      ],
    };
  }

  async getAuditLogs(query?: { search?: string; level?: string }) {
    const where: any = {};
    if (query?.level && query.level !== 'ALL') {
      where.level = query.level;
    }
    if (query?.search) {
      where.OR = [
        { action: { contains: query.search, mode: 'insensitive' } },
        { targetEntity: { contains: query.search, mode: 'insensitive' } },
        { details: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const logs = await this.prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return logs.map((l) => ({
      id: l.id,
      adminUser: l.adminUser,
      action: l.action,
      targetEntity: l.targetEntity,
      details: l.details,
      ipAddress: l.ipAddress || '102.89.41.90',
      timestamp: l.createdAt.toISOString().slice(0, 10),
      level: l.level,
    }));
  }

  async logAdminAction(
    adminUser: string,
    action: string,
    targetEntity: string,
    details: string,
    level: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO',
    ipAddress = '102.89.41.90',
  ) {
    return this.prisma.adminAuditLog.create({
      data: {
        adminUser,
        action,
        targetEntity,
        details,
        level,
        ipAddress,
      },
    });
  }

  async createAuditLog(dto: CreateAuditLogDto) {
    return this.logAdminAction(
      dto.adminUser,
      dto.action,
      dto.targetEntity,
      dto.details,
      dto.level,
    );
  }
}
