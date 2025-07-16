import type { LoginCredentials, RegisterData, User } from '../store/authStore';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface BackendAuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface UserResponse {
  user: User;
}

class AuthApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth = false
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add auth header if required and token is available
    if (requireAuth) {
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

      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.makeRequest<BackendAuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({
          emailOrUsername: credentials.emailOrUsername,
          password: credentials.password,
          rememberMe: credentials.rememberMe,
        }),
      }
    );

    // Map backend response to frontend format
    return {
      user: response.user,
      accessToken: response.token,
      refreshToken: response.refreshToken,
    };
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.makeRequest<BackendAuthResponse>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
        }),
      }
    );

    // Map backend response to frontend format
    return {
      user: response.user,
      accessToken: response.token,
      refreshToken: response.refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.makeRequest<BackendAuthResponse>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({
          refreshToken,
        }),
      }
    );

    // Map backend response to frontend format
    return {
      user: response.user,
      accessToken: response.token,
      refreshToken: response.refreshToken,
    };
  }

  async getCurrentUser(accessToken?: string): Promise<UserResponse> {
    return this.makeRequest<UserResponse>(
      '/auth/me',
      {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      },
      !accessToken
    ); // Use built-in auth if no token provided
  }

  async logout(accessToken?: string): Promise<void> {
    try {
      // Only attempt server logout if we have a token
      const hasToken =
        accessToken ||
        localStorage.getItem('access_token') ||
        JSON.parse(localStorage.getItem('auth-storage') || '{}').state
          ?.accessToken;

      if (hasToken) {
        await this.makeRequest(
          '/auth/logout',
          {
            method: 'POST',
            headers: accessToken
              ? {
                  Authorization: `Bearer ${accessToken}`,
                }
              : {},
          },
          !accessToken
        ); // Use built-in auth if no token provided
      }
    } catch (error) {
      // If logout fails, we still want to clear local state
      console.warn('Server logout failed:', error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    return this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmail(token: string): Promise<void> {
    return this.makeRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async changePassword(
    oldPassword: string,
    newPassword: string,
    accessToken?: string
  ): Promise<void> {
    return this.makeRequest(
      '/auth/change-password',
      {
        method: 'POST',
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      },
      !accessToken
    ); // Use built-in auth if no token provided
  }
}

export const authApiService = new AuthApiService();
export default authApiService;
