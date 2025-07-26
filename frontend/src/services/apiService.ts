import axios from 'axios';
import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '../store/authStore';

// Extended axios config interface to include retry properties
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    const baseURL =
      import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

    this.api = axios.create({
      baseURL,
      timeout: 30000, // Increased timeout for production
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      config => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor for automatic token refresh
    this.api.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.api(originalRequest);
              })
              .catch(err => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshSuccess = await this.refreshToken();

            if (refreshSuccess) {
              this.processQueue(null);
              // Retry the original request with new token
              return this.api(originalRequest);
            } else {
              this.processQueue(new Error('Token refresh failed'));
              this.logout();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.logout();
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle rate limiting with exponential backoff
        if (error.response?.status === 429 && originalRequest) {
          const retryAfter = error.response.headers['retry-after'];
          const retryCount = originalRequest._retryCount || 0;
          const delay = retryAfter
            ? parseInt(retryAfter) * 1000
            : Math.min(1000 * Math.pow(2, retryCount), 30000);

          originalRequest._retryCount = retryCount + 1;

          if (originalRequest._retryCount <= 3) {
            await this.sleep(delay);
            return this.api(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: unknown) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    this.failedQueue = [];
  }

  private getAccessToken(): string | null {
    // Try to get token from localStorage first
    let token = localStorage.getItem('access_token');

    // If not in localStorage, try to get from Zustand store
    if (!token) {
      try {
        const authState = JSON.parse(
          localStorage.getItem('auth-storage') || '{}'
        );
        token = authState?.state?.accessToken;
      } catch {
        // If parsing fails, token remains null
      }
    }

    return token;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await axios.post(
        `${this.api.defaults.baseURL}/auth/refresh`,
        {
          refreshToken,
        }
      );

      const { token: newAccessToken, refreshToken: newRefreshToken } =
        response.data;

      // Update tokens in store
      const { setTokens } = useAuthStore.getState();
      setTokens(newAccessToken, newRefreshToken);

      // Update localStorage if tokens were stored there
      if (localStorage.getItem('access_token')) {
        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
      }

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  private getRefreshToken(): string | null {
    // Try to get refresh token from localStorage first
    let refreshToken = localStorage.getItem('refresh_token');

    // If not in localStorage, try to get from Zustand store
    if (!refreshToken) {
      try {
        const authState = JSON.parse(
          localStorage.getItem('auth-storage') || '{}'
        );
        refreshToken = authState?.state?.refreshToken;
      } catch {
        // If parsing fails, refreshToken remains null
      }
    }

    return refreshToken;
  }

  private logout() {
    // Clear all auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth-storage');

    // Reset auth store
    const { logout } = useAuthStore.getState();
    logout();

    // Redirect to login if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods
  public getInstance(): AxiosInstance {
    return this.api;
  }

  public async get<T>(
    url: string,
    config?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.api.get(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  public async delete<T>(
    url: string,
    config?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.api.delete(url, config);
    return response.data;
  }
}

// Create a single instance
export const apiService = new ApiService();
export default apiService;
