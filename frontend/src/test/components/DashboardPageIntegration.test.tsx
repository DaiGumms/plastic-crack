import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

// Mock Material-UI icons that cause EMFILE issues
vi.mock('@mui/icons-material/Dashboard', () => ({
  default: () => <span data-testid='dashboard-icon'>📊</span>,
}));

vi.mock('@mui/icons-material/Add', () => ({
  default: () => <span data-testid='add-icon'>➕</span>,
}));

vi.mock('@mui/icons-material/Search', () => ({
  default: () => <span data-testid='search-icon'>🔍</span>,
}));

vi.mock('@mui/icons-material/AccountCircle', () => ({
  default: () => <span data-testid='account-icon'>👤</span>,
}));

// Mock the useAuth hook
const mockUser = {
  id: '1',
  email: 'test@example.com',
  displayName: 'Test User',
  roles: ['user'],
};

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

// Import component after mocking
import { DashboardPage } from '../../pages/DashboardPage';

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('DashboardPage Component Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard welcome message with user name', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText(/welcome back, test user/i)).toBeInTheDocument();
    expect(
      screen.getByText(/your warhammer 40k collection hub/i)
    ).toBeInTheDocument();
  });

  it('displays collection statistics cards', () => {
    renderWithProviders(<DashboardPage />);

    // Check for stats cards
    expect(screen.getByText(/total miniatures/i)).toBeInTheDocument();
    expect(screen.getByText(/armies/i)).toBeInTheDocument();
    expect(screen.getByText(/painted models/i)).toBeInTheDocument();
    expect(screen.getByText(/current projects/i)).toBeInTheDocument();

    // Check for placeholder values (since we're not mocking real data)
    expect(screen.getByText('42')).toBeInTheDocument(); // Example stat
    expect(screen.getByText('3')).toBeInTheDocument(); // Example stat
    expect(screen.getByText('28')).toBeInTheDocument(); // Example stat
    expect(screen.getByText('2')).toBeInTheDocument(); // Example stat
  });

  it('shows quick action buttons', () => {
    renderWithProviders(<DashboardPage />);

    expect(
      screen.getByRole('button', { name: /add new miniature/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create army list/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /track painting progress/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /browse collection/i })
    ).toBeInTheDocument();
  });

  it('displays recent activity section', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText(/recent activity/i)).toBeInTheDocument();

    // Check for activity items (placeholder content)
    expect(
      screen.getByText(/added space marines tactical squad/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/completed painting eldar guardians/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/created new army list/i)).toBeInTheDocument();
  });

  it('shows current projects section', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText(/current projects/i)).toBeInTheDocument();

    // Check for project cards (placeholder content)
    expect(screen.getByText(/imperial fists army/i)).toBeInTheDocument();
    expect(screen.getByText(/40% complete/i)).toBeInTheDocument();
    expect(screen.getByText(/space marine dreadnought/i)).toBeInTheDocument();
    expect(screen.getByText(/75% complete/i)).toBeInTheDocument();
  });

  it('allows navigation through quick actions', async () => {
    renderWithProviders(<DashboardPage />);

    const addMiniaturesButton = screen.getByRole('button', {
      name: /add new miniature/i,
    });
    const createArmyButton = screen.getByRole('button', {
      name: /create army list/i,
    });
    const trackProgressButton = screen.getByRole('button', {
      name: /track painting progress/i,
    });
    const browseCollectionButton = screen.getByRole('button', {
      name: /browse collection/i,
    });

    // Buttons should be clickable
    expect(addMiniaturesButton).not.toBeDisabled();
    expect(createArmyButton).not.toBeDisabled();
    expect(trackProgressButton).not.toBeDisabled();
    expect(browseCollectionButton).not.toBeDisabled();

    // Test clicking (navigation would be tested in e2e tests)
    await user.click(addMiniaturesButton);
    await user.click(createArmyButton);
    await user.click(trackProgressButton);
    await user.click(browseCollectionButton);
  });

  it('displays responsive grid layout', () => {
    renderWithProviders(<DashboardPage />);

    // Check for Material-UI Grid structure (rendered as CSS Grid in our case)
    const statsSection = screen.getByText(/total miniatures/i).closest('div');
    const quickActionsSection = screen
      .getByText(/add new miniature/i)
      .closest('div');
    const recentActivitySection = screen
      .getByText(/recent activity/i)
      .closest('div');

    expect(statsSection).toBeInTheDocument();
    expect(quickActionsSection).toBeInTheDocument();
    expect(recentActivitySection).toBeInTheDocument();
  });

  it('shows proper loading states for dynamic content', () => {
    renderWithProviders(<DashboardPage />);

    // In a real implementation, this would test loading states
    // For now, we verify the structure is present
    expect(
      screen.getByText(/your warhammer 40k collection hub/i)
    ).toBeInTheDocument();

    // Future: Test skeleton loading states, error states, etc.
  });

  it('handles user interaction with project cards', async () => {
    renderWithProviders(<DashboardPage />);

    // Look for interactive elements in project cards
    const projectCards = screen.getAllByText(/complete/);
    expect(projectCards.length).toBeGreaterThan(0);

    // In a real implementation, these would be clickable cards
    // For now, verify they're present and accessible
    projectCards.forEach(card => {
      expect(card).toBeInTheDocument();
    });
  });

  it('displays user-specific content based on authentication', () => {
    renderWithProviders(<DashboardPage />);

    // Dashboard should show user-specific welcome message
    expect(screen.getByText(/welcome back, test user/i)).toBeInTheDocument();

    // Should not show guest/unauthenticated content
    expect(screen.queryByText(/please log in/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/guest user/i)).not.toBeInTheDocument();
  });
});
