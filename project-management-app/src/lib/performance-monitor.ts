import { FeatureFlag, useFeatureFlags } from './feature-flags';

// Interface for performance metrics
export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

// Class to handle performance monitoring
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private enabled: boolean = false;

  // Enable or disable the performance monitor
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Start timing a metric
  startMetric(name: string, metadata?: Record<string, any>): string | null {
    if (!this.enabled) return null;
    
    const id = `${name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    this.metrics.push({
      name,
      startTime: performance.now(),
      metadata
    });
    
    return id;
  }

  // End timing a metric
  endMetric(name: string): PerformanceMetric | null {
    if (!this.enabled) return null;
    
    const metricIndex = this.metrics.findIndex(m => m.name === name && !m.endTime);
    if (metricIndex === -1) return null;
    
    const metric = this.metrics[metricIndex];
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    
    // Log the metric to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${metric.name} took ${metric.duration.toFixed(2)}ms`, 
        metric.metadata ? metric.metadata : '');
    }
    
    return metric;
  }

  // Get all metrics
  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = [];
  }

  // Get metrics by name
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  // Get average duration for a specific metric
  getAverageDuration(name: string): number | null {
    const metrics = this.getMetricsByName(name).filter(m => m.duration !== undefined);
    if (metrics.length === 0) return null;
    
    const totalDuration = metrics.reduce((sum, metric) => sum + (metric.duration || 0), 0);
    return totalDuration / metrics.length;
  }
}

// Create a singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance monitoring
export function usePerformanceMonitor() {
  const { isEnabled } = useFeatureFlags();
  const isMonitoringEnabled = isEnabled(FeatureFlag.PERFORMANCE_MONITORING);
  
  // Set the monitor's enabled state based on the feature flag
  performanceMonitor.setEnabled(isMonitoringEnabled);
  
  return {
    startMetric: (name: string, metadata?: Record<string, any>) => 
      performanceMonitor.startMetric(name, metadata),
    endMetric: (name: string) => 
      performanceMonitor.endMetric(name),
    getMetrics: () => 
      performanceMonitor.getMetrics(),
    clearMetrics: () => 
      performanceMonitor.clearMetrics(),
    getMetricsByName: (name: string) => 
      performanceMonitor.getMetricsByName(name),
    getAverageDuration: (name: string) => 
      performanceMonitor.getAverageDuration(name),
  };
}

// Higher-order function to measure function performance
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  metricName: string
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    if (!performanceMonitor.enabled) {
      return fn(...args);
    }
    
    performanceMonitor.startMetric(metricName);
    const result = fn(...args);
    
    // Handle promises
    if (result instanceof Promise) {
      return result
        .then(value => {
          performanceMonitor.endMetric(metricName);
          return value;
        })
        .catch(error => {
          performanceMonitor.endMetric(metricName);
          throw error;
        }) as ReturnType<T>;
    }
    
    performanceMonitor.endMetric(metricName);
    return result;
  };
}
