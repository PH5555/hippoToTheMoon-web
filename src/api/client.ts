import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Authenticated API client (uses HttpOnly cookie for auth)
export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 쿠키 자동 전송
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public API client (also needs withCredentials for cookie-based auth)
export const publicApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 쿠키 자동 전송
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: () => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Helper function to handle logout
const handleLogout = () => {
  toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
  window.location.href = '/login';
};

// Response interceptor - Handle 401 errors with token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 errors and non-retried requests
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh')) {
      handleLogout();
      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        failedQueue.push({
          resolve: () => {
            // 쿠키가 자동으로 갱신되었으므로 바로 재시도
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

    try {
      // Import authApi dynamically to avoid circular dependency
      const { authApi } = await import('./auth');
      await authApi.refresh();
      // 토큰은 Set-Cookie 헤더로 자동 갱신됨

      // Process queued requests
      processQueue(null);

      // Retry original request (쿠키가 자동으로 전송됨)
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed - process queue with error and logout
      processQueue(refreshError as Error);
      handleLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
