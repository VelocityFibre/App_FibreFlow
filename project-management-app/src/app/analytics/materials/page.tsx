'use client';

import React, { useState, useEffect } from 'react';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  HeatMapChart
} from '@/components/analytics/charts';
import { 
  DataPoint, 
  TimeSeriesDataPoint,
  AnalyticsFilters 
} from '@/lib/analytics/types';
import { measureAsync } from '@/lib/performance';

// Mock data for initial development
const inventoryTurnoverData: TimeSeriesDataPoint[] = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - 12 + i);
  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`,
    value: Number((Math.random() * 2 + 3).toFixed(2)) // Turnover ratio between 3 and 5
  };
});

const materialCategoryData: DataPoint[] = [
  { name: 'Fibre Cable', value: 35, color: '#60a5fa' },
  { name: 'Connectors', value: 22, color: '#34d399' },
  { name: 'Splitters', value: 18, color: '#a78bfa' },
  { name: 'Enclosures', value: 15, color: '#fbbf24' },
  { name: 'Tools', value: 10, color: '#f87171' },
];

const staffUtilizationData: DataPoint[] = [
  { name: 'Field Technicians', value: 85, color: '#60a5fa' },
  { name: 'Project Managers', value: 78, color: '#34d399' },
  { name: 'Engineers', value: 92, color: '#a78bfa' },
  { name: 'Inventory Staff', value: 65, color: '#fbbf24' },
  { name: 'Support Staff', value: 72, color: '#f87171' },
];

const materialCostTrendData: TimeSeriesDataPoint[] = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - 12 + i);
  // Base value with slight upward trend and some randomness
  const baseValue = 100 + (i * 2) + (Math.random() * 10 - 5);
  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`,
    value: Number(baseValue.toFixed(2))
  };
});

// Supplier performance data
const supplierPerformanceData = [
  { id: 'Delivery Time', data: [
    { x: 'Supplier A', y: 95 },
    { x: 'Supplier B', y: 88 },
    { x: 'Supplier C', y: 92 },
    { x: 'Supplier D', y: 78 },
    { x: 'Supplier E', y: 85 },
  ]},
  { id: 'Quality Rating', data: [
    { x: 'Supplier A', y: 92 },
    { x: 'Supplier B', y: 85 },
    { x: 'Supplier C', y: 90 },
    { x: 'Supplier D', y: 82 },
    { x: 'Supplier E', y: 88 },
  ]},
  { id: 'Price Competitiveness', data: [
    { x: 'Supplier A', y: 80 },
    { x: 'Supplier B', y: 90 },
    { x: 'Supplier C', y: 75 },
    { x: 'Supplier D', y: 88 },
    { x: 'Supplier E', y: 82 },
  ]},
];

// Predictive material needs data (scatter plot showing predicted vs actual)
const predictiveMaterialData = Array.from({ length: 20 }, () => {
  const actual = Math.floor(Math.random() * 100) + 50;
  // Predicted value with some variance from actual
  const predicted = actual + (Math.random() * 20 - 10);
  return {
    x: actual,
    y: predicted,
    id: Math.random().toString(36).substring(7)
  };
});

export default function MaterialsAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: [null, null],
    projects: [],
    locations: [],
    statuses: [],
    assignees: [],
    groupBy: 'month',
  });

  // Check if analytics dashboard is enabled via feature flag
  const isAnalyticsEnabled = isFeatureEnabled(FeatureFlag.ANALYTICS_DASHBOARD);

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      await measureAsync('materialsAnalyticsDataLoading', async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
      });
    };
    
    loadData();
  }, []);

  if (!isAnalyticsEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-white dark:bg-gray-900 rounded-lg shadow p-8">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard is Disabled</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
          The analytics dashboard is currently disabled via feature flags. Please contact your administrator to enable this feature.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#003049] dark:text-white">Resource & Materials Intelligence</h1>
          <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">
            Analysis of inventory, staff utilization, and material costs
          </p>
        </div>
        
        {/* Filter button - would open filter panel */}
        <button 
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </span>
        </button>
      </div>

      {/* Inventory and Material Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow p-6">
          <LineChart 
            title="Inventory Turnover Ratio" 
            data={inventoryTurnoverData} 
            xAxisLabel="Month" 
            yAxisLabel="Turnover Ratio" 
            height={300}
          />
        </div>
        <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow p-6">
          <PieChart 
            title="Material Usage by Category" 
            data={materialCategoryData} 
            height={300}
          />
        </div>
      </div>

      {/* Staff Utilization and Material Cost Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow p-6">
          <BarChart 
            title="Staff Utilization Rates (%)" 
            data={staffUtilizationData} 
            xAxisLabel="Staff Category" 
            yAxisLabel="Utilization %" 
            height={300}
          />
        </div>
        <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow p-6">
          <LineChart 
            title="Material Cost Trends (Index: 100)" 
            data={materialCostTrendData} 
            xAxisLabel="Month" 
            yAxisLabel="Cost Index" 
            height={300}
          />
        </div>
      </div>

      {/* Supplier Performance Heat Map */}
      <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow p-6">
        <HeatMapChart 
          title="Supplier Performance Metrics" 
          data={supplierPerformanceData} 
          xLegend="Supplier" 
          yLegend="Metric" 
          height={300}
        />
      </div>

      {/* Predictive Analytics */}
      <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-[#003049] dark:text-white">Predictive Material Needs Analysis</h2>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Comparing predicted vs. actual material requirements (units)
          </p>
        </div>
        {/* Using LineChart as a placeholder since ScatterChart is not available */}
        <LineChart 
          title="Predicted vs Actual Usage" 
          data={materialCostTrendData.slice(0, 10)} 
          xAxisLabel="Time Period" 
          yAxisLabel="Usage" 
          height={300}
        />
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">AI Insights</h3>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
            Based on historical data and current project pipeline, we predict a 15% increase in fibre cable requirements for the next quarter. Consider increasing stock levels to avoid potential shortages.
          </p>
        </div>
      </div>

      {/* Inventory Optimization Recommendations */}
      <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-[#003049] dark:text-white mb-4">Inventory Optimization Recommendations</h2>
        
        <div className="space-y-4">
          <div className="p-4 border border-green-200 dark:border-green-900 rounded-md bg-green-50 dark:bg-green-900/20">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Reduce Splitter Stock</h3>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  Current stock levels are 35% above optimal. Consider reducing by 20% to improve cash flow while maintaining adequate buffer.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-yellow-200 dark:border-yellow-900 rounded-md bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Increase Fibre Cable Stock</h3>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  Based on upcoming projects, current stock will be depleted within 3 weeks. Recommend increasing order by 25%.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-blue-200 dark:border-blue-900 rounded-md bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Supplier Diversification</h3>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  70% of connectors are sourced from a single supplier. Consider adding a secondary supplier to reduce supply chain risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
