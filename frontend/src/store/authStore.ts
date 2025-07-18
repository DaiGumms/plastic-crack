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

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  clearError: () => void;

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
        set({
          accessToken,
          refreshToken,
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
            error: null,
          });
          // Also clear from localStorage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth-storage');
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
            error: null,
          });
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth-storage');
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
            error: null,
          });
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth-storage');
          return false;
        }
      },

      checkAuthStatus: async () => {
        const { accessToken, setUser } = get();

        // If no token, just logout silently without server call
        if (!accessToken) {
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            error: null,
          });
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth-storage');
          return;
        }

        try {
          const data = await authApiService.getCurrentUser();
          setUser(data.user);
          set({ isAuthenticated: true });
        } catch (error) {
          console.error('Auth check failed:', error);
          // Try to refresh the token
          const refreshed = await get().refreshAccessToken();
          if (!refreshed) {
            // Silent logout without server call since tokens are invalid
            set({
              user: null,
              isAuthenticated: false,
              accessToken: null,
              refreshToken: null,
              error: null,
            });
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('auth-storage');
            return;
          }

          // Retry getting user data with new token
          try {
            const retryData = await authApiService.getCurrentUser();
            setUser(retryData.user);
            set({ isAuthenticated: true });
          } catch {
            // Silent logout without server call
            set({
              user: null,
              isAuthenticated: false,
              accessToken: null,
              refreshToken: null,
              error: null,
            });
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('auth-storage');
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
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
