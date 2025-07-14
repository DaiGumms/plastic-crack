import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { ErrorOutline, Refresh, Home } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Generate a unique event ID for this error
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.setState({
      errorInfo,
      eventId,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log to external service (e.g., Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo, eventId);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && resetKeys.length > 0) {
        const hasResetKeyChanged = resetKeys.some(
          (key, idx) => prevProps.resetKeys?.[idx] !== key
        );

        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
  }

  private logErrorToService = (
    error: Error,
    errorInfo: ErrorInfo,
    eventId: string
  ) => {
    // In a real application, you would send this to your error tracking service
    // For example: Sentry.captureException(error, { extra: errorInfo, tags: { eventId } });

    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      eventId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log('Error report:', errorReport);

    // Store in localStorage for development
    if (process.env.NODE_ENV === 'development') {
      const errors = JSON.parse(localStorage.getItem('errorReports') || '[]');
      errors.push(errorReport);
      localStorage.setItem('errorReports', JSON.stringify(errors.slice(-10))); // Keep last 10 errors
    }
  };

  private resetErrorBoundary = () => {
    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null,
      });
    }, 100);
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  render() {
    const { hasError, error, eventId } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <Container maxWidth='md' sx={{ py: 8 }}>
          <Paper
            elevation={1}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <ErrorOutline
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2,
              }}
            />

            <Typography variant='h4' gutterBottom color='error'>
              Oops! Something went wrong
            </Typography>

            <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
              We're sorry, but something unexpected happened. Our team has been
              notified.
            </Typography>

            {process.env.NODE_ENV === 'development' && error && (
              <Box
                sx={{
                  textAlign: 'left',
                  backgroundColor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  mb: 3,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                <Typography variant='subtitle2' gutterBottom>
                  Error Details (Development Mode):
                </Typography>
                <pre>{error.message}</pre>
                {error.stack && (
                  <details>
                    <summary>Stack Trace</summary>
                    <pre>{error.stack}</pre>
                  </details>
                )}
              </Box>
            )}

            {eventId && (
              <Typography
                variant='caption'
                color='text.disabled'
                sx={{ mb: 3, display: 'block' }}
              >
                Error ID: {eventId}
              </Typography>
            )}

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant='contained'
                startIcon={<Refresh />}
                onClick={this.handleRetry}
              >
                Try Again
              </Button>

              <Button
                variant='outlined'
                startIcon={<Home />}
                onClick={this.handleGoHome}
              >
                Go Home
              </Button>

              <Button variant='text' onClick={this.handleReload}>
                Reload Page
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return children;
  }
}

// Hook for programmatic error reporting
export const useErrorHandler = () => {
  const reportError = (error: Error, context?: Record<string, unknown>) => {
    console.error('Manual error report:', error, context);

    // Log to external service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'development') {
      const errors = JSON.parse(
        localStorage.getItem('manualErrorReports') || '[]'
      );
      errors.push(errorReport);
      localStorage.setItem(
        'manualErrorReports',
        JSON.stringify(errors.slice(-10))
      );
    }
  };

  return { reportError };
};
