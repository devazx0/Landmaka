import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import {
  onboardMerchant,
  checkPing,
  loginMerchant,
  logoutMerchant,
  getCurrentUser,
} from './index';
import type {
  OnboardPayload,
  OnboardResponse,
  PingResponse,
  LoginPayload,
  LoginResponse,
  MeResponse,
} from './type';

export const ONBOARDING_KEYS = {
  all: ['onboarding'] as const,
  ping: () => [...ONBOARDING_KEYS.all, 'ping'] as const,
  me: () => [...ONBOARDING_KEYS.all, 'me'] as const,
};

/**
 * Custom mutation hook to onboard a new merchant workspace.
 * Automatically invalidates me query on success.
 */
export function useOnboardMerchant(
  options?: UseMutationOptions<OnboardResponse, Error, OnboardPayload>
) {
  const queryClient = useQueryClient();

  return useMutation<OnboardResponse, Error, OnboardPayload>({
    mutationFn: (payload: OnboardPayload) => onboardMerchant(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.me() });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

/**
 * Custom query hook to poll or check API health & operational status.
 */
export function usePingCheck(
  options?: Omit<UseQueryOptions<PingResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PingResponse, Error>({
    queryKey: ONBOARDING_KEYS.ping(),
    queryFn: checkPing,
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  });
}

/**
 * Custom mutation hook to trigger on-demand ping latency handshake.
 * Measures real elapsed round-trip time in milliseconds.
 */
export function usePingMutation(
  options?: UseMutationOptions<{ response: PingResponse; latencyMs: number }, Error, void>
) {
  return useMutation<{ response: PingResponse; latencyMs: number }, Error, void>({
    mutationFn: async () => {
      const startTime = performance.now();
      const response = await checkPing();
      const latencyMs = Math.round(performance.now() - startTime);
      return { response, latencyMs };
    },
    ...options,
  });
}

/**
 * Custom mutation hook to log in a merchant administrator.
 */
export function useLoginMerchant(
  options?: UseMutationOptions<LoginResponse, Error, LoginPayload>
) {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (payload: LoginPayload) => loginMerchant(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.me() });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

/**
 * Custom mutation hook to log out current user.
 */
export function useLogoutMerchant(
  options?: UseMutationOptions<{ message: string }, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, void>({
    mutationFn: logoutMerchant,
    onSuccess: (...args) => {
      queryClient.clear();
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

/**
 * Custom query hook to fetch current authenticated user profile and merchant data.
 */
export function useCurrentUser(
  options?: Omit<UseQueryOptions<MeResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<MeResponse, Error>({
    queryKey: ONBOARDING_KEYS.me(),
    queryFn: getCurrentUser,
    retry: false,
    ...options,
  });
}
