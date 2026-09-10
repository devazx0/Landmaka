export interface LocationItem {
  id: string;
  merchantId: string;
  name?: string;
  address?: string;
  latitude: number;
  longitude: number;
  landmark?: string;
  gateDescription?: string;
  pathToUnit?: string;
  photoUrl?: string;
  confidenceScore: number;
  verificationStatus: 'UNVERIFIED' | 'PHOTO_CONFIRMED' | 'PHYSICALLY_AUDITED' | 'GOLD_STANDARD';
  dropoffCount: number;
  contactName?: string;
  contactPhone?: string;
  versionsCount?: number;
  verifiedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationPayload {
  landmark: string;
  latitude: number;
  longitude: number;
  gateDescription?: string;
  pathToUnit?: string;
  photoUrl?: string;
  recipientName?: string;
  recipientPhone?: string;
}

export interface DeliveryItem {
  id: string;
  merchantId: string;
  externalOrderId: string;
  recipientName?: string;
  recipientPhone?: string;
  status: 'PENDING' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'RESCHEDULED';
  isBaseline: boolean;
  riderCallsCount: number;
  transitDurationMinutes?: number;
  trackingReference?: string;
  landmarkText?: string;
  gateDescription?: string;
  riderName?: string;
  riderVehicle?: string;
  confidenceScore?: number;
  otpVerified?: boolean;
  podPhotoUrl?: string;
  podGeotag?: string;
  timeAgo?: string;
  createdAt: string;
  locationId?: string;
}

export interface CreateDeliveryPayload {
  externalOrderId: string;
  recipientName?: string;
  recipientPhone?: string;
  locationId?: string;
  isBaseline?: boolean;
}

export interface RecordOutcomePayload {
  outcome: 'DELIVERED' | 'FAILED' | 'RESCHEDULED';
  riderCallsCount: number;
  transitDurationMinutes?: number;
  failureReason?: string;
  podPhotoUrl?: string;
  otpVerified?: boolean;
}

export interface PilotMetricsData {
  timeframe: string;
  baseline: {
    totalDeliveries: number;
    failureRatePercent: number;
    avgCallsPerDelivery: number;
    avgTransitMinutes: number;
  };
  pilot: {
    totalDeliveries: number;
    failureRatePercent: number;
    avgCallsPerDelivery: number;
    avgTransitMinutes: number;
  };
  improvements: {
    failureReductionPercent: number;
    callReductionPercent: number;
    transitTimeSavedPercent: number;
  };
  locationMaturity: {
    unverified: number;
    photoConfirmed: number;
    physicallyAudited: number;
    goldStandard: number;
  };
}

export interface ZoneItem {
  id: string;
  merchantId: string;
  name: string;
  boundaryGeoJson: string;
  isActive: boolean;
  createdAt: string;
}

export interface RouteStopInput {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
  notes?: string;
}

export interface OptimizeRoutePayload {
  origin: {
    latitude: number;
    longitude: number;
    label?: string;
  };
  stops: RouteStopInput[];
  roundTrip?: boolean;
}

export interface RouteLeg {
  fromStopId: string;
  toStopId: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteOptimizationResult {
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  orderedStops: Array<{
    sequenceIndex: number;
    id: string;
    latitude: number;
    longitude: number;
    label: string;
    notes?: string;
    distanceFromPreviousMeters: number;
    durationFromPreviousSeconds: number;
  }>;
  legs: RouteLeg[];
  geometryGeoJson?: any;
}

export interface ApiKeyItem {
  id: string;
  merchantId: string;
  name: string;
  key: string;
  type: 'SECRET' | 'PUBLIC';
  rateLimitPerMin: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateApiKeyPayload {
  name: string;
  type?: 'SECRET' | 'PUBLIC';
  rateLimitPerMin?: number;
}

export interface WebhookLogItem {
  id: string;
  event: string;
  endpoint: string;
  statusCode: number;
  timeAgo: string;
  createdAt?: string;
}

export interface WebhookConfig {
  webhookUrl: string | null;
  rateLimitTier?: string;
  recentLogs?: WebhookLogItem[];
}

export interface UpdateWebhookPayload {
  webhookUrl: string;
}

export interface CorrectionItem {
  id: string;
  deliveryRef?: string;
  landmarkText: string;
  originalGate?: string;
  reportedGate?: string;
  pinDriftMeters: number;
  riderName?: string;
  riderConfidence: number;
  type: 'GATE_CONFLICT' | 'PIN_DRIFT_ALERT' | 'CONFIRMATION';
  status: 'PENDING_REVIEW' | 'ACCEPTED' | 'REJECTED';
  isFlagged?: boolean;
  timestamp?: string;
  createdAt: string;
}

export interface CreateCorrectionPayload {
  deliveryId?: string;
  locationId?: string;
  reportedLatitude?: number;
  reportedLongitude?: number;
  gateDescription?: string;
  notes?: string;
}
