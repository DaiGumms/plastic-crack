import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

// Strategic mocking: Mock only the problematic icon imports, keep core Material-UI
vi.mock('@mui/icons-material/Visibility', () => ({
  default: () => <span data-testid='visibility-icon'>👁️</span>,
}));

vi.mock('@mui/icons-material/VisibilityOff', () => ({
  default: () => <span data-testid='visibility-off-icon'>🙈</span>,
}));

vi.mock('@mui/icons-material/Login', () => ({
  default: () => <span data-testid='login-icon'>🔐</span>,
}));

// Mock the useAuth hook with realistic behavior
const mockLogin = vi.fn();
const mockSetError = vi.fn();
const mockSetLoading = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: mockLogin,
    logout: vi.fn(),
    register: vi.fn(),
    isLoading: false,
    error: null,
    setError: mockSetError,
    setLoading: mockSetLoading,
  }),
}));

// Import component after mocking
import LoginForm from '../../components/auth/LoginForm';

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

describe('LoginForm Component Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form elements correctly', async () => {
    renderWithProviders(<LoginForm />);

    // Check for form structure
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();

    // Check for additional form elements
    expect(
      screen.getByRole('checkbox', { name: /remember me/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /forgot password/i })
    ).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderWithProviders(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Material-UI validation should show errors
    await waitFor(() => {
      expect(
        screen.getByText(/email or username is required/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email format', async () => {
    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });
  });

  it('handles successful form submission', async () => {
    mockLogin.mockResolvedValueOnce({
      user: { id: '1', email: 'test@example.com' },
      tokens: { accessToken: 'token123', refreshToken: 'refresh123' },
    });

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        emailOrUsername: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
    });
  });

  it('handles login errors gracefully', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    renderWithProviders(<LoginForm />);

    const passwordInput = screen.getByLabelText(
      /password/i
    ) as HTMLInputElement;

    // Initially password should be hidden
    expect(passwordInput.type).toBe('password');
    expect(screen.getByTestId('visibility-icon')).toBeInTheDocument();

    // Click to show password
    const toggleButton = screen.getByRole('button', {
      name: /toggle password visibility/i,
    });
    await user.click(toggleButton);

    expect(passwordInput.type).toBe('text');
    expect(screen.getByTestId('visibility-off-icon')).toBeInTheDocument();

    // Click to hide password again
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
    expect(screen.getByTestId('visibility-icon')).toBeInTheDocument();
  });

  it('remembers user preference with remember me checkbox', async () => {
    mockLogin.mockResolvedValueOnce({
      user: { id: '1', email: 'test@example.com' },
    });

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberMeCheckbox = screen.getByRole('checkbox', {
      name: /remember me/i,
    });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(rememberMeCheckbox);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        emailOrUsername: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      });
    });
  });

  it('shows loading state during submission', async () => {
    // Mock a delayed response
    mockLogin.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ user: { id: '1' } }), 100)
        )
    );

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Check for loading state
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('handles network errors appropriately', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
