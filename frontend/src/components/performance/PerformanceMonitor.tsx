import React from 'react';
import { usePerformanceMonitor } from '../../utils/performanceUtils';

// Component for displaying performance metrics in development
export const PerformanceDebugger: React.FC = () => {
  usePerformanceMonitor({
    enableLogging: process.env.NODE_ENV === 'development',
  });

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return null;
};
