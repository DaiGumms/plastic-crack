import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

// Strategic mocking: Mock only the problematic icon imports
vi.mock('@mui/icons-material/Visibility', () => ({
  default: () => <span data-testid='visibility-icon'>👁️</span>,
}));

vi.mock('@mui/icons-material/VisibilityOff', () => ({
  default: () => <span data-testid='visibility-off-icon'>🙈</span>,
}));

vi.mock('@mui/icons-material/PersonAdd', () => ({
  default: () => <span data-testid='person-add-icon'>👤</span>,
}));

// Mock the useAuth hook
const mockRegister = vi.fn();
const mockSetError = vi.fn();
const mockSetLoading = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: mockRegister,
    isLoading: false,
    error: null,
    setError: mockSetError,
    setLoading: mockSetLoading,
  }),
}));

// Import component after mocking
import RegisterForm from '../../components/auth/RegisterForm';

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

describe('RegisterForm Component Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all registration form elements', async () => {
    renderWithProviders(<RegisterForm />);

    // Check for all required form fields
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /display name/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    // Check for form controls
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /terms and conditions/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /privacy policy/i })
    ).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('validates all required fields', async () => {
    renderWithProviders(<RegisterForm />);

    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/display name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithProviders(<RegisterForm />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });
  });

  it('validates display name length', async () => {
    renderWithProviders(<RegisterForm />);

    const displayNameInput = screen.getByRole('textbox', {
      name: /display name/i,
    });
    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });

    // Test too short
    await user.type(displayNameInput, 'a');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/display name must be at least 2 characters/i)
      ).toBeInTheDocument();
    });

    // Clear and test too long
    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'a'.repeat(51));
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/display name must be less than 50 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('validates password strength', async () => {
    renderWithProviders(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });

    // Test weak password
    await user.type(passwordInput, 'weak');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('validates password confirmation match', async () => {
    renderWithProviders(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('requires terms and conditions acceptance', async () => {
    renderWithProviders(<RegisterForm />);

    // Fill valid form data but don't check terms
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const displayNameInput = screen.getByRole('textbox', {
      name: /display name/i,
    });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.type(displayNameInput, 'Test User');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/you must accept the terms and conditions/i)
      ).toBeInTheDocument();
    });
  });

  it('handles successful registration', async () => {
    mockRegister.mockResolvedValueOnce({
      user: { id: '1', email: 'test@example.com', displayName: 'Test User' },
      tokens: { accessToken: 'token123', refreshToken: 'refresh123' },
    });

    renderWithProviders(<RegisterForm />);

    // Fill out the complete form
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const displayNameInput = screen.getByRole('textbox', {
      name: /display name/i,
    });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const termsCheckbox = screen.getByRole('checkbox', {
      name: /terms and conditions/i,
    });
    const privacyCheckbox = screen.getByRole('checkbox', {
      name: /privacy policy/i,
    });
    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.type(displayNameInput, 'Test User');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(termsCheckbox);
    await user.click(privacyCheckbox);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        displayName: 'Test User',
        password: 'Password123',
      });
    });
  });

  it('toggles password visibility for both password fields', async () => {
    renderWithProviders(<RegisterForm />);

    const passwordInput = screen.getByLabelText(
      /^password$/i
    ) as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(
      /confirm password/i
    ) as HTMLInputElement;

    // Check initial state
    expect(passwordInput.type).toBe('password');
    expect(confirmPasswordInput.type).toBe('password');

    // Toggle password visibility
    const passwordToggleButtons = screen.getAllByRole('button', {
      name: /toggle password visibility/i,
    });

    // Toggle first password field
    await user.click(passwordToggleButtons[0]);
    expect(passwordInput.type).toBe('text');

    // Toggle second password field
    await user.click(passwordToggleButtons[1]);
    expect(confirmPasswordInput.type).toBe('text');

    // Toggle back
    await user.click(passwordToggleButtons[0]);
    expect(passwordInput.type).toBe('password');

    await user.click(passwordToggleButtons[1]);
    expect(confirmPasswordInput.type).toBe('password');
  });

  it('shows loading state during registration', async () => {
    mockRegister.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ user: { id: '1' } }), 100)
        )
    );

    renderWithProviders(<RegisterForm />);

    // Fill required fields quickly
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const displayNameInput = screen.getByRole('textbox', {
      name: /display name/i,
    });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const termsCheckbox = screen.getByRole('checkbox', {
      name: /terms and conditions/i,
    });
    const privacyCheckbox = screen.getByRole('checkbox', {
      name: /privacy policy/i,
    });
    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });

    await user.type(emailInput, 'test@example.com');
    await user.type(displayNameInput, 'Test User');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(termsCheckbox);
    await user.click(privacyCheckbox);
    await user.click(submitButton);

    // Check loading state
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('handles registration errors', async () => {
    const errorMessage = 'Email already exists';
    mockRegister.mockRejectedValueOnce(new Error(errorMessage));

    renderWithProviders(<RegisterForm />);

    // Fill complete form
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const displayNameInput = screen.getByRole('textbox', {
      name: /display name/i,
    });
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const termsCheckbox = screen.getByRole('checkbox', {
      name: /terms and conditions/i,
    });
    const privacyCheckbox = screen.getByRole('checkbox', {
      name: /privacy policy/i,
    });
    const submitButton = screen.getByRole('button', {
      name: /create account/i,
    });

    await user.type(emailInput, 'existing@example.com');
    await user.type(displayNameInput, 'Test User');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(termsCheckbox);
    await user.click(privacyCheckbox);
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
