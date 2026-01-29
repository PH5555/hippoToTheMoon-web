import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Authenticated API client (requires Authorization header)
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public API client (no Authorization header required)
export const publicApiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Helper function to clear auth state
const clearAuthState = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Helper function to handle logout
const handleLogout = () => {
  clearAuthState();
  toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
  window.location.href = '/login';
};

// Request interceptor - Add Authorization header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors with token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 errors and non-retried requests
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject: (err: Error) => {
            reject(err);
          },
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const storedRefreshToken = localStorage.getItem('refreshToken');

    // No refresh token available
    if (!storedRefreshToken) {
      isRefreshing = false;
      handleLogout();
      return Promise.reject(error);
    }

    try {
      // Import authApi dynamically to avoid circular dependency
      const { authApi } = await import('./auth');
      const tokens = await authApi.refresh({ refreshToken: storedRefreshToken });

      // Save new tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      // Process queued requests with new token
      processQueue(null, tokens.accessToken);

      // Retry original request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed - process queue with error and logout
      processQueue(refreshError as Error, null);
      handleLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
