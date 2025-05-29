"use client";

import React, { useState, useEffect } from 'react';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  GaugeChart 
} from '@/components/analytics/charts';
import { 
  DataPoint, 
  TimeSeriesDataPoint,
  AnalyticsFilters 
} from '@/lib/analytics/types';
import { measureAsync } from '@/lib/performance';

// Mock data for initial development
const tasksByStatusData: DataPoint[] = [
  { name: 'To Do', value: 28, color: '#94a3b8' },
  { name: 'In Progress', value: 16, color: '#3b82f6' },
  { name: 'Blocked', value: 7, color: '#f43f5e' },
  { name: 'Review', value: 9, color: '#f59e0b' },
  { name: 'Done', value: 42, color: '#10b981' },
];

const tasksByPriorityData: DataPoint[] = [
  { name: 'Low', value: 18, color: '#10b981' },
  { name: 'Medium', value: 35, color: '#f59e0b' },
  { name: 'High', value: 25, color: '#f43f5e' },
  { name: 'Critical', value: 12, color: '#7c3aed' },
];

const taskCompletionTrendData: TimeSeriesDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 30 + i);
  return {
    date: date.toISOString().split('T')[0],
    value: Math.floor(Math.random() * 8) + 1
  };
});

const tasksByAssigneeData: DataPoint[] = [
  { name: 'John Smith', value: 24, color: '#60a5fa' },
  { name: 'Sarah Johnson', value: 18, color: '#34d399' },
  { name: 'Michael Brown', value: 15, color: '#a78bfa' },
  { name: 'Emily Davis', value: 12, color: '#fbbf24' },
  { name: 'David Wilson', value: 9, color: '#f87171' },
];

const taskAgeData: DataPoint[] = [
  { name: '< 1 day', value: 15, color: '#10b981' },
  { name: '1-3 days', value: 22, color: '#3b82f6' },
  { name: '4-7 days', value: 18, color: '#f59e0b' },
  { name: '1-2 weeks', value: 12, color: '#f43f5e' },
  { name: '> 2 weeks', value: 8, color: '#8b5cf6' },
];

// Performance metrics
const performanceMetrics = {
  taskCompletionRate: 78,
  averageResolutionTime: 3.2, // days
  blockedTasksPercentage: 12,
  reopenedTasksPercentage: 8,
};

export default function TasksAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: [null, null],
    projects: [],
    locations: [],
    statuses: [],
    assignees: [],
    groupBy: 'day',
  });

  // Check if analytics dashboard is enabled via feature flag
  const isAnalyticsEnabled = isFeatureEnabled(FeatureFlag.ANALYTICS_DASHBOARD);

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      await measureAsync('tasksAnalyticsDataLoading', async () => {
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Task Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Detailed analysis of task performance and distribution
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

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GaugeChart 
          title="Task Completion Rate" 
          value={performanceMetrics.taskCompletionRate} 
          unit="%" 
          thresholds={[50, 80]}
        />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Avg. Resolution Time</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {performanceMetrics.averageResolutionTime}
            </span>
            <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">days</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Blocked Tasks</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-red-500 dark:text-red-400">
              {performanceMetrics.blockedTasksPercentage}%
            </span>
            <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">of total</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Reopened Tasks</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-amber-500 dark:text-amber-400">
              {performanceMetrics.reopenedTasksPercentage}%
            </span>
            <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">of completed</span>
          </div>
        </div>
      </div>

      {/* Task Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <PieChart 
            title="Tasks by Status" 
            data={tasksByStatusData} 
            height={300}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <PieChart 
            title="Tasks by Priority" 
            data={tasksByPriorityData} 
            height={300}
          />
        </div>
      </div>

      {/* Task Completion Trend and Assignees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <LineChart 
            title="Task Completion Trend (Last 30 Days)" 
            data={taskCompletionTrendData} 
            xAxisLabel="Date" 
            yAxisLabel="Tasks Completed" 
            height={300}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <BarChart 
            title="Tasks by Assignee" 
            data={tasksByAssigneeData} 
            horizontal={true}
            xAxisLabel="Number of Tasks" 
            yAxisLabel="Assignee" 
            height={300}
          />
        </div>
      </div>

      {/* Task Age Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <BarChart 
          title="Task Age Distribution" 
          data={taskAgeData} 
          xAxisLabel="Age Category" 
          yAxisLabel="Number of Tasks" 
          height={300}
        />
      </div>
    </div>
  );
}
