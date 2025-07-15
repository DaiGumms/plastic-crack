import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';

// Create a test theme
const testTheme = createTheme();

// Create test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

// Custom render function with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={testTheme}>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );

  const user = userEvent.setup();

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Mock server response helpers
export const mockApiResponse = {
  success: function <T>(data: T) {
    return {
      data,
      success: true,
      message: 'Success',
    };
  },
  error: (message: string, code = 400) => ({
    error: message,
    success: false,
    code,
  }),
};

// Common test data factories
export const createTestUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  avatar: null,
  bio: 'Test bio',
  location: 'Test Location',
  website: 'https://test.com',
  isVerified: false,
  role: 'USER' as const,
  preferences: {
    notifications: {
      email: true,
      push: false,
    },
    privacy: {
      profileVisibility: 'PUBLIC' as const,
      showEmail: false,
    },
  },
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createTestBetaInterest = (overrides = {}) => ({
  email: 'test@example.com',
  name: 'Test User',
  interests: ['collection-management', 'painting-guides'],
  submittedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

// Form testing helpers
export const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  formData: Record<string, string>
) => {
  for (const [fieldName, value] of Object.entries(formData)) {
    const field = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
    if (field) {
      await user.clear(field);
      await user.type(field, value);
    }
  }
};

// Accessibility testing helpers
export const expectToBeAccessible = async (container: HTMLElement) => {
  const { axe } = await import('@axe-core/react');
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Wait for loading states to complete
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 100));
};

// Custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): R;
      toHaveNoAxeViolations(): R;
    }
  }
}

// Error boundary for testing
export const TestErrorBoundary: React.FC<{
  children: React.ReactNode;
  onError?: (error: Error) => void;
}> = ({ children, onError }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    onError?.(error as Error);
    return <div data-testid="error-boundary">Error occurred</div>;
  }
};
