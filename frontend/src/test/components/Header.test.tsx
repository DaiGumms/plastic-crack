import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import userEvent from '@testing-library/user-event';

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

import { Header } from '../../components/layout/Header';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Header Component', () => {
  it('renders the header with app title', () => {
    renderWithRouter(<Header />);

    expect(screen.getByText(/plastic crack/i)).toBeInTheDocument();
  });

  it('shows login and register links when not authenticated', () => {
    renderWithRouter(<Header />);

    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

  it('has proper navigation structure', () => {
    renderWithRouter(<Header />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('is accessible with proper ARIA labels', () => {
    renderWithRouter(<Header />);

    const logoLink = screen.getByRole('link', { name: /plastic crack/i });
    expect(logoLink).toBeInTheDocument();
  });

  it('has responsive mobile menu button', () => {
    renderWithRouter(<Header />);

    // Mobile menu button should be present (may be hidden on desktop)
    const menuButton = screen.getByRole('button', { name: /menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('mobile menu can be toggled', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header />);

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    // After clicking, the menu should show navigation items
    expect(screen.getByText(/home/i)).toBeInTheDocument();
  });
});
