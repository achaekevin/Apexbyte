import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export interface ApiErrorPayload {
  code: string;
  message: string;
  requestId?: string;
  details?: any;
}

export class ApiError extends Error {
  status: number;
  code: string;
  requestId?: string;
  details?: any;
  isNetworkError: boolean;
  isTimeout: boolean;
  response?: any;

  constructor(params: {
    message: string;
    status: number;
    code?: string;
    requestId?: string;
    details?: any;
    isNetworkError?: boolean;
    isTimeout?: boolean;
    response?: any;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code || 'UNKNOWN_ERROR';
    this.requestId = params.requestId;
    this.details = params.details;
    this.isNetworkError = !!params.isNetworkError;
    this.isTimeout = !!params.isTimeout;
    this.response = params.response;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: parseInt((import.meta as any).env?.VITE_API_TIMEOUT, 10) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to generate a client trace ID for requests
const generateTraceId = (): string => {
  return 'cli_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

// Request interceptor: attaches auth token and X-Request-Id
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.headers && !config.headers['X-Request-Id']) {
      config.headers['X-Request-Id'] = generateTraceId();
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      skipToast?: boolean;
    };

    // 1. Handle token expiration & automatic refresh
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const user = useAuthStore.getState().user;
        const loginTimestamp = useAuthStore.getState().loginTimestamp;
        const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

        // Administrative sessions must never silently refresh after the session window has expired
        if (isAdmin && loginTimestamp && Date.now() - loginTimestamp > 2 * 60 * 60 * 1000) {
          throw new Error('Admin session expired due to inactivity or window timeout');
        }

        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const refreshData = refreshResponse.data?.data || refreshResponse.data;
        const accessToken = refreshData?.accessToken;
        const newRefreshToken = refreshData?.refreshToken;

        if (accessToken && user) {
          useAuthStore.getState().setAuth(user, accessToken, newRefreshToken || refreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        // Only redirect to login if the user is currently on a protected route
        const currentPath = window.location.pathname;
        const isProtectedRoute =
          currentPath.startsWith('/dashboard') ||
          currentPath.startsWith('/admin') ||
          currentPath.startsWith('/checkout');

        if (isProtectedRoute) {
          window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    // 2. Classify error type & normalize payload
    let status = error.response?.status || 0;
    let code = 'UNKNOWN_ERROR';
    let message = 'An unexpected error occurred. Please try again.';
    let requestId: string | undefined =
      (error.response?.headers?.['x-request-id'] as string) ||
      error.response?.data?.error?.requestId ||
      (error.config?.headers?.['X-Request-Id'] as string);
    let details: any = null;
    let isNetworkError = false;
    let isTimeout = false;

    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
      status = 504;
      code = 'GATEWAY_TIMEOUT';
      message = 'Connection timed out. The server took too long to respond.';
      isTimeout = true;
    } else if (!error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      status = 0;
      code = 'NETWORK_ERROR';
      message = 'Unable to reach the server. Please check your internet connection or try again shortly.';
      isNetworkError = true;
    } else {
      // Extract from standardized backend response
      const resData = error.response.data;
      if (resData?.error) {
        code = resData.error.code || code;
        message = resData.error.message || resData.message || message;
        details = resData.error.details || null;
        requestId = resData.error.requestId || requestId;
      } else if (resData?.message) {
        message = resData.message;
      }

      if (status === 404 && code === 'UNKNOWN_ERROR') code = 'RESOURCE_NOT_FOUND';
      if (status === 403 && code === 'UNKNOWN_ERROR') code = 'ACCESS_FORBIDDEN';
      if (status === 401 && code === 'UNKNOWN_ERROR') code = 'AUTHENTICATION_REQUIRED';
      if (status === 429 && code === 'UNKNOWN_ERROR') code = 'RATE_LIMIT_EXCEEDED';
      if (status >= 500 && code === 'UNKNOWN_ERROR') code = 'INTERNAL_SERVER_ERROR';
    }

    // 3. User notification logic (suppress spam for 404s, 401s, or requests marked skipToast)
    const shouldToast =
      !originalRequest?.skipToast &&
      status !== 404 &&
      status !== 401 &&
      status !== 403;

    if (shouldToast) {
      toast.error(message);
    }

    // 4. Return normalized ApiError
    const normalizedError = new ApiError({
      message,
      status,
      code,
      requestId,
      details,
      isNetworkError,
      isTimeout,
      response: error.response,
    });

    return Promise.reject(normalizedError);
  }
);

export default api;
