import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Core configured Axios instance for Landmaka Web application.
 * Supports credentials (HTTP-only cookies), auth headers, and unified error handling.
 */
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor: attach bearer token or api key from localStorage if available (client-side)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('lm_token');
      const apiKey = localStorage.getItem('lm_api_key') || (!token ? 'lm_test_key_pilot_01' : null);

      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (apiKey && !config.headers['x-api-key']) {
        config.headers['x-api-key'] = apiKey;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: extract server error message consistently
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[]; error?: string; statusCode?: number }>) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response?.data) {
      const data = error.response.data;
      if (Array.isArray(data.message)) {
        errorMessage = data.message.join(', ');
      } else if (typeof data.message === 'string') {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Attach human-readable normalized message to error
    const enhancedError = new Error(errorMessage) as Error & {
      status?: number;
      originalError?: AxiosError;
    };
    enhancedError.status = error.response?.status;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

export default api;
