"use client";

import { useState, useEffect } from 'react';
import { FeatureFlag, getAllFeatureFlags, enableFeature, disableFeature, isFeatureEnabled } from '@/lib/feature-flags';

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>({} as Record<FeatureFlag, boolean>);
  const [performanceMetrics, setPerformanceMetrics] = useState<{[key: string]: number}>({});
  
  // Load current feature flags on mount
  useEffect(() => {
    setFlags(getAllFeatureFlags());
    
    // Mock performance metrics for demonstration
    setPerformanceMetrics({
      'Dashboard Load Time': 450,
      'Projects Query Time': 120,
      'Tasks Query Time': 95,
      'Memory Usage (MB)': 45.2,
      'API Response Time': 85,
    });
  }, []);
  
  // Toggle a feature flag
  const toggleFlag = (flag: FeatureFlag) => {
    const newValue = !flags[flag];
    if (newValue) {
      enableFeature(flag);
    } else {
      disableFeature(flag);
    }
    setFlags({ ...flags, [flag]: newValue });
  };
  
  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Performance Feature Flags</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Toggle performance optimizations on or off. Changes take effect immediately but may require a page refresh.
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Performance monitoring: {isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING) ? '🟢 Active' : '🔴 Disabled'}
        </div>
      </div>

      {/* Performance Metrics (only show if monitoring is enabled) */}
      {isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING) && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Current Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(performanceMetrics).map(([metric, value]) => (
              <div key={metric} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {typeof value === 'number' ? (metric.includes('MB') ? value.toFixed(1) : Math.round(value)) : value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.replace(' (MB)', '')}
                  {metric.includes('Time') && !metric.includes('MB') && <span className="text-xs ml-1">ms</span>}
                  {metric.includes('MB') && <span className="text-xs ml-1">MB</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {Object.entries(flags).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">{formatFlagName(key as FeatureFlag)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getFlagDescription(key as FeatureFlag)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFlag(key as FeatureFlag)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    value ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Toggle {key}</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Testing Progress */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          🧪 Testing Progress
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className={`w-3 h-3 rounded-full ${isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Step 1:</strong> Performance Monitoring - {isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING) ? 'Active ✓' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`w-3 h-3 rounded-full ${isFeatureEnabled(FeatureFlag.USE_REACT_QUERY) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Step 2:</strong> React Query - {isFeatureEnabled(FeatureFlag.USE_REACT_QUERY) ? 'Testing' : 'Ready to test'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`w-3 h-3 rounded-full ${isFeatureEnabled(FeatureFlag.OPTIMIZED_PROJECT_QUERIES) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Step 3:</strong> Optimized Project Queries - {isFeatureEnabled(FeatureFlag.OPTIMIZED_PROJECT_QUERIES) ? 'Testing' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`w-3 h-3 rounded-full ${isFeatureEnabled(FeatureFlag.OPTIMIZED_TASK_QUERIES) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            <span className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Step 4:</strong> Optimized Task Queries - {isFeatureEnabled(FeatureFlag.OPTIMIZED_TASK_QUERIES) ? 'Testing' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">⚠️ Important Notes</h3>
        <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
          <li><strong>Performance monitoring:</strong> Now enabled to track baseline metrics</li>
          <li><strong>Testing order:</strong> Enable React Query first, then optimized queries</li>
          <li><strong>Safety:</strong> All optimizations are disabled by default to avoid interfering with existing code</li>
          <li><strong>Before merging:</strong> Always test with flags OFF to ensure app still works</li>
        </ul>
      </div>
    </div>
  );
}

// Helper function to format flag names for display
function formatFlagName(flag: FeatureFlag): string {
  const name = flag.toString();
  return name
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
}

// Helper function to get descriptions for each flag
function getFlagDescription(flag: FeatureFlag): string {
  const descriptions: Record<FeatureFlag, string> = {
    [FeatureFlag.USE_REACT_QUERY]: 'Enable React Query for data fetching and caching',
    [FeatureFlag.OPTIMIZED_PROJECT_QUERIES]: 'Use optimized queries for projects data',
    [FeatureFlag.OPTIMIZED_TASK_QUERIES]: 'Use optimized queries for tasks data',
    [FeatureFlag.USE_ERROR_BOUNDARIES]: 'Enable error boundaries for better error handling',
    [FeatureFlag.PERFORMANCE_MONITORING]: 'Enable performance monitoring and metrics collection',
  };
  
  return descriptions[flag] || 'No description available';
}
