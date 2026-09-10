import api from '../api';
import {
  OnboardPayload,
  OnboardResponse,
  PingResponse,
  LoginPayload,
  LoginResponse,
  MeResponse,
} from './type';

export * from './type';

/**
 * Onboard and provision a new partner merchant workspace.
 * POST /api/v1/auth/onboard
 */
export async function onboardMerchant(payload: OnboardPayload): Promise<OnboardResponse> {
  const { data } = await api.post<OnboardResponse>('/api/v1/auth/onboard', payload);
  if (typeof window !== 'undefined' && data?.token) {
    localStorage.setItem('lm_token', data.token);
    if (data.credentials?.secretKey) {
      localStorage.setItem('lm_api_key', data.credentials.secretKey);
    }
  }
  return data;
}

/**
 * Check operational handshake and measure server round-trip latency.
 * GET /api/v1/auth/ping
 */
export async function checkPing(): Promise<PingResponse> {
  const { data } = await api.get<PingResponse>('/api/v1/auth/ping');
  return data;
}

/**
 * Authenticate merchant administrator.
 * POST /api/v1/auth/login
 */
export async function loginMerchant(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/v1/auth/login', payload);
  if (typeof window !== 'undefined' && data?.token) {
    localStorage.setItem('lm_token', data.token);
  }
  return data;
}

/**
 * Log out current session and clear stored tokens.
 * POST /api/v1/auth/logout
 */
export async function logoutMerchant(): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/api/v1/auth/logout');
  if (typeof window !== 'undefined') {
    localStorage.removeItem('lm_token');
    localStorage.removeItem('lm_api_key');
  }
  return data;
}

/**
 * Fetch current authenticated user and merchant details.
 * GET /api/v1/auth/me
 */
export async function getCurrentUser(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/api/v1/auth/me');
  return data;
}
