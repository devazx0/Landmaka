import api from '../api';
import {
  LocationItem,
  CreateLocationPayload,
  DeliveryItem,
  CreateDeliveryPayload,
  RecordOutcomePayload,
  PilotMetricsData,
  ZoneItem,
  OptimizeRoutePayload,
  RouteOptimizationResult,
  ApiKeyItem,
  CreateApiKeyPayload,
  WebhookConfig,
  UpdateWebhookPayload,
  CorrectionItem,
  CreateCorrectionPayload,
} from './type';

export * from './type';

/* =========================================================================
   LOCATIONS
========================================================================= */

export async function getLocations(): Promise<LocationItem[]> {
  const { data } = await api.get<LocationItem[]>('/api/v1/locations');
  return data;
}

export async function getLocation(id: string): Promise<LocationItem> {
  const { data } = await api.get<LocationItem>(`/api/v1/locations/${id}`);
  return data;
}

export async function createLocation(payload: Partial<CreateLocationPayload>): Promise<LocationItem> {
  const { data } = await api.post<LocationItem>('/api/v1/locations', payload);
  return data;
}

export async function deleteLocation(id: string): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/api/v1/locations/${id}`);
  return data;
}

/* =========================================================================
   DELIVERIES & OUTCOMES
========================================================================= */

export async function getDeliveries(): Promise<DeliveryItem[]> {
  const { data } = await api.get<DeliveryItem[]>('/api/v1/deliveries');
  return data;
}

export async function getDelivery(id: string): Promise<DeliveryItem> {
  const { data } = await api.get<DeliveryItem>(`/api/v1/deliveries/${id}`);
  return data;
}

export async function createDelivery(payload: Partial<CreateDeliveryPayload>): Promise<DeliveryItem> {
  const { data } = await api.post<DeliveryItem>('/api/v1/deliveries', payload);
  return data;
}

export async function recordDeliveryOutcome(
  id: string,
  payload: RecordOutcomePayload
): Promise<DeliveryItem> {
  const { data } = await api.patch<DeliveryItem>(`/api/v1/deliveries/${id}/outcome`, payload);
  return data;
}

/* =========================================================================
   ROUTE OPTIMIZATION (OSRM)
========================================================================= */

export async function optimizeRoute(payload: OptimizeRoutePayload): Promise<RouteOptimizationResult> {
  const { data } = await api.post<RouteOptimizationResult>('/api/v1/routes/optimize', payload);
  return data;
}

/* =========================================================================
   METRICS & SCORECARD
========================================================================= */

export async function getPilotMetrics(): Promise<PilotMetricsData> {
  const { data } = await api.get<PilotMetricsData>('/api/v1/metrics/pilot');
  return data;
}

/* =========================================================================
   ZONES
========================================================================= */

export async function getZones(): Promise<ZoneItem[]> {
  const { data } = await api.get<ZoneItem[]>('/api/v1/zones');
  return data;
}

/* =========================================================================
   API KEYS & AUTH TOKENS
========================================================================= */

export async function getApiKeys(): Promise<ApiKeyItem[]> {
  const { data } = await api.get<ApiKeyItem[]>('/api/v1/api-keys');
  return data;
}

export async function createApiKey(payload: CreateApiKeyPayload): Promise<ApiKeyItem> {
  const { data } = await api.post<ApiKeyItem>('/api/v1/api-keys', payload);
  return data;
}

export async function deleteApiKey(id: string): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/api/v1/api-keys/${id}`);
  return data;
}

/* =========================================================================
   WEBHOOKS & EVENT STREAMS
========================================================================= */

export async function getWebhookConfig(): Promise<WebhookConfig> {
  const { data } = await api.get<WebhookConfig>('/api/v1/webhooks');
  return data;
}

export async function updateWebhook(payload: UpdateWebhookPayload): Promise<WebhookConfig> {
  const { data } = await api.patch<WebhookConfig>('/api/v1/webhooks', payload);
  return data;
}

/* =========================================================================
   CORRECTIONS & AUDIT QUEUE
========================================================================= */

export async function getCorrections(): Promise<CorrectionItem[]> {
  const { data } = await api.get<CorrectionItem[]>('/api/v1/corrections');
  return data;
}

export async function createCorrection(payload: CreateCorrectionPayload): Promise<CorrectionItem> {
  const { data } = await api.post<CorrectionItem>('/api/v1/corrections', payload);
  return data;
}
