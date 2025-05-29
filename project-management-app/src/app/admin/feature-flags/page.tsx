"use client";

import { useState, useEffect } from 'react';
import { FeatureFlag, getAllFeatureFlags, enableFeature, disableFeature } from '@/lib/feature-flags';

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>({} as Record<FeatureFlag, boolean>);
  
  // Load current feature flags on mount
  useEffect(() => {
    setFlags(getAllFeatureFlags());
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
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Performance Feature Flags</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Toggle performance optimizations on or off. Changes take effect immediately but may require a page refresh.
        </p>
      </div>
      
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
      
      <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Important Notes</h3>
        <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
          <li>All optimizations are disabled by default to avoid interfering with existing code</li>
          <li>React Query must be enabled for any of the optimized data fetching to work</li>
          <li>Performance monitoring adds minimal overhead but provides valuable insights</li>
          <li>Error boundaries help prevent cascading failures in the application</li>
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
