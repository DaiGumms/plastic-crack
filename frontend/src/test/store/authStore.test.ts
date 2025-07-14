import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the auth API service
const mockAuthApiService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  refreshToken: vi.fn(),
};

vi.mock('../../services/authApiService', () => ({
  default: mockAuthApiService,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('initializes with default state', async () => {
    // Import after mocking
    const { useAuthStore } = await import('../../store/authStore');

    const store = useAuthStore.getState();

    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.accessToken).toBeNull();
    expect(store.refreshToken).toBeNull();
  });

  it('sets user correctly', async () => {
    const { useAuthStore } = await import('../../store/authStore');

    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      displayName: 'Test User',
      isEmailVerified: true,
      role: 'USER' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('sets tokens correctly', async () => {
    const { useAuthStore } = await import('../../store/authStore');

    const accessToken = 'fake-access-token';
    const refreshToken = 'fake-refresh-token';

    useAuthStore.getState().setTokens(accessToken, refreshToken);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(accessToken);
    expect(state.refreshToken).toBe(refreshToken);
  });

  it('clears auth state on logout', async () => {
    const { useAuthStore } = await import('../../store/authStore');

    // Set some initial state
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      displayName: 'Test User',
      isEmailVerified: true,
      role: 'USER' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setTokens('access', 'refresh');

    // Clear auth using logout
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it('handles loading state', async () => {
    const { useAuthStore } = await import('../../store/authStore');

    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);

    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('handles error state', async () => {
    const { useAuthStore } = await import('../../store/authStore');

    const errorMessage = 'Something went wrong';

    useAuthStore.getState().setError(errorMessage);
    expect(useAuthStore.getState().error).toBe(errorMessage);

    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
