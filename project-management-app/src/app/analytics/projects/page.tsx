"use client";

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
const projectsByStatusData: DataPoint[] = [
  { name: 'Not Started', value: 12, color: '#94a3b8' },
  { name: 'In Progress', value: 18, color: '#3b82f6' },
  { name: 'Delayed', value: 5, color: '#f59e0b' },
  { name: 'Completed', value: 25, color: '#10b981' },
];

const projectsByLocationData: DataPoint[] = [
  { name: 'Cape Town', value: 15, color: '#60a5fa' },
  { name: 'Johannesburg', value: 22, color: '#34d399' },
  { name: 'Durban', value: 18, color: '#a78bfa' },
  { name: 'Pretoria', value: 12, color: '#fbbf24' },
  { name: 'Bloemfontein', value: 8, color: '#f87171' },
];

const projectTimelineData: TimeSeriesDataPoint[] = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - 12 + i);
  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`,
    value: Math.floor(Math.random() * 8) + 2
  };
});

// Project duration data
const projectDurationData: DataPoint[] = [
  { name: '< 1 month', value: 8, color: '#10b981' },
  { name: '1-3 months', value: 15, color: '#3b82f6' },
  { name: '3-6 months', value: 12, color: '#f59e0b' },
  { name: '6-12 months', value: 7, color: '#ef4444' },
  { name: '> 12 months', value: 3, color: '#8b5cf6' },
];

// Heat map data for project activity by month and location
const heatMapData = [
  {
    id: 'Cape Town',
    data: [
      { x: 'Jan', y: 7 },
      { x: 'Feb', y: 5 },
      { x: 'Mar', y: 11 },
      { x: 'Apr', y: 9 },
      { x: 'May', y: 12 },
      { x: 'Jun', y: 8 },
    ]
  },
  {
    id: 'Johannesburg',
    data: [
      { x: 'Jan', y: 12 },
      { x: 'Feb', y: 10 },
      { x: 'Mar', y: 8 },
      { x: 'Apr', y: 15 },
      { x: 'May', y: 7 },
      { x: 'Jun', y: 9 },
    ]
  },
  {
    id: 'Durban',
    data: [
      { x: 'Jan', y: 5 },
      { x: 'Feb', y: 8 },
      { x: 'Mar', y: 10 },
      { x: 'Apr', y: 6 },
      { x: 'May', y: 9 },
      { x: 'Jun', y: 11 },
    ]
  },
  {
    id: 'Pretoria',
    data: [
      { x: 'Jan', y: 3 },
      { x: 'Feb', y: 6 },
      { x: 'Mar', y: 5 },
      { x: 'Apr', y: 8 },
      { x: 'May', y: 4 },
      { x: 'Jun', y: 7 },
    ]
  },
  {
    id: 'Bloemfontein',
    data: [
      { x: 'Jan', y: 2 },
      { x: 'Feb', y: 4 },
      { x: 'Mar', y: 3 },
      { x: 'Apr', y: 5 },
      { x: 'May', y: 2 },
      { x: 'Jun', y: 4 },
    ]
  }
];

export default function ProjectsAnalytics() {
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
      await measureAsync('projectsAnalyticsDataLoading', async () => {
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Project Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Detailed analysis of project performance and distribution
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

      {/* Project Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <PieChart 
            title="Projects by Status" 
            data={projectsByStatusData} 
            height={300}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <PieChart 
            title="Projects by Location" 
            data={projectsByLocationData} 
            height={300}
          />
        </div>
      </div>

      {/* Project Timeline and Duration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <LineChart 
            title="Project Timeline" 
            data={projectTimelineData} 
            xAxisLabel="Month" 
            yAxisLabel="New Projects" 
            height={300}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <BarChart 
            title="Project Duration" 
            data={projectDurationData} 
            xAxisLabel="Duration" 
            yAxisLabel="Number of Projects" 
            height={300}
          />
        </div>
      </div>

      {/* Heat Map for Project Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <HeatMapChart 
          title="Project Activity by Location and Month" 
          data={heatMapData} 
          xLegend="Month" 
          yLegend="Location" 
          height={400}
        />
      </div>
    </div>
  );
}
