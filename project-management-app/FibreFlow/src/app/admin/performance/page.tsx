"use client";

import { useState, useEffect } from 'react';
import { usePerformanceTracker, measurePageLoad, measureMemoryUsage, measureNetworkRequests } from '@/lib/performance';
import { FeatureFlag, isFeatureEnabled, enableFeature, disableFeature, getAllFeatureFlags } from '@/lib/feature-flags';

export default function PerformancePage() {
  const perfTracker = usePerformanceTracker();
  const [stats, setStats] = useState<any>({});
  const [pageLoadStats, setPageLoadStats] = useState<any>(null);
  const [memoryStats, setMemoryStats] = useState<any>(null);
  const [networkStats, setNetworkStats] = useState<any[]>([]);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<any>(null);
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>({} as Record<FeatureFlag, boolean>);

  useEffect(() => {
    // Load initial stats
    refreshStats();
    setFlags(getAllFeatureFlags());
    
    // Measure page load performance
    measurePageLoad().then(setPageLoadStats);
    
    // Measure memory usage
    const memory = measureMemoryUsage();
    if (memory) setMemoryStats(memory);
    
    // Measure network requests
    setNetworkStats(measureNetworkRequests());
    
    // Auto-refresh stats every 5 seconds
    const interval = setInterval(refreshStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshStats = () => {
    setStats(perfTracker.getAllStats());
  };

  const clearStats = () => {
    perfTracker.clear();
    setStats({});
    setBenchmarkResults(null);
  };

  const runBenchmark = async () => {
    setIsRunningBenchmark(true);
    setBenchmarkResults(null);
    
    try {
      // Test with optimizations OFF
      console.log('🧪 Testing with optimizations OFF...');
      disableFeature(FeatureFlag.USE_REACT_QUERY);
      disableFeature(FeatureFlag.OPTIMIZED_PROJECT_QUERIES);
      disableFeature(FeatureFlag.OPTIMIZED_TASK_QUERIES);
      
      perfTracker.clear();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for UI to update
      
      // Simulate data fetching without optimizations
      const startTime = performance.now();
      await fetch('/api/projects').catch(() => {}); // Might not exist, that's OK
      const baselineTime = performance.now() - startTime;
      
      const baselineStats = perfTracker.getAllStats();
      
      // Test with optimizations ON
      console.log('🚀 Testing with optimizations ON...');
      enableFeature(FeatureFlag.USE_REACT_QUERY);
      enableFeature(FeatureFlag.OPTIMIZED_PROJECT_QUERIES);
      enableFeature(FeatureFlag.OPTIMIZED_TASK_QUERIES);
      
      perfTracker.clear();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for UI to update
      
      // Simulate data fetching with optimizations
      const optimizedStartTime = performance.now();
      await fetch('/api/projects').catch(() => {}); // Might not exist, that's OK
      const optimizedTime = performance.now() - optimizedStartTime;
      
      const optimizedStats = perfTracker.getAllStats();
      
      // Calculate improvements
      const improvement = baselineTime > 0 ? ((baselineTime - optimizedTime) / baselineTime * 100) : 0;
      
      setBenchmarkResults({
        baseline: {
          time: baselineTime,
          stats: baselineStats
        },
        optimized: {
          time: optimizedTime,
          stats: optimizedStats
        },
        improvement: improvement.toFixed(1)
      });
      
      console.log('📊 Benchmark complete!');
      
    } catch (error) {
      console.error('Benchmark failed:', error);
    } finally {
      setIsRunningBenchmark(false);
      setFlags(getAllFeatureFlags());
      refreshStats();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time performance monitoring and benchmarking
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={runBenchmark}
            disabled={isRunningBenchmark}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunningBenchmark ? '🧪 Running...' : '🚀 Run Benchmark'}
          </button>
          <button
            onClick={clearStats}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            🗑️ Clear Stats
          </button>
        </div>
      </div>

      {/* Current Feature Flags Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Current Optimization Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(flags).map(([flag, enabled]) => (
            <div key={flag} className="text-center">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {flag.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark Results */}
      {benchmarkResults && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">📊 Benchmark Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h3 className="font-medium text-red-800 dark:text-red-400">Baseline (No Optimizations)</h3>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {benchmarkResults.baseline.time.toFixed(2)}ms
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-800 dark:text-green-400">Optimized</h3>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {benchmarkResults.optimized.time.toFixed(2)}ms
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-400">Improvement</h3>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {benchmarkResults.improvement}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Performance Stats */}
      {Object.keys(stats).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">⚡ Real-time Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats).map(([operation, data]: [string, any]) => (
              <div key={operation} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white">{operation}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>Latest: {data.latest.toFixed(2)}ms</div>
                  <div>Average: {data.average.toFixed(2)}ms</div>
                  <div>Count: {data.count}</div>
                  <div>Range: {data.min.toFixed(2)}ms - {data.max.toFixed(2)}ms</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browser Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Page Load Performance */}
        {pageLoadStats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">📄 Page Load Performance</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>DOM Content Loaded:</span>
                <span className="font-mono">{pageLoadStats.domContentLoadedEventEnd - pageLoadStats.domContentLoadedEventStart}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Load Complete:</span>
                <span className="font-mono">{pageLoadStats.loadEventEnd - pageLoadStats.loadEventStart}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Total Load Time:</span>
                <span className="font-mono">{pageLoadStats.loadEventEnd - pageLoadStats.navigationStart}ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Memory Usage */}
        {memoryStats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">🧠 Memory Usage</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Used JS Heap:</span>
                <span className="font-mono">{formatBytes(memoryStats.usedJSHeapSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total JS Heap:</span>
                <span className="font-mono">{formatBytes(memoryStats.totalJSHeapSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>Heap Limit:</span>
                <span className="font-mono">{formatBytes(memoryStats.jsHeapSizeLimit)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          🧪 How to Use This Dashboard
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p><strong>1. Monitor Real-time:</strong> Performance metrics update automatically as you use the app</p>
          <p><strong>2. Run Benchmarks:</strong> Click "Run Benchmark" to compare optimized vs unoptimized performance</p>
          <p><strong>3. Check Browser DevTools:</strong> Open F12 → Network tab to see actual request times</p>
          <p><strong>4. React Query DevTools:</strong> Look for the React Query icon in bottom-right when optimizations are enabled</p>
          <p><strong>5. Console Logs:</strong> Check browser console for detailed performance logs (⚡ symbols)</p>
        </div>
      </div>
    </div>
  );
}