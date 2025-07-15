import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

interface PerformanceConfig {
  enableLogging?: boolean;
  enableAnalytics?: boolean;
  thresholds?: {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
  };
}

const defaultConfig: PerformanceConfig = {
  enableLogging: process.env.NODE_ENV === 'development',
  enableAnalytics: process.env.NODE_ENV === 'production',
  thresholds: {
    fcp: 1800, // 1.8s
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1, // 0.1
  },
};

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private config: PerformanceConfig;
  private observer?: PerformanceObserver;

  constructor(config: PerformanceConfig = defaultConfig) {
    this.config = { ...defaultConfig, ...config };
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.observeWebVitals();

    // Monitor navigation timing
    this.observeNavigationTiming();

    // Monitor resource timing
    this.observeResourceTiming();
  }

  private observeWebVitals() {
    if (!('PerformanceObserver' in window)) return;

    // First Contentful Paint & Largest Contentful Paint
    const paintObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
          this.logMetric('FCP', entry.startTime, this.config.thresholds!.fcp);
        }
      }
    });

    paintObserver.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      this.logMetric('LCP', lastEntry.startTime, this.config.thresholds!.lcp);
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        // @ts-expect-error - processingStart is not in the types yet
        const fid = entry.processingStart - entry.startTime;
        this.metrics.fid = fid;
        this.logMetric('FID', fid, this.config.thresholds!.fid);
      }
    });

    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        // @ts-expect-error - value and hadRecentInput not in LayoutShift types yet
        if (!entry.hadRecentInput) {
          // @ts-expect-error - value property not in LayoutShift types yet
          clsValue += entry.value;
        }
      }
      this.metrics.cls = clsValue;
      this.logMetric('CLS', clsValue, this.config.thresholds!.cls);
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }

  private observeNavigationTiming() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
        this.logMetric('TTFB', this.metrics.ttfb, 200);
      }
    });
  }

  private observeResourceTiming() {
    if (!('PerformanceObserver' in window)) return;

    const resourceObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;

        // Log slow resources
        if (resource.duration > 1000) {
          console.warn(
            `Slow resource detected: ${resource.name} took ${resource.duration.toFixed(2)}ms`
          );
        }

        // Track large resources
        if (resource.transferSize > 1024 * 1024) {
          // > 1MB
          console.warn(
            `Large resource detected: ${resource.name} size: ${(resource.transferSize / 1024 / 1024).toFixed(2)}MB`
          );
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
  }

  private logMetric(name: string, value: number, threshold: number) {
    if (!this.config.enableLogging) return;

    const status = value <= threshold ? '✅' : '❌';
    const color = value <= threshold ? 'color: green' : 'color: red';

    console.log(
      `%c${status} ${name}: ${value.toFixed(2)}ms (threshold: ${threshold}ms)`,
      color
    );

    // Send to analytics if enabled
    if (this.config.enableAnalytics) {
      this.sendToAnalytics(name, value, threshold);
    }
  }

  private sendToAnalytics(metric: string, value: number, threshold: number) {
    // In a real application, you would send this to your analytics service
    // For example: Google Analytics, Mixpanel, or custom analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
      gtag('event', 'web_vitals', {
        metric_name: metric,
        metric_value: Math.round(value),
        metric_threshold: threshold,
        is_good: value <= threshold,
      });
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// React Hook for performance monitoring
export const usePerformanceMonitor = (config?: PerformanceConfig) => {
  useEffect(() => {
    const monitor = new PerformanceMonitor(config);

    return () => {
      monitor.disconnect();
    };
  }, [config]);
};

// Utility functions for manual performance tracking
export const markPerformanceStart = (label: string) => {
  if (typeof performance !== 'undefined') {
    performance.mark(`${label}-start`);
  }
};

export const markPerformanceEnd = (label: string, logResult = true) => {
  if (typeof performance !== 'undefined') {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);

    if (logResult) {
      const measure = performance.getEntriesByName(label)[0];
      console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);
    }
  }
};
