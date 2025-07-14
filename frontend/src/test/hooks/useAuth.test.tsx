import React, { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the authStore with flexible typing
const mockAuthStore = {
  user: null,
  token: null,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
  setUser: vi.fn(),
  clearAuth: vi.fn(),
} as {
  user: unknown;
  token: unknown;
  isAuthenticated: boolean;
  login: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  setUser: ReturnType<typeof vi.fn>;
  clearAuth: ReturnType<typeof vi.fn>;
};

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Mock the auth service
const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
};

vi.mock('../../services/authService', () => ({
  authService: mockAuthService,
}));

import { useAuth } from '../../hooks/useAuth';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock store state
    mockAuthStore.user = null;
    mockAuthStore.token = null;
    mockAuthStore.isAuthenticated = false;
  });

  it('returns initial state when not authenticated', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('provides login function', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
    };
    mockAuthService.login.mockResolvedValueOnce({
      user: mockUser,
      token: 'fake-token',
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      result.current.login({
        emailOrUsername: 'test@example.com',
        password: 'password',
      });
    });

    expect(mockAuthService.login).toHaveBeenCalledWith({
      emailOrUsername: 'test@example.com',
      password: 'password',
    });
  });

  it('provides register function', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
    };
    mockAuthService.register.mockResolvedValueOnce({
      user: mockUser,
      token: 'fake-token',
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      result.current.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        displayName: 'Test User',
      });
    });

    expect(mockAuthService.register).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      displayName: 'Test User',
    });
  });

  it('provides logout function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    result.current.logout();

    expect(mockAuthStore.logout).toHaveBeenCalled();
  });

  it('returns authenticated state when user is logged in', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
    };
    mockAuthStore.user = mockUser;
    mockAuthStore.token = 'fake-token';
    mockAuthStore.isAuthenticated = true;

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles login errors', async () => {
    const loginError = new Error('Invalid credentials');
    mockAuthService.login.mockRejectedValueOnce(loginError);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    try {
      await result.current.login({
        emailOrUsername: 'test@example.com',
        password: 'wrong',
      });
    } catch (error) {
      expect(error).toBe(loginError);
    }
  });

  it('handles register errors', async () => {
    const registerError = new Error('Email already exists');
    mockAuthService.register.mockRejectedValueOnce(registerError);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    try {
      await result.current.register({
        username: 'testuser',
        email: 'existing@example.com',
        password: 'Password123!',
        displayName: 'Test User',
      });
    } catch (error) {
      expect(error).toBe(registerError);
    }
  });
});
