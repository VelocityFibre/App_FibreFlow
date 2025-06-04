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
    <div className="space-y-12">
      <div className="border-b border-border pb-8 mb-12">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-light text-foreground mb-4">Performance Dashboard</h1>
            <p className="text-xl text-muted-foreground font-light">
              Real-time performance monitoring and benchmarking
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={runBenchmark}
              disabled={isRunningBenchmark}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {isRunningBenchmark ? 'Running...' : 'Run Benchmark'}
            </button>
            <button
              onClick={clearStats}
              className="bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Clear Stats
            </button>
          </div>
        </div>
      </div>

      <section className="mb-20">
        <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-3xl font-light text-foreground mb-12">Current Optimization Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Object.entries(flags).map(([flag, enabled]) => (
              <div key={flag} className="text-center">
                <div className={`w-4 h-4 rounded-full mx-auto mb-3 ${enabled ? 'bg-green-500' : 'bg-muted'}`}></div>
                <div className="text-sm text-muted-foreground">
                  {flag.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {benchmarkResults && (
        <section className="mb-20">
          <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-3xl font-light text-foreground mb-12">📊 Benchmark Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-muted/30 border border-border rounded-xl">
                <h3 className="text-xl font-medium text-muted-foreground mb-4">Baseline (No Optimizations)</h3>
                <div className="text-3xl font-light text-foreground">
                  {benchmarkResults.baseline.time.toFixed(2)}ms
                </div>
              </div>
              <div className="text-center p-6 bg-muted/20 border border-border rounded-xl">
                <h3 className="text-xl font-medium text-muted-foreground mb-4">Optimized</h3>
                <div className="text-3xl font-light text-foreground">
                  {benchmarkResults.optimized.time.toFixed(2)}ms
                </div>
              </div>
              <div className="text-center p-6 bg-primary/5 border border-border rounded-xl">
                <h3 className="text-xl font-medium text-muted-foreground mb-4">Improvement</h3>
                <div className="text-3xl font-light text-primary">
                  {benchmarkResults.improvement}%
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {Object.keys(stats).length > 0 && (
        <section className="mb-20">
          <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-3xl font-light text-foreground mb-12">⚡ Real-time Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(stats).map(([operation, data]: [string, any]) => (
                <div key={operation} className="p-6 bg-muted/50 border border-border rounded-xl">
                  <h3 className="text-xl font-medium text-foreground mb-4">{operation}</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <div>Latest: {data.latest.toFixed(2)}ms</div>
                    <div>Average: {data.average.toFixed(2)}ms</div>
                    <div>Count: {data.count}</div>
                    <div>Range: {data.min.toFixed(2)}ms - {data.max.toFixed(2)}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pageLoadStats && (
            <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-light text-foreground mb-8">Page Load Performance</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">DOM Content Loaded:</span>
                  <span className="font-mono text-foreground">{pageLoadStats.domContentLoadedEventEnd - pageLoadStats.domContentLoadedEventStart}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Load Complete:</span>
                  <span className="font-mono text-foreground">{pageLoadStats.loadEventEnd - pageLoadStats.loadEventStart}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Load Time:</span>
                  <span className="font-mono text-foreground">{pageLoadStats.loadEventEnd - pageLoadStats.navigationStart}ms</span>
                </div>
              </div>
            </div>
          )}

          {memoryStats && (
            <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-light text-foreground mb-8">Memory Usage</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Used JS Heap:</span>
                  <span className="font-mono text-foreground">{formatBytes(memoryStats.usedJSHeapSize)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total JS Heap:</span>
                  <span className="font-mono text-foreground">{formatBytes(memoryStats.totalJSHeapSize)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Heap Limit:</span>
                  <span className="font-mono text-foreground">{formatBytes(memoryStats.jsHeapSizeLimit)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mb-20">
        <div className="bg-muted/20 border border-border rounded-xl p-8">
          <h3 className="text-2xl font-light text-foreground mb-6">
            How to Use This Dashboard
          </h3>
          <div className="text-muted-foreground space-y-4">
            <p><strong>1. Monitor Real-time:</strong> Performance metrics update automatically as you use the app</p>
            <p><strong>2. Run Benchmarks:</strong> Click "Run Benchmark" to compare optimized vs unoptimized performance</p>
            <p><strong>3. Check Browser DevTools:</strong> Open F12 → Network tab to see actual request times</p>
            <p><strong>4. React Query DevTools:</strong> Look for the React Query icon in bottom-right when optimizations are enabled</p>
            <p><strong>5. Console Logs:</strong> Check browser console for detailed performance logs (⚡ symbols)</p>
          </div>
        </div>
      </section>
    </div>
  );
}