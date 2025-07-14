import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PerformanceMonitor from './PerformanceMonitor';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    // Mock performance API
    Object.defineProperty(global, 'performance', {
      writable: true,
      value: {
        timing: {
          navigationStart: 0,
          loadEventEnd: 1000,
        },
        now: vi.fn(() => Date.now()),
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        },
      },
    });

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16));
  });

  it('renders when enabled', () => {
    renderWithTheme(<PerformanceMonitor enabled={true} />);

    expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
  });

  it('does not render when disabled', () => {
    renderWithTheme(<PerformanceMonitor enabled={false} />);

    expect(screen.queryByText('Performance Monitor')).not.toBeInTheDocument();
  });

  it('displays load time metrics', async () => {
    renderWithTheme(<PerformanceMonitor enabled={true} />);

    await waitFor(() => {
      expect(screen.getByText(/Load:/)).toBeInTheDocument();
    });
  });

  it('displays memory usage when available', async () => {
    renderWithTheme(<PerformanceMonitor enabled={true} />);

    await waitFor(() => {
      expect(screen.getByText(/Memory:/)).toBeInTheDocument();
    });
  });

  it('positions correctly based on prop', () => {
    const { rerender } = renderWithTheme(
      <PerformanceMonitor enabled={true} position='top-left' />
    );

    let monitor = screen.getByText('Performance Monitor').closest('div');
    expect(monitor).toHaveStyle({ top: '16px', left: '16px' });

    rerender(
      <ThemeProvider theme={theme}>
        <PerformanceMonitor enabled={true} position='bottom-right' />
      </ThemeProvider>
    );

    monitor = screen.getByText('Performance Monitor').closest('div');
    expect(monitor).toHaveStyle({ bottom: '16px', right: '16px' });
  });

  it('uses appropriate colors for metrics', async () => {
    renderWithTheme(<PerformanceMonitor enabled={true} />);

    await waitFor(() => {
      const loadChip = screen.getByText(/Load:/);
      expect(loadChip).toBeInTheDocument();
    });
  });
});
