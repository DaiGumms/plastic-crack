import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  fps?: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
  });

  useEffect(() => {
    if (!enabled) return;

    // Measure page load time
    const measureLoadTime = () => {
      if (performance.timing) {
        const loadTime =
          performance.timing.loadEventEnd - performance.timing.navigationStart;
        setMetrics(prev => ({ ...prev, loadTime }));
      }
    };

    // Measure memory usage (if available)
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (
          performance as Performance & { memory: { usedJSHeapSize: number } }
        ).memory;
        const memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    // Measure FPS
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    // Initial measurements
    measureLoadTime();
    measureMemory();
    measureFPS();

    // Update memory periodically
    const memoryInterval = setInterval(measureMemory, 5000);

    return () => {
      clearInterval(memoryInterval);
    };
  }, [enabled]);

  if (!enabled) return null;

  const getPositionStyle = () => {
    const base = {
      position: 'fixed' as const,
      zIndex: 9999,
      padding: 1,
    };

    switch (position) {
      case 'top-left':
        return { ...base, top: 16, left: 16 };
      case 'top-right':
        return { ...base, top: 16, right: 16 };
      case 'bottom-left':
        return { ...base, bottom: 16, left: 16 };
      case 'bottom-right':
      default:
        return { ...base, bottom: 16, right: 16 };
    }
  };

  const getMetricColor = (
    value: number,
    type: 'loadTime' | 'fps' | 'memory'
  ) => {
    switch (type) {
      case 'loadTime':
        if (value < 1000) return 'success';
        if (value < 3000) return 'warning';
        return 'error';
      case 'fps':
        if (value >= 55) return 'success';
        if (value >= 30) return 'warning';
        return 'error';
      case 'memory':
        if (value < 50) return 'success';
        if (value < 100) return 'warning';
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={getPositionStyle()} elevation={3}>
      <Box sx={{ minWidth: 200 }}>
        <Typography
          variant='caption'
          sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}
        >
          Performance Monitor
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {metrics.loadTime > 0 && (
            <Chip
              label={`Load: ${metrics.loadTime}ms`}
              size='small'
              color={getMetricColor(metrics.loadTime, 'loadTime')}
              variant='outlined'
            />
          )}

          {metrics.fps && (
            <Chip
              label={`FPS: ${metrics.fps}`}
              size='small'
              color={getMetricColor(metrics.fps, 'fps')}
              variant='outlined'
            />
          )}

          {metrics.memoryUsage && (
            <Chip
              label={`Memory: ${metrics.memoryUsage.toFixed(1)}MB`}
              size='small'
              color={getMetricColor(metrics.memoryUsage, 'memory')}
              variant='outlined'
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default PerformanceMonitor;
