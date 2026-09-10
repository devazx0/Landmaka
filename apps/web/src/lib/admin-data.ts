export interface AdminBusiness {
  id: string;
  name: string;
  slug: string;
  category: 'E-commerce' | 'Food Delivery' | '3PL Logistics' | 'Courier' | 'Fintech/KYC';
  contactPerson: string;
  email: string;
  phone: string;
  tier: 'Starter' | 'Growth' | 'Enterprise';
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'DELINQUENT';
  suspensionReason?: string;
  walletBalanceNgn: number;
  totalSpendNgn: number;
  activeDeliveriesToday: number;
  totalLocationsCaptured: number;
  apiKeyCount: number;
  rateLimitPerMin: number;
  customCaptureRateNgn?: number;
  customRoutingRateNgn?: number;
  customPodRateNgn?: number;
  joinedDate: string;
  lastActive: string;
}

export interface AdminPricingConfig {
  baseLocationCaptureNgn: number;
  baseRouteOptimizationStopNgn: number;
  basePodVerificationNgn: number;
  starterMonthlyFeeNgn: number;
  growthMonthlyFeeNgn: number;
  enterpriseMonthlyFeeNgn: number;
  bulkDiscountPercentOver10k: number;
  bulkDiscountPercentOver50k: number;
  freeTrialDays: number;
  autoSuspendNegativeBalanceHours: number;
}

export interface AdminApiKeyRecord {
  id: string;
  keyPrefix: string;
  maskedKey: string;
  businessId: string;
  businessName: string;
  label: string;
  environment: 'production' | 'staging' | 'sandbox';
  status: 'ACTIVE' | 'REVOKED' | 'SUSPENDED';
  rateLimitPerMin: number;
  lastUsedAt: string;
  createdAt: string;
  allowedIps?: string[];
}

export interface AdminInvoiceRecord {
  id: string;
  invoiceNumber: string;
  businessId: string;
  businessName: string;
  amountNgn: number;
  period: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paymentGateway: 'Paystack' | 'Interswitch' | 'Bank Transfer' | 'Prepaid Balance';
  generatedAt: string;
  paidAt?: string;
  itemBreakdown: {
    locationCaptures: number;
    routeStops: number;
    podVerifications: number;
  };
}

export interface AdminCorrectionItem {
  id: string;
  locationId: string;
  businessName: string;
  trackingRef: string;
  landmarkText: string;
  originalGate: string;
  reportedGate: string;
  originalLat: number;
  originalLng: number;
  reportedLat: number;
  reportedLng: number;
  driftMeters: number;
  riderName: string;
  conflictType: 'PIN_DRIFT_HIGH' | 'GATE_DESCRIPTION_MISMATCH' | 'UNIT_PATH_CHANGE';
  severity: 'CRITICAL' | 'WARNING' | 'ROUTINE';
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  riderNote: string;
  timestamp: string;
}

export interface AdminAuditLog {
  id: string;
  adminUser: string;
  action: string;
  targetEntity: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRITICAL';
}

// Initial Mock Seed Data
export const DEFAULT_PRICING_CONFIG: AdminPricingConfig = {
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
};

export const INITIAL_BUSINESSES: AdminBusiness[] = [
  {
    id: 'biz_kwik',
    name: 'Kwik Delivery Nigeria',
    slug: 'kwik-delivery',
    category: '3PL Logistics',
    contactPerson: 'Adewale Adeleke',
    email: 'ops@kwik.delivery',
    phone: '+234 803 123 4567',
    tier: 'Enterprise',
    status: 'ACTIVE',
    walletBalanceNgn: 1450000,
    totalSpendNgn: 8940000,
    activeDeliveriesToday: 482,
    totalLocationsCaptured: 14280,
    apiKeyCount: 3,
    rateLimitPerMin: 3500,
    customCaptureRateNgn: 20.0,
    customRoutingRateNgn: 32.0,
    customPodRateNgn: 12.0,
    joinedDate: 'Jan 15, 2026',
    lastActive: '1 min ago',
  },
  {
    id: 'biz_gokada',
    name: 'Gokada Logistics',
    slug: 'gokada',
    category: 'Courier',
    contactPerson: 'Oluwaseun Bakare',
    email: 'dispatch@gokada.ng',
    phone: '+234 802 888 9911',
    tier: 'Growth',
    status: 'ACTIVE',
    walletBalanceNgn: 420000,
    totalSpendNgn: 3820000,
    activeDeliveriesToday: 219,
    totalLocationsCaptured: 6410,
    apiKeyCount: 2,
    rateLimitPerMin: 1500,
    joinedDate: 'Feb 03, 2026',
    lastActive: '5 mins ago',
  },
  {
    id: 'biz_max',
    name: 'MAX.ng Courier & Fleet',
    slug: 'max-ng',
    category: '3PL Logistics',
    contactPerson: 'Chinedu Eze',
    email: 'api-support@max.ng',
    phone: '+234 814 555 1212',
    tier: 'Enterprise',
    status: 'ACTIVE',
    walletBalanceNgn: 890000,
    totalSpendNgn: 6400000,
    activeDeliveriesToday: 341,
    totalLocationsCaptured: 11950,
    apiKeyCount: 4,
    rateLimitPerMin: 4000,
    customCaptureRateNgn: 21.5,
    customRoutingRateNgn: 34.0,
    joinedDate: 'Dec 10, 2025',
    lastActive: '3 mins ago',
  },
  {
    id: 'biz_chowdeck',
    name: 'Chowdeck Delivery',
    slug: 'chowdeck',
    category: 'Food Delivery',
    contactPerson: 'Fisayo Durojaiye',
    email: 'partners@chowdeck.com',
    phone: '+234 701 444 8899',
    tier: 'Growth',
    status: 'ACTIVE',
    walletBalanceNgn: 615000,
    totalSpendNgn: 4230000,
    activeDeliveriesToday: 290,
    totalLocationsCaptured: 8920,
    apiKeyCount: 2,
    rateLimitPerMin: 2000,
    joinedDate: 'Feb 19, 2026',
    lastActive: 'Just now',
  },
  {
    id: 'biz_gigl',
    name: 'GIG Logistics (GIGL)',
    slug: 'gigl',
    category: '3PL Logistics',
    contactPerson: 'Nkechi Okoye',
    email: 'tech@giglogistics.ng',
    phone: '+234 809 333 4455',
    tier: 'Enterprise',
    status: 'ACTIVE',
    walletBalanceNgn: 2310000,
    totalSpendNgn: 12450000,
    activeDeliveriesToday: 610,
    totalLocationsCaptured: 24800,
    apiKeyCount: 5,
    rateLimitPerMin: 5000,
    customCaptureRateNgn: 18.0,
    customRoutingRateNgn: 30.0,
    customPodRateNgn: 10.0,
    joinedDate: 'Nov 04, 2025',
    lastActive: '4 mins ago',
  },
  {
    id: 'biz_sendbox',
    name: 'Sendbox Fast Courier',
    slug: 'sendbox',
    category: 'Courier',
    contactPerson: 'Emeka Umeh',
    email: 'dev@sendbox.ng',
    phone: '+234 818 777 2200',
    tier: 'Starter',
    status: 'SUSPENDED',
    suspensionReason: 'Overdue billing delinquency & high failed routing rate',
    walletBalanceNgn: -42500,
    totalSpendNgn: 890000,
    activeDeliveriesToday: 0,
    totalLocationsCaptured: 1840,
    apiKeyCount: 1,
    rateLimitPerMin: 500,
    joinedDate: 'Mar 01, 2026',
    lastActive: '2 days ago',
  },
];

export const INITIAL_API_KEYS: AdminApiKeyRecord[] = [
  {
    id: 'key_kwik_prod',
    keyPrefix: 'lm_live_kwik_9921',
    maskedKey: 'lm_live_kwik_••••••••••••3d82',
    businessId: 'biz_kwik',
    businessName: 'Kwik Delivery Nigeria',
    label: 'Production Dispatch Core',
    environment: 'production',
    status: 'ACTIVE',
    rateLimitPerMin: 3500,
    lastUsedAt: '2 mins ago',
    createdAt: 'Jan 15, 2026',
    allowedIps: ['197.210.64.12', '102.89.23.4'],
  },
  {
    id: 'key_gokada_prod',
    keyPrefix: 'lm_live_gkd_4412',
    maskedKey: 'lm_live_gkd_••••••••••••9fa1',
    businessId: 'biz_gokada',
    businessName: 'Gokada Logistics',
    label: 'Rider App Live Feed',
    environment: 'production',
    status: 'ACTIVE',
    rateLimitPerMin: 1500,
    lastUsedAt: '5 mins ago',
    createdAt: 'Feb 03, 2026',
  },
  {
    id: 'key_max_prod',
    keyPrefix: 'lm_live_max_7701',
    maskedKey: 'lm_live_max_••••••••••••e04b',
    businessId: 'biz_max',
    businessName: 'MAX.ng Courier & Fleet',
    label: 'Primary Fleet Gateway',
    environment: 'production',
    status: 'ACTIVE',
    rateLimitPerMin: 4000,
    lastUsedAt: '3 mins ago',
    createdAt: 'Dec 10, 2025',
  },
  {
    id: 'key_chowdeck_prod',
    keyPrefix: 'lm_live_cdk_1190',
    maskedKey: 'lm_live_cdk_••••••••••••55cc',
    businessId: 'biz_chowdeck',
    businessName: 'Chowdeck Delivery',
    label: 'Restaurant to Door API',
    environment: 'production',
    status: 'ACTIVE',
    rateLimitPerMin: 2000,
    lastUsedAt: 'Just now',
    createdAt: 'Feb 19, 2026',
  },
  {
    id: 'key_gigl_prod',
    keyPrefix: 'lm_live_ggl_5521',
    maskedKey: 'lm_live_ggl_••••••••••••88d9',
    businessId: 'biz_gigl',
    businessName: 'GIG Logistics (GIGL)',
    label: 'National Routing Backbone',
    environment: 'production',
    status: 'ACTIVE',
    rateLimitPerMin: 5000,
    lastUsedAt: '4 mins ago',
    createdAt: 'Nov 04, 2025',
  },
  {
    id: 'key_sendbox_revoked',
    keyPrefix: 'lm_live_sbx_0019',
    maskedKey: 'lm_live_sbx_••••••••••••11a4',
    businessId: 'biz_sendbox',
    businessName: 'Sendbox Fast Courier',
    label: 'Main Integration Key',
    environment: 'production',
    status: 'REVOKED',
    rateLimitPerMin: 500,
    lastUsedAt: '2 days ago',
    createdAt: 'Mar 01, 2026',
  },
];

export const INITIAL_INVOICES: AdminInvoiceRecord[] = [
  {
    id: 'inv_2026_09_01',
    invoiceNumber: 'INV-LMK-2026-0891',
    businessId: 'biz_gigl',
    businessName: 'GIG Logistics (GIGL)',
    amountNgn: 1840000,
    period: 'Aug 2026',
    status: 'PAID',
    paymentGateway: 'Bank Transfer',
    generatedAt: 'Sep 01, 2026',
    paidAt: 'Sep 02, 2026',
    itemBreakdown: {
      locationCaptures: 24500,
      routeStops: 19800,
      podVerifications: 18900,
    },
  },
  {
    id: 'inv_2026_09_02',
    invoiceNumber: 'INV-LMK-2026-0892',
    businessId: 'biz_kwik',
    businessName: 'Kwik Delivery Nigeria',
    amountNgn: 1320000,
    period: 'Aug 2026',
    status: 'PAID',
    paymentGateway: 'Prepaid Balance',
    generatedAt: 'Sep 01, 2026',
    paidAt: 'Sep 01, 2026',
    itemBreakdown: {
      locationCaptures: 18200,
      routeStops: 14500,
      podVerifications: 13900,
    },
  },
  {
    id: 'inv_2026_09_03',
    invoiceNumber: 'INV-LMK-2026-0893',
    businessId: 'biz_max',
    businessName: 'MAX.ng Courier & Fleet',
    amountNgn: 980000,
    period: 'Aug 2026',
    status: 'PAID',
    paymentGateway: 'Paystack',
    generatedAt: 'Sep 01, 2026',
    paidAt: 'Sep 03, 2026',
    itemBreakdown: {
      locationCaptures: 12400,
      routeStops: 11200,
      podVerifications: 9800,
    },
  },
  {
    id: 'inv_2026_09_04',
    invoiceNumber: 'INV-LMK-2026-0894',
    businessId: 'biz_chowdeck',
    businessName: 'Chowdeck Delivery',
    amountNgn: 740000,
    period: 'Aug 2026',
    status: 'PENDING',
    paymentGateway: 'Prepaid Balance',
    generatedAt: 'Sep 01, 2026',
    itemBreakdown: {
      locationCaptures: 9400,
      routeStops: 8900,
      podVerifications: 8100,
    },
  },
  {
    id: 'inv_2026_09_05',
    invoiceNumber: 'INV-LMK-2026-0895',
    businessId: 'biz_sendbox',
    businessName: 'Sendbox Fast Courier',
    amountNgn: 185000,
    period: 'Jul 2026',
    status: 'OVERDUE',
    paymentGateway: 'Bank Transfer',
    generatedAt: 'Aug 01, 2026',
    itemBreakdown: {
      locationCaptures: 2100,
      routeStops: 1800,
      podVerifications: 1400,
    },
  },
];

export const INITIAL_CORRECTIONS_QUEUE: AdminCorrectionItem[] = [
  {
    id: 'adm_cor_01',
    locationId: 'loc_lag_004',
    businessName: 'Kwik Delivery Nigeria',
    trackingRef: 'KWK-LOS-9924',
    landmarkText: 'Ikeja GRA (Behind Zenith Bank, Isaac John St)',
    originalGate: 'Black gate with spike fence',
    reportedGate: 'Blue sliding gate. High risk mismatch.',
    originalLat: 6.5923,
    originalLng: 3.3562,
    reportedLat: 6.5938,
    reportedLng: 3.3579,
    driftMeters: 245,
    riderName: 'Sunday Oladipo',
    conflictType: 'PIN_DRIFT_HIGH',
    severity: 'CRITICAL',
    status: 'PENDING_REVIEW',
    riderNote: 'Pin placed inside Zenith compound; actual delivery is behind bank on quiet cul-de-sac. 245m drift.',
    timestamp: '51m ago',
  },
  {
    id: 'adm_cor_02',
    locationId: 'loc_lag_006',
    businessName: 'Gokada Logistics',
    trackingRef: 'KWK-LOS-9918',
    landmarkText: 'Off Freedom Way, near Dome Church, Lekki',
    originalGate: 'White painted perimeter wall',
    reportedGate: 'White perimeter wall verified, but pedestrian gate is 180m south around corner.',
    originalLat: 6.4412,
    originalLng: 3.4892,
    reportedLat: 6.4426,
    reportedLng: 3.4899,
    driftMeters: 180,
    riderName: 'Babatunde Alabi',
    conflictType: 'PIN_DRIFT_HIGH',
    severity: 'WARNING',
    status: 'PENDING_REVIEW',
    riderNote: 'Customer placed pin on main road; entrance is on rear estate close.',
    timestamp: '2 hours ago',
  },
  {
    id: 'adm_cor_03',
    locationId: 'loc_lag_008',
    businessName: 'Chowdeck Delivery',
    trackingRef: 'CDK-YAB-4410',
    landmarkText: 'Commercial Ave, Beside Domino’s Pizza, Yaba',
    originalGate: 'Green gate',
    reportedGate: 'Renovated to Grey motorized gate with call button',
    originalLat: 6.5162,
    originalLng: 3.3721,
    reportedLat: 6.5163,
    reportedLng: 3.3722,
    driftMeters: 14,
    riderName: 'Ibrahim Saliu',
    conflictType: 'GATE_DESCRIPTION_MISMATCH',
    severity: 'ROUTINE',
    status: 'PENDING_REVIEW',
    riderNote: 'Compound gate repainted from green to grey last week. Confirmed with security guard.',
    timestamp: '3 hours ago',
  },
];

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log_01',
    adminUser: 'Azeem Sanusi',
    action: 'BUSINESS_SUSPENDED',
    targetEntity: 'Sendbox Fast Courier (biz_sendbox)',
    details: 'Triggered manual suspension due to 48h unpaid invoice & negative wallet balance (-₦42,500)',
    ipAddress: '197.210.44.18',
    timestamp: '2 days ago',
    level: 'CRITICAL',
  },
  {
    id: 'log_02',
    adminUser: 'Azeem Sanusi',
    action: 'KEY_REVOKED',
    targetEntity: 'lm_live_sbx_••••••••••••11a4',
    details: 'Revoked production API key upon business suspension',
    ipAddress: '197.210.44.18',
    timestamp: '2 days ago',
    level: 'WARN',
  },
  {
    id: 'log_03',
    adminUser: 'Azeem Sanusi',
    action: 'CUSTOM_PRICING_UPDATED',
    targetEntity: 'GIG Logistics (GIGL)',
    details: 'Applied negotiated enterprise rate: Location Capture ₦18.00, Routing ₦30.00, PoD ₦10.00',
    ipAddress: '102.89.41.90',
    timestamp: 'Sep 03, 2026',
    level: 'INFO',
  },
  {
    id: 'log_04',
    adminUser: 'Azeem Sanusi',
    action: 'RATE_LIMIT_INCREASED',
    targetEntity: 'MAX.ng Courier & Fleet',
    details: 'Increased throughput limit from 2,500 to 4,000 req/min for Lagos dispatch peak',
    ipAddress: '102.89.41.90',
    timestamp: 'Sep 05, 2026',
    level: 'INFO',
  },
];

// LocalStorage helpers to allow state updates in the UI
const STORAGE_KEYS = {
  BUSINESSES: 'landmaka_admin_businesses_v1',
  PRICING: 'landmaka_admin_pricing_v1',
  API_KEYS: 'landmaka_admin_api_keys_v1',
  INVOICES: 'landmaka_admin_invoices_v1',
  CORRECTIONS: 'landmaka_admin_corrections_v1',
  LOGS: 'landmaka_admin_logs_v1',
};

export function getAdminBusinesses(): AdminBusiness[] {
  if (typeof window === 'undefined') return INITIAL_BUSINESSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUSINESSES);
    if (!raw) return INITIAL_BUSINESSES;
    return JSON.parse(raw);
  } catch {
    return INITIAL_BUSINESSES;
  }
}

export function saveAdminBusinesses(businesses: AdminBusiness[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
  } catch (e) {
    console.error('Failed to persist businesses', e);
  }
}

export function getAdminPricing(): AdminPricingConfig {
  if (typeof window === 'undefined') return DEFAULT_PRICING_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRICING);
    if (!raw) return DEFAULT_PRICING_CONFIG;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRICING_CONFIG;
  }
}

export function saveAdminPricing(pricing: AdminPricingConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(pricing));
  } catch (e) {
    console.error('Failed to persist pricing', e);
  }
}

export function getAdminApiKeys(): AdminApiKeyRecord[] {
  if (typeof window === 'undefined') return INITIAL_API_KEYS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    if (!raw) return INITIAL_API_KEYS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_API_KEYS;
  }
}

export function saveAdminApiKeys(keys: AdminApiKeyRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  } catch (e) {
    console.error('Failed to persist keys', e);
  }
}

export function getAdminCorrections(): AdminCorrectionItem[] {
  if (typeof window === 'undefined') return INITIAL_CORRECTIONS_QUEUE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CORRECTIONS);
    if (!raw) return INITIAL_CORRECTIONS_QUEUE;
    return JSON.parse(raw);
  } catch {
    return INITIAL_CORRECTIONS_QUEUE;
  }
}

export function saveAdminCorrections(corrections: AdminCorrectionItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CORRECTIONS, JSON.stringify(corrections));
  } catch (e) {
    console.error('Failed to persist corrections', e);
  }
}

export function getAdminAuditLogs(): AdminAuditLog[] {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) return INITIAL_AUDIT_LOGS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function appendAdminAuditLog(log: Omit<AdminAuditLog, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getAdminAuditLogs();
    const newLog: AdminAuditLog = {
      ...log,
      id: `log_${Date.now()}`,
      timestamp: 'Just now',
    };
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([newLog, ...existing]));
  } catch (e) {
    console.error('Failed to append log', e);
  }
}
