import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { NetworkConfig } from '../config/network';
import { tokenService } from '../services/tokenService';
import { APP_CONFIG } from '../config/app';

const DEBUG = __DEV__; // Only log in development

const sanitizeForLogs = (value: unknown): unknown => {
  if (!value || typeof value !== 'object') return value;
  try {
    const clone = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;

    const redactField = (obj: Record<string, unknown>, key: string): void => {
      const raw = obj[key];
      if (typeof raw === 'string' && raw.length > 0) {
        obj[key] = `[redacted:${key},len=${raw.length}]`;
      }
    };

    redactField(clone, 'imageBase64');
    redactField(clone, 'idToken');
    redactField(clone, 'refreshToken');
    redactField(clone, 'accessToken');

    return clone;
  } catch {
    return value;
  }
};

const baseURL = NetworkConfig.getApiBaseUrl();
if (DEBUG) {
  console.log('[API] Base URL:', baseURL);
}

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
// Queue of requests waiting for token refresh
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiClient = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds auth token and logs
apiClient.interceptors.request.use(
  async (config) => {
    const token = await tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (DEBUG) {
      console.log(
        `[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        sanitizeForLogs(config.data) || ''
      );
    }
    return config;
  },
  (error) => {
    if (DEBUG) {
      console.log('[API] Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - extracts data, handles errors, and refreshes tokens
apiClient.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.log(`[API] Response ${response.status}:`, response.data);
    }
    return response.data?.data ?? response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors - attempt token refresh (backend mode only)
    if (APP_CONFIG.authMode === 'backend' && error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenService.getRefreshToken();
        if (!refreshToken) {
          // No refresh token — user isn't logged in, clear any stale tokens
          await tokenService.clearAuth();
          return Promise.reject(error);
        }

        if (DEBUG) {
          console.log('[API] Refreshing token...');
        }

        // Call refresh endpoint directly with axios to avoid interceptor loop
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = response.data?.data?.accessToken || response.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken || response.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error('No access token in refresh response');
        }

        // Save new tokens
        await tokenService.storeTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || refreshToken,
        });

        if (DEBUG) {
          console.log('[API] Token refreshed successfully');
        }

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (DEBUG) {
          console.log('[API] Token refresh failed:', refreshError);
        }
        processQueue(refreshError as Error, null);
        // Clear tokens - user needs to log in again
        await tokenService.clearAuth();
        return Promise.reject(new ApiError('Session expired. Please log in again.', 'SESSION_EXPIRED', 401));
      } finally {
        isRefreshing = false;
      }
    }

    if (DEBUG) {
      console.log('[API] Error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
    }

    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as { error?: { message?: string; code?: string } } | undefined;
      const message = errorData?.error?.message || error.message;
      const code = errorData?.error?.code || 'REQUEST_FAILED';
      return Promise.reject(new ApiError(message, code, error.response?.status || 0));
    }
    return Promise.reject(error);
  }
);

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

