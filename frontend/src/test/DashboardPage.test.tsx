import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { DashboardPage } from '../pages/DashboardPage';

// Mock the auth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      username: 'testuser',
      displayName: 'Test User',
      email: 'test@example.com',
    },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>{component}</ThemeProvider>
    </BrowserRouter>
  );
};

describe('DashboardPage', () => {
  it('renders welcome message', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/Welcome back, Test User!/)).toBeInTheDocument();
  });

  it('renders collection overview section', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Collection Overview')).toBeInTheDocument();
  });

  it('renders stats cards', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Total Models')).toBeInTheDocument();
    expect(screen.getByText('Painted')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
  });

  it('renders quick actions section', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Add Model')).toBeInTheDocument();
    expect(screen.getByText('Take Photo')).toBeInTheDocument();
    expect(screen.getByText('Browse Deals')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
  });

  it('renders recent activity section', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('renders current projects section', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText('Current Projects')).toBeInTheDocument();
  });
});
