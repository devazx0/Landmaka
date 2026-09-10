import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  getLocations,
  getLocation,
  createLocation,
  deleteLocation,
  getDeliveries,
  getDelivery,
  createDelivery,
  recordDeliveryOutcome,
  optimizeRoute,
  getPilotMetrics,
  getZones,
  getApiKeys,
  createApiKey,
  deleteApiKey,
  getWebhookConfig,
  updateWebhook,
  getCorrections,
  createCorrection,
} from './index';
import type {
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

export const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  locations: () => [...DASHBOARD_KEYS.all, 'locations'] as const,
  location: (id: string) => [...DASHBOARD_KEYS.locations(), id] as const,
  deliveries: () => [...DASHBOARD_KEYS.all, 'deliveries'] as const,
  delivery: (id: string) => [...DASHBOARD_KEYS.deliveries(), id] as const,
  metrics: () => [...DASHBOARD_KEYS.all, 'metrics'] as const,
  zones: () => [...DASHBOARD_KEYS.all, 'zones'] as const,
  apiKeys: () => [...DASHBOARD_KEYS.all, 'apiKeys'] as const,
  webhooks: () => [...DASHBOARD_KEYS.all, 'webhooks'] as const,
  corrections: () => [...DASHBOARD_KEYS.all, 'corrections'] as const,
};

/* =========================================================================
   LOCATIONS HOOKS
========================================================================= */

export function useLocations(
  options?: Omit<UseQueryOptions<LocationItem[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<LocationItem[], Error>({
    queryKey: DASHBOARD_KEYS.locations(),
    queryFn: getLocations,
    ...options,
  });
}

export function useLocation(
  id: string,
  options?: Omit<UseQueryOptions<LocationItem, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<LocationItem, Error>({
    queryKey: DASHBOARD_KEYS.location(id),
    queryFn: () => getLocation(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreateLocation(
  options?: UseMutationOptions<LocationItem, Error, Partial<CreateLocationPayload>>
) {
  const queryClient = useQueryClient();

  return useMutation<LocationItem, Error, Partial<CreateLocationPayload>>({
    mutationFn: (payload: Partial<CreateLocationPayload>) => createLocation(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.locations() });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useDeleteLocation(
  options?: UseMutationOptions<{ success: boolean }, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.locations() });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

/* =========================================================================
   DELIVERIES & POD HOOKS
========================================================================= */

export function useDeliveries(
  options?: Omit<UseQueryOptions<DeliveryItem[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<DeliveryItem[], Error>({
    queryKey: DASHBOARD_KEYS.deliveries(),
    queryFn: getDeliveries,
    ...options,
  });
}

export function useDelivery(
  id: string,
  options?: Omit<UseQueryOptions<DeliveryItem, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<DeliveryItem, Error>({
    queryKey: DASHBOARD_KEYS.delivery(id),
    queryFn: () => getDelivery(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreateDelivery(
  options?: UseMutationOptions<DeliveryItem, Error, Partial<CreateDeliveryPayload>>
) {
  const queryClient = useQueryClient();

  return useMutation<DeliveryItem, Error, Partial<CreateDeliveryPayload>>({
    mutationFn: (payload: Partial<CreateDeliveryPayload>) => createDelivery(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.deliveries() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.metrics() });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useRecordDeliveryOutcome(
  options?: UseMutationOptions<DeliveryItem, Error, { id: string; payload: RecordOutcomePayload }>
) {
  const queryClient = useQueryClient();

  return useMutation<DeliveryItem, Error, { id: string; payload: RecordOutcomePayload }>({
    mutationFn: ({ id, payload }) => recordDeliveryOutcome(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.deliveries() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.metrics() });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

/* =========================================================================
   ROUTING HOOK
========================================================================= */

export function useOptimizeRoute(
  options?: UseMutationOptions<RouteOptimizationResult, Error, OptimizeRoutePayload>
) {
  return useMutation<RouteOptimizationResult, Error, OptimizeRoutePayload>({
    mutationFn: (payload: OptimizeRoutePayload) => optimizeRoute(payload),
    ...options,
  });
}

/* =========================================================================
   METRICS & SCORECARD HOOK
========================================================================= */

export function usePilotMetrics(
  options?: Omit<UseQueryOptions<PilotMetricsData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PilotMetricsData, Error>({
    queryKey: DASHBOARD_KEYS.metrics(),
    queryFn: getPilotMetrics,
    ...options,
  });
}

/* =========================================================================
   ZONES HOOK
========================================================================= */

export function useZones(
  options?: Omit<UseQueryOptions<ZoneItem[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ZoneItem[], Error>({
    queryKey: DASHBOARD_KEYS.zones(),
    queryFn: getZones,
    ...options,
  });
}

/* =========================================================================
   API KEYS HOOKS
========================================================================= */

export function useApiKeys(
  options?: Omit<UseQueryOptions<ApiKeyItem[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ApiKeyItem[], Error>({
    queryKey: DASHBOARD_KEYS.apiKeys(),
    queryFn: getApiKeys,
    ...options,
  });
}

export function useCreateApiKey(
  options?: UseMutationOptions<ApiKeyItem, Error, CreateApiKeyPayload>
) {
  const queryClient = useQueryClient();

  return useMutation<ApiKeyItem, Error, CreateApiKeyPayload>({
    mutationFn: (payload: CreateApiKeyPayload) => createApiKey(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.apiKeys() });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useDeleteApiKey(
  options?: UseMutationOptions<{ success: boolean }, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id: string) => deleteApiKey(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.apiKeys() });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

/* =========================================================================
   WEBHOOKS HOOKS
========================================================================= */

export function useWebhookConfig(
  options?: Omit<UseQueryOptions<WebhookConfig, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<WebhookConfig, Error>({
    queryKey: DASHBOARD_KEYS.webhooks(),
    queryFn: getWebhookConfig,
    ...options,
  });
}

export function useUpdateWebhook(
  options?: UseMutationOptions<WebhookConfig, Error, UpdateWebhookPayload>
) {
  const queryClient = useQueryClient();

  return useMutation<WebhookConfig, Error, UpdateWebhookPayload>({
    mutationFn: (payload: UpdateWebhookPayload) => updateWebhook(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.webhooks() });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

/* =========================================================================
   CORRECTIONS HOOKS
========================================================================= */

export function useCorrections(
  options?: Omit<UseQueryOptions<CorrectionItem[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CorrectionItem[], Error>({
    queryKey: DASHBOARD_KEYS.corrections(),
    queryFn: getCorrections,
    ...options,
  });
}

export function useCreateCorrection(
  options?: UseMutationOptions<CorrectionItem, Error, CreateCorrectionPayload>
) {
  const queryClient = useQueryClient();

  return useMutation<CorrectionItem, Error, CreateCorrectionPayload>({
    mutationFn: (payload: CreateCorrectionPayload) => createCorrection(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.corrections() });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.locations() });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
