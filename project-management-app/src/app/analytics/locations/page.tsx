"use client";

import React, { useState, useEffect } from 'react';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  GaugeChart,
  HeatMapChart 
} from '@/components/analytics/charts';
import { 
  DataPoint, 
  TimeSeriesDataPoint,
  AnalyticsFilters 
} from '@/lib/analytics/types';
import { measureAsync } from '@/lib/performance';

// Mock data for initial development
const projectsByLocationData: DataPoint[] = [
  { name: 'Cape Town', value: 15, color: '#60a5fa' },
  { name: 'Johannesburg', value: 22, color: '#34d399' },
  { name: 'Durban', value: 18, color: '#a78bfa' },
  { name: 'Pretoria', value: 12, color: '#fbbf24' },
  { name: 'Bloemfontein', value: 8, color: '#f87171' },
];

const tasksByLocationData: DataPoint[] = [
  { name: 'Cape Town', value: 78, color: '#60a5fa' },
  { name: 'Johannesburg', value: 112, color: '#34d399' },
  { name: 'Durban', value: 95, color: '#a78bfa' },
  { name: 'Pretoria', value: 64, color: '#fbbf24' },
  { name: 'Bloemfontein', value: 42, color: '#f87171' },
];

const projectCompletionByLocationData: DataPoint[] = [
  { name: 'Cape Town', value: 72, color: '#60a5fa' },
  { name: 'Johannesburg', value: 65, color: '#34d399' },
  { name: 'Durban', value: 80, color: '#a78bfa' },
  { name: 'Pretoria', value: 68, color: '#fbbf24' },
  { name: 'Bloemfontein', value: 75, color: '#f87171' },
];

const projectTimelineByLocationData = [
  {
    id: 'Cape Town',
    data: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 12 + i);
      return {
        x: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        y: Math.floor(Math.random() * 5) + 1
      };
    })
  },
  {
    id: 'Johannesburg',
    data: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 12 + i);
      return {
        x: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        y: Math.floor(Math.random() * 6) + 2
      };
    })
  },
  {
    id: 'Durban',
    data: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 12 + i);
      return {
        x: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        y: Math.floor(Math.random() * 5) + 1
      };
    })
  },
  {
    id: 'Pretoria',
    data: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 12 + i);
      return {
        x: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        y: Math.floor(Math.random() * 4) + 1
      };
    })
  },
  {
    id: 'Bloemfontein',
    data: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 12 + i);
      return {
        x: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        y: Math.floor(Math.random() * 3) + 1
      };
    })
  }
];

// Heat map data for task status by location
const taskStatusByLocationData = [
  {
    id: 'To Do',
    data: [
      { x: 'Cape Town', y: 12 },
      { x: 'Johannesburg', y: 18 },
      { x: 'Durban', y: 15 },
      { x: 'Pretoria', y: 10 },
      { x: 'Bloemfontein', y: 8 },
    ]
  },
  {
    id: 'In Progress',
    data: [
      { x: 'Cape Town', y: 15 },
      { x: 'Johannesburg', y: 22 },
      { x: 'Durban', y: 18 },
      { x: 'Pretoria', y: 12 },
      { x: 'Bloemfontein', y: 9 },
    ]
  },
  {
    id: 'Blocked',
    data: [
      { x: 'Cape Town', y: 5 },
      { x: 'Johannesburg', y: 8 },
      { x: 'Durban', y: 6 },
      { x: 'Pretoria', y: 4 },
      { x: 'Bloemfontein', y: 3 },
    ]
  },
  {
    id: 'Review',
    data: [
      { x: 'Cape Town', y: 8 },
      { x: 'Johannesburg', y: 12 },
      { x: 'Durban', y: 10 },
      { x: 'Pretoria', y: 7 },
      { x: 'Bloemfontein', y: 5 },
    ]
  },
  {
    id: 'Done',
    data: [
      { x: 'Cape Town', y: 38 },
      { x: 'Johannesburg', y: 52 },
      { x: 'Durban', y: 46 },
      { x: 'Pretoria', y: 31 },
      { x: 'Bloemfontein', y: 17 },
    ]
  }
];

export default function LocationsAnalytics() {
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
      await measureAsync('locationsAnalyticsDataLoading', async () => {
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Location Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Detailed analysis of project and task distribution by location
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

      {/* Project and Task Distribution by Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <BarChart 
            title="Projects by Location" 
            data={projectsByLocationData} 
            xAxisLabel="Location" 
            yAxisLabel="Number of Projects" 
            height={300}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <BarChart 
            title="Tasks by Location" 
            data={tasksByLocationData} 
            xAxisLabel="Location" 
            yAxisLabel="Number of Tasks" 
            height={300}
          />
        </div>
      </div>

      {/* Project Completion Rate by Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectCompletionByLocationData.map((location) => (
              <GaugeChart 
                key={location.name}
                title={location.name} 
                value={location.value} 
                unit="%" 
                thresholds={[50, 80]}
                colors={['#ef4444', '#f59e0b', '#10b981']}
                height={150}
              />
            ))}
          </div>
          <h3 className="text-center text-lg font-medium text-gray-900 dark:text-white mt-4">
            Project Completion Rate by Location
          </h3>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <HeatMapChart 
            title="Task Status by Location" 
            data={taskStatusByLocationData} 
            xLegend="Location" 
            yLegend="Status" 
            height={300}
          />
        </div>
      </div>

      {/* Project Timeline by Location */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <HeatMapChart 
          title="Project Timeline by Location (Last 12 Months)" 
          data={projectTimelineByLocationData} 
          xLegend="Month" 
          yLegend="Location" 
          height={400}
        />
      </div>
    </div>
  );
}
