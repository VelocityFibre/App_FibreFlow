import { isFeatureEnabled, FeatureFlag } from './feature-flags';

// Performance measurement utilities
export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private measurements: Map<string, number[]> = new Map();
  private startTimes: Map<string, number> = new Map();

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  // Start measuring an operation
  start(operation: string): void {
    if (!isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) return;
    
    this.startTimes.set(operation, performance.now());
  }

  // End measuring and record the duration
  end(operation: string): number | null {
    if (!isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) return null;
    
    const startTime = this.startTimes.get(operation);
    if (!startTime) return null;

    const duration = performance.now() - startTime;
    
    // Store measurement
    if (!this.measurements.has(operation)) {
      this.measurements.set(operation, []);
    }
    this.measurements.get(operation)?.push(duration);
    
    // Clean up
    this.startTimes.delete(operation);
    
    // Log to console for debugging
    console.log(`⚡ ${operation}: ${duration.toFixed(2)}ms`);
    
    return duration;
  }

  // Reset all measurements
  reset(): void {
    this.measurements.clear();
    this.startTimes.clear();
    console.log('Performance metrics reset');
  }

  // Get statistics for an operation
  getStats(operation: string): {
    average: number;
    min: number;
    max: number;
    count: number;
    latest: number;
  } | null {
    const measurements = this.measurements.get(operation);
    if (!measurements || measurements.length === 0) return null;

    return {
      average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length,
      latest: measurements[measurements.length - 1]
    };
  }

  // Get all collected measurements
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    for (const [operation, measurements] of this.measurements.entries()) {
      if (measurements.length > 0) {
        stats[operation] = this.getStats(operation);
      }
    }
    return stats;
  }

  // Clear all measurements
  clear(): void {
    this.measurements.clear();
    this.startTimes.clear();
  }

  // Export measurements as JSON
  export(): string {
    return JSON.stringify(this.getAllStats(), null, 2);
  }
}

// Singleton instance
export const perfTracker = PerformanceTracker.getInstance();

// Utility functions for common measurements
export function measureAsync<T>(
  operation: string,
  asyncFn: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    perfTracker.start(operation);
    try {
      const result = await asyncFn();
      perfTracker.end(operation);
      resolve(result);
    } catch (error) {
      perfTracker.end(operation);
      console.error(`Error in ${operation}:`, error);
      reject(error);
    }
  });
}

export function measureSync<T>(operation: string, syncFn: () => T): T {
  perfTracker.start(operation);
  const result = syncFn();
  perfTracker.end(operation);
  return result;
}

// React Hook for performance tracking
export function usePerformanceTracker() {
  return {
    start: (operation: string) => perfTracker.start(operation),
    end: (operation: string) => perfTracker.end(operation),
    getStats: (operation: string) => perfTracker.getStats(operation),
    getAllStats: () => perfTracker.getAllStats(),
    clear: () => perfTracker.clear(),
    export: () => perfTracker.export(),
  };
}

// Browser performance API utilities
export function measurePageLoad(): Promise<PerformanceNavigationTiming | null> {
  return new Promise((resolve) => {
    // Wait for page to load completely
    if (document.readyState === 'complete') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      resolve(navigation);
    } else {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        resolve(navigation);
      });
    }
  });
}

// Memory usage measurement
export function measureMemoryUsage(): any {
  if ('memory' in performance) {
    return {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
    };
  }
  return null;
}

// Network timing measurement
export function measureNetworkRequests(): PerformanceResourceTiming[] {
  return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
}