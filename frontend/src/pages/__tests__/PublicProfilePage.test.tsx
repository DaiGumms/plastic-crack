import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { vi } from 'vitest';
import { PublicProfilePage } from '../PublicProfilePage';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/userService';
import type { PublicUserProfile } from '../../types';

// Mock dependencies
vi.mock('../../store/authStore');
vi.mock('../../services/userService');
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useParams: () => ({ userId: 'user123' }),
}));

const mockUseAuthStore = vi.mocked(useAuthStore);
const mockUserService = vi.mocked(userService);

const mockPublicProfile: PublicUserProfile = {
  id: 'user123',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  bio: 'This is a test user bio',
  location: 'Test City',
  website: 'https://testuser.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2023-01-01T00:00:00Z',
  isEmailVerified: true,
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const theme = createTheme();

  return render(
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{component}</BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

describe('PublicProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: {
        id: 'currentuser',
        email: 'current@example.com',
        username: 'currentuser',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  });

  it('renders loading state initially', () => {
    mockUserService.getPublicProfile.mockImplementation(
      () => new Promise(() => {})
    );
    mockUserService.getFollowStatus.mockImplementation(
      () => new Promise(() => {})
    );

    renderWithProviders(<PublicProfilePage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders public profile information correctly', async () => {
    mockUserService.getPublicProfile.mockResolvedValue(mockPublicProfile);
    mockUserService.getFollowStatus.mockResolvedValue({
      isFollowing: false,
      followersCount: 10,
      followingCount: 5,
    });

    renderWithProviders(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Test User');
    });

    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByTestId('profile-bio')).toHaveTextContent(
      'This is a test user bio'
    );
    expect(screen.getByTestId('profile-location')).toHaveTextContent(
      'Test City'
    );
    expect(screen.getByTestId('profile-website')).toHaveTextContent(
      'https://testuser.com'
    );
    expect(screen.getByText('Member since January 2023')).toBeInTheDocument();
    expect(screen.getByText('Email Verified')).toBeInTheDocument();
  });

  it('shows follow button for authenticated users', async () => {
    mockUserService.getPublicProfile.mockResolvedValue(mockPublicProfile);
    mockUserService.getFollowStatus.mockResolvedValue({
      isFollowing: false,
      followersCount: 10,
      followingCount: 5,
    });

    renderWithProviders(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('follow-button')).toBeInTheDocument();
    });

    expect(screen.getByTestId('follow-button')).toHaveTextContent('Follow');
  });

  it('shows unfollow button when already following', async () => {
    mockUserService.getPublicProfile.mockResolvedValue(mockPublicProfile);
    mockUserService.getFollowStatus.mockResolvedValue({
      isFollowing: true,
      followersCount: 10,
      followingCount: 5,
    });

    renderWithProviders(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('follow-button')).toHaveTextContent('Unfollow');
    });
  });

  it('handles follow action correctly', async () => {
    mockUserService.getPublicProfile.mockResolvedValue(mockPublicProfile);
    mockUserService.getFollowStatus.mockResolvedValue({
      isFollowing: false,
      followersCount: 10,
      followingCount: 5,
    });
    mockUserService.followUser.mockResolvedValue();

    renderWithProviders(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('follow-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('follow-button'));

    await waitFor(() => {
      expect(mockUserService.followUser).toHaveBeenCalledWith('user123');
    });
  });

  it('handles unfollow action correctly', async () => {
    mockUserService.getPublicProfile.mockResolvedValue(mockPublicProfile);
    mockUserService.getFollowStatus.mockResolvedValue({
      isFollowing: true,
      followersCount: 10,
      followingCount: 5,
    });
    mockUserService.unfollowUser.mockResolvedValue();

    renderWithProviders(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('follow-button')).toHaveTextContent('Unfollow');
    });

    fireEvent.click(screen.getByTestId('follow-button'));

    await waitFor(() => {
      expect(mockUserService.unfollowUser).toHaveBeenCalledWith('user123');
    });
  });

  it('does not show follow button for unauthenticated users', async () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    mockUserService.getPublicProfile.mockResolvedValue(mockPublicProfile);

    renderWithProviders(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-name')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('follow-button')).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /Some profile information is only visible to registered users/
      )
    ).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockUserService.getPublicProfile.mockRejectedValue(
      new Error('Profile not found')
    );

    renderWithProviders(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Profile not found')).toBeInTheDocument();
    });
  });

  it('shows minimal information when optional fields are missing', async () => {
    const minimalProfile: PublicUserProfile = {
      id: 'user123',
      username: 'testuser',
      createdAt: '2023-01-01T00:00:00Z',
      isEmailVerified: false,
    };

    mockUserService.getPublicProfile.mockResolvedValue(minimalProfile);
    mockUserService.getFollowStatus.mockResolvedValue({
      isFollowing: false,
      followersCount: 0,
      followingCount: 0,
    });

    renderWithProviders(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-name')).toHaveTextContent('testuser');
    });

    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('Member since January 2023')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-bio')).not.toBeInTheDocument();
    expect(screen.queryByTestId('profile-location')).not.toBeInTheDocument();
    expect(screen.queryByTestId('profile-website')).not.toBeInTheDocument();
    expect(screen.queryByText('Email Verified')).not.toBeInTheDocument();
  });

  it('generates correct initials for users without avatar', async () => {
    const profileWithoutAvatar: PublicUserProfile = {
      ...mockPublicProfile,
      avatarUrl: undefined,
    };

    mockUserService.getPublicProfile.mockResolvedValue(profileWithoutAvatar);
    mockUserService.getFollowStatus.mockResolvedValue({
      isFollowing: false,
      followersCount: 0,
      followingCount: 0,
    });

    renderWithProviders(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-avatar')).toHaveTextContent('TU');
    });
  });

  it('handles missing user ID gracefully', async () => {
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useParams: () => ({ userId: undefined }),
    }));

    renderWithProviders(<PublicProfilePage userId={undefined} />);

    await waitFor(() => {
      expect(screen.getByText('User ID is required')).toBeInTheDocument();
    });
  });
});
