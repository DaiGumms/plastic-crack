import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router';

// Mock useAuth hook
const mockUseAuth = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

import { ProtectedRoute, PublicRoute } from '../../components/auth/RouteGuards';

const TestComponent = () => <div>Test Content</div>;
const LoginComponent = () => <div>Login Page</div>;

const renderWithRouter = (component: React.ReactElement, initialPath = '/') => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<LoginComponent />} />
        <Route path='/' element={component} />
      </Routes>
    </BrowserRouter>
  );
};

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', username: 'testuser' },
      isLoading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows loading state while checking authentication', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });

    // Mock window.location to track navigation
    const mockLocation = { replace: vi.fn() };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    // Should not render the protected content
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });
});

describe('PublicRoute', () => {
  it('renders children when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });

    renderWithRouter(
      <PublicRoute>
        <TestComponent />
      </PublicRoute>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('redirects authenticated users away from public routes', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', username: 'testuser' },
      isLoading: false,
    });

    renderWithRouter(
      <PublicRoute>
        <TestComponent />
      </PublicRoute>
    );

    // Should not render the public content for authenticated users
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('shows loading state while checking authentication', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: true,
    });

    renderWithRouter(
      <PublicRoute>
        <TestComponent />
      </PublicRoute>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('allows authenticated users when redirectIfAuthenticated is false', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', username: 'testuser' },
      isLoading: false,
    });

    renderWithRouter(
      <PublicRoute redirectIfAuthenticated={false}>
        <TestComponent />
      </PublicRoute>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
