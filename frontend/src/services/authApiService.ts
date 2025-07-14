import type { LoginCredentials, RegisterData, User } from '../store/authStore';

const API_BASE_URL = '/api/v1';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface UserResponse {
  user: User;
}

class AuthApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

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
    return this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        emailOrUsername: credentials.emailOrUsername,
        password: credentials.password,
        rememberMe: credentials.rememberMe,
      }),
    });
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
      }),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken,
      }),
    });
  }

  async getCurrentUser(accessToken: string): Promise<UserResponse> {
    return this.makeRequest<UserResponse>('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async logout(accessToken: string): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
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
    accessToken: string
  ): Promise<void> {
    return this.makeRequest('/auth/change-password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });
  }
}

export const authApiService = new AuthApiService();
export default authApiService;
