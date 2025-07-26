import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authApiService from '../services/authApiService';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

interface AuthState {
  // Authentication state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Token management
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null; // Add token expiration timestamp

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  clearError: () => void;

  // Token management helpers
  isTokenExpiringSoon: () => boolean;
  shouldRefreshToken: () => boolean;

  // Auth flow helpers
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,

      // Basic setters
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...updates },
          });
        }
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        // Calculate expiration time (JWT tokens expire in 7 days based on backend)
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days from now
        set({
          accessToken,
          refreshToken,
          tokenExpiresAt: expiresAt,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Token management helpers
      isTokenExpiringSoon: () => {
        const { tokenExpiresAt } = get();
        if (!tokenExpiresAt) return false;
        // Consider token expiring soon if less than 1 hour remaining
        return Date.now() + 60 * 60 * 1000 > tokenExpiresAt;
      },

      shouldRefreshToken: () => {
        const { accessToken, refreshToken, tokenExpiresAt } = get();
        if (!accessToken || !refreshToken) return false;
        if (!tokenExpiresAt) return true; // If no expiration data, assume we should refresh
        // Refresh if token expires within 30 minutes
        return Date.now() + 30 * 60 * 1000 > tokenExpiresAt;
      },

      logout: async () => {
        try {
          // Try to logout from server
          await authApiService.logout();
        } catch (error) {
          console.warn('Server logout failed:', error);
        } finally {
          // Always clear local state
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            tokenExpiresAt: null,
            error: null,
          });
          // Also clear from localStorage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('last_auth_check');
        }
      },

      // Auth flow methods
      login: async (credentials: LoginCredentials) => {
        const { setLoading, setError, setUser, setTokens } = get();

        try {
          setLoading(true);
          setError(null);

          const data = await authApiService.login(credentials);

          // Update store with user data and tokens
          setUser(data.user);
          setTokens(data.accessToken, data.refreshToken);

          // Store tokens in localStorage if rememberMe is true
          if (credentials.rememberMe) {
            localStorage.setItem('access_token', data.accessToken);
            localStorage.setItem('refresh_token', data.refreshToken);
          }

          set({ isAuthenticated: true });
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Login failed');
          throw error;
        } finally {
          setLoading(false);
        }
      },

      register: async (userData: RegisterData) => {
        const { setLoading, setError, setUser, setTokens } = get();

        try {
          setLoading(true);
          setError(null);

          const data = await authApiService.register(userData);

          // Automatically log in the user after successful registration
          setUser(data.user);
          setTokens(data.accessToken, data.refreshToken);
          set({ isAuthenticated: true });
        } catch (error) {
          setError(
            error instanceof Error ? error.message : 'Registration failed'
          );
          throw error;
        } finally {
          setLoading(false);
        }
      },

      refreshAccessToken: async (): Promise<boolean> => {
        const { refreshToken, setTokens } = get();

        if (!refreshToken) {
          // Silent cleanup without server call
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            tokenExpiresAt: null,
            error: null,
          });
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('last_auth_check');
          return false;
        }

        try {
          const data = await authApiService.refreshToken(refreshToken);
          setTokens(data.accessToken, data.refreshToken);

          // Update localStorage if tokens were stored there
          if (localStorage.getItem('access_token')) {
            localStorage.setItem('access_token', data.accessToken);
            localStorage.setItem('refresh_token', data.refreshToken);
          }

          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Silent cleanup without server call
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            tokenExpiresAt: null,
            error: null,
          });
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('last_auth_check');
          return false;
        }
      },

      checkAuthStatus: async () => {
        const { accessToken, shouldRefreshToken, refreshAccessToken } = get();

        // If no token, just logout silently without server call
        if (!accessToken) {
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            tokenExpiresAt: null,
            error: null,
          });
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth-storage');
          return;
        }

        // If token is expiring soon, refresh it first
        if (shouldRefreshToken()) {
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            return; // refreshAccessToken already handles cleanup on failure
          }
        }

        // Only check with server occasionally, not on every mount
        const lastCheck = localStorage.getItem('last_auth_check');
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (lastCheck && now - parseInt(lastCheck) < fiveMinutes) {
          // Skip server check if we checked recently
          return;
        }

        try {
          const data = await authApiService.getCurrentUser();
          set({
            user: data.user,
            isAuthenticated: true,
          });
          localStorage.setItem('last_auth_check', now.toString());
        } catch (error) {
          console.error('Auth check failed:', error);
          // Try to refresh the token
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            // Silent logout without server call since tokens are invalid
            set({
              user: null,
              isAuthenticated: false,
              accessToken: null,
              refreshToken: null,
              tokenExpiresAt: null,
              error: null,
            });
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('last_auth_check');
            return;
          }

          // Retry getting user data with new token
          try {
            const retryData = await authApiService.getCurrentUser();
            set({
              user: retryData.user,
              isAuthenticated: true,
            });
            localStorage.setItem('last_auth_check', now.toString());
          } catch {
            // Silent logout without server call
            set({
              user: null,
              isAuthenticated: false,
              accessToken: null,
              refreshToken: null,
              tokenExpiresAt: null,
              error: null,
            });
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('last_auth_check');
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenExpiresAt: state.tokenExpiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
