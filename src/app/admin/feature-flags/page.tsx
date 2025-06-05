"use client";

import { useState, useEffect } from 'react';
import { FeatureFlag, getAllFeatureFlags, enableFeature, disableFeature, isFeatureEnabled } from '@/lib/feature-flags';

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
    <div className="space-y-12">
      <div className="border-b border-gray-100 pb-8 mb-12">
        <h1 className="text-5xl font-light text-gray-900 mb-4">Feature Flags</h1>
        <p className="text-xl text-gray-600 font-light">
          Toggle experimental features on or off. Core optimizations are now permanently enabled.
        </p>
        <div className="mt-6 text-gray-600">
          Performance monitoring: {isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING) ? '🟢 Active' : '🔴 Disabled'}
        </div>
      </div>

      <section className="mb-20">
        <h2 className="text-3xl font-light text-gray-900 mb-12">Graduated Features</h2>
        <div className="bg-white border border-gray-100 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-medium text-gray-900 mb-4">✅ Permanently Enabled</h3>
          <div className="space-y-4 text-gray-600">
            <p><strong>React Query:</strong> Data caching and optimized fetching - delivering 92%+ performance improvements</p>
            <p><strong>Optimized Database Queries:</strong> Enhanced project and task queries for faster response times</p>
            <p><strong>Performance Benefits:</strong> ~13x faster performance (650ms → 50ms average response times)</p>
            <p className="mt-6 italic text-gray-500">These optimizations have been graduated from feature flags due to their proven success.</p>
          </div>
        </div>
      </section>

      
      <section className="mb-20">
        <h2 className="text-3xl font-light text-gray-900 mb-12">Feature Controls</h2>
        <div className="bg-white border border-gray-100 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
          <div className="space-y-8">
            {Object.entries(flags).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">{formatFlagName(key as FeatureFlag)}</h3>
                  <p className="text-gray-600">{getFlagDescription(key as FeatureFlag)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFlag(key as FeatureFlag)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                    value ? 'bg-gray-700' : 'bg-gray-200'
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
      </section>
      
      <section className="mb-20">
        <h2 className="text-3xl font-light text-gray-900 mb-12">Experimental Features</h2>
        <div className="bg-white border border-gray-100 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-medium text-gray-900 mb-6">🧪 Current Status</h3>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <span className={`w-4 h-4 rounded-full ${isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-gray-700">
                <strong>Performance Monitoring:</strong> {isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING) ? 'Active ✓' : 'Disabled'} - Real-time metrics collection
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`w-4 h-4 rounded-full ${isFeatureEnabled(FeatureFlag.USE_ERROR_BOUNDARIES) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-gray-700">
                <strong>Error Boundaries:</strong> {isFeatureEnabled(FeatureFlag.USE_ERROR_BOUNDARIES) ? 'Active ✓' : 'Disabled'} - Better error isolation
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`w-4 h-4 rounded-full ${isFeatureEnabled(FeatureFlag.ANALYTICS_DASHBOARD) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span className="text-gray-700">
                <strong>Analytics Dashboard:</strong> {isFeatureEnabled(FeatureFlag.ANALYTICS_DASHBOARD) ? 'Active ✓' : 'Disabled'} - PowerBI-like analytics
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-3xl font-light text-gray-900 mb-12">Important Notes</h2>
        <div className="bg-white border border-gray-100 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-medium text-gray-900 mb-6">⚠️ Guidelines</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>Core optimizations:</strong> React Query and optimized queries are now permanently enabled</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>Experimental features:</strong> Use flags to safely test new features before graduation</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>Performance monitoring:</strong> Toggle on/off for debugging and metrics collection</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>Before merging:</strong> Always test experimental features with flags OFF to ensure app stability</span>
            </li>
          </ul>
        </div>
      </section>
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
