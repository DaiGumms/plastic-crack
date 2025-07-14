import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';

// Mock component that throws errors for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary');
  }
  return <div>No error</div>;
};

const theme = createTheme();

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Phase 5 Integration Tests', () => {
  beforeEach(() => {
    // Mock console.error to avoid error logs in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Error Handling Integration', () => {
    it('catches and displays component errors', () => {
      const TestWrapper = createTestWrapper();

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('allows error recovery by clicking retry', () => {
      const TestWrapper = createTestWrapper();

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Error should be caught
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();

      // Click retry button - this will reset the error boundary
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      // Error boundary should try to re-render the children
      expect(retryButton).toBeInTheDocument();
    });

    it('shows development details in development mode', () => {
      const TestWrapper = createTestWrapper();

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should show error message
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();

      // In development, should show details button
      const detailsButton = screen.getByText('Show Details');
      expect(detailsButton).toBeInTheDocument();

      // Click to show details
      fireEvent.click(detailsButton);

      // Should show error details
      expect(
        screen.getByText(/Test error for ErrorBoundary/)
      ).toBeInTheDocument();
    });

    it('provides accessibility features', () => {
      const TestWrapper = createTestWrapper();

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      const retryButton = screen.getByText('Try Again');

      // Retry button should be focusable
      retryButton.focus();
      expect(retryButton).toHaveFocus();

      // Should have proper ARIA attributes
      expect(retryButton).toHaveAttribute('type', 'button');
    });

    it('calls error reporting callback when provided', () => {
      const onError = vi.fn();
      const TestWrapper = createTestWrapper();

      render(
        <TestWrapper>
          <ErrorBoundary onError={onError}>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Error callback should be called
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error for ErrorBoundary',
        }),
        expect.any(Object)
      );
    });
  });

  describe('Component Integration', () => {
    it('renders normal content when no errors occur', () => {
      const TestWrapper = createTestWrapper();

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(
        screen.queryByText(/Something went wrong/)
      ).not.toBeInTheDocument();
    });

    it('handles nested error boundaries', () => {
      const TestWrapper = createTestWrapper();

      render(
        <TestWrapper>
          <ErrorBoundary>
            <div>
              <h1>Outer content</h1>
              <ErrorBoundary>
                <ThrowError shouldThrow={true} />
              </ErrorBoundary>
            </div>
          </ErrorBoundary>
        </TestWrapper>
      );

      // Inner error boundary should catch the error
      expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
      // Outer content should still be visible
      expect(screen.getByText('Outer content')).toBeInTheDocument();
    });
  });
});
