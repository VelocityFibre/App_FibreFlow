"use client";

import React, { useState, useEffect } from 'react';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
import { perfTracker } from '@/lib/performance';

interface PerformanceMetric {
  name: string;
  average: number;
  min: number;
  max: number;
  count: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Only collect metrics if performance monitoring is enabled
  const isMonitoringEnabled = isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING);

  useEffect(() => {
    if (!isMonitoringEnabled) return;
    
    // Collect metrics every second
    const intervalId = setInterval(() => {
      const analyticsMetrics = [
        'analyticsDataLoading',
        'projectsAnalyticsDataLoading',
        'tasksAnalyticsDataLoading',
        'locationsAnalyticsDataLoading',
        'auditAnalyticsDataLoading',
        'BarChart.render',
        'LineChart.render',
        'PieChart.render',
        'GaugeChart.render',
        'HeatMapChart.render',
        'CalendarChart.render',
        'DashboardFilter.render'
      ];
      
      const collectedMetrics: PerformanceMetric[] = [];
      
      analyticsMetrics.forEach(metricName => {
        const stats = perfTracker.getStats(metricName);
        if (stats && stats.count > 0) {
          collectedMetrics.push({
            name: metricName,
            average: stats.average,
            min: stats.min,
            max: stats.max,
            count: stats.count
          });
        }
      });
      
      setMetrics(collectedMetrics);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isMonitoringEnabled]);

  if (!isMonitoringEnabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none"
        title="Performance Monitor"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>
      
      {/* Performance Panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-3 bg-blue-600 text-white flex justify-between items-center">
            <h3 className="text-sm font-medium">Analytics Performance Monitor</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            {metrics.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No performance metrics collected yet.</p>
            ) : (
              <div className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.name} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{metric.name}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Count: {metric.count}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded">
                        <div className="text-green-800 dark:text-green-400 font-medium">Avg</div>
                        <div className="text-gray-900 dark:text-gray-100">{metric.average.toFixed(2)} ms</div>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded">
                        <div className="text-blue-800 dark:text-blue-400 font-medium">Min</div>
                        <div className="text-gray-900 dark:text-gray-100">{metric.min.toFixed(2)} ms</div>
                      </div>
                      <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded">
                        <div className="text-amber-800 dark:text-amber-400 font-medium">Max</div>
                        <div className="text-gray-900 dark:text-gray-100">{metric.max.toFixed(2)} ms</div>
                      </div>
                    </div>
                    
                    {/* Performance Bar */}
                    <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600" 
                        style={{ 
                          width: `${Math.min(100, (metric.average / 1000) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 bg-gray-100 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
            <span>Feature Flag: {isMonitoringEnabled ? 'Enabled' : 'Disabled'}</span>
            <button 
              onClick={() => perfTracker.reset()}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Reset Metrics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
