"use client";

import React, { useState, useEffect } from 'react';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  CalendarChart 
} from '@/components/analytics/charts';
import { 
  DataPoint, 
  TimeSeriesDataPoint,
  AnalyticsFilters 
} from '@/lib/analytics/types';
import { measureAsync } from '@/lib/performance';

// Mock data for initial development
const auditActionTypeData: DataPoint[] = [
  { name: 'Create', value: 145, color: '#10b981' },
  { name: 'Update', value: 210, color: '#3b82f6' },
  { name: 'Delete', value: 35, color: '#ef4444' },
  { name: 'View', value: 320, color: '#a78bfa' },
];

const auditResourceTypeData: DataPoint[] = [
  { name: 'Customer', value: 85, color: '#60a5fa' },
  { name: 'Project', value: 120, color: '#34d399' },
  { name: 'Task', value: 280, color: '#a78bfa' },
  { name: 'User', value: 45, color: '#fbbf24' },
  { name: 'Location', value: 60, color: '#f87171' },
  { name: 'Material', value: 120, color: '#8b5cf6' },
];

const auditActivityByUserData: DataPoint[] = [
  { name: 'John Smith', value: 145, color: '#60a5fa' },
  { name: 'Sarah Johnson', value: 128, color: '#34d399' },
  { name: 'Michael Brown', value: 112, color: '#a78bfa' },
  { name: 'Emily Davis', value: 95, color: '#fbbf24' },
  { name: 'David Wilson', value: 78, color: '#f87171' },
];

const auditActivityTimelineData: TimeSeriesDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 30 + i);
  return {
    date: date.toISOString().split('T')[0],
    value: Math.floor(Math.random() * 25) + 5
  };
});

// Calendar data for audit activity heatmap
const calendarData = Array.from({ length: 200 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 200 + i);
  return {
    day: date.toISOString().split('T')[0],
    value: Math.floor(Math.random() * 15)
  };
});

// Heat map data for audit action by resource type
const actionByResourceData = [
  {
    id: 'Create',
    data: [
      { x: 'Customer', y: 25 },
      { x: 'Project', y: 35 },
      { x: 'Task', y: 60 },
      { x: 'User', y: 15 },
      { x: 'Location', y: 10 },
    ]
  },
  {
    id: 'Update',
    data: [
      { x: 'Customer', y: 40 },
      { x: 'Project', y: 55 },
      { x: 'Task', y: 85 },
      { x: 'User', y: 20 },
      { x: 'Location', y: 10 },
    ]
  },
  {
    id: 'Delete',
    data: [
      { x: 'Customer', y: 5 },
      { x: 'Project', y: 8 },
      { x: 'Task', y: 15 },
      { x: 'User', y: 3 },
      { x: 'Location', y: 4 },
    ]
  },
  {
    id: 'View',
    data: [
      { x: 'Customer', y: 15 },
      { x: 'Project', y: 22 },
      { x: 'Task', y: 120 },
      { x: 'User', y: 7 },
      { x: 'Location', y: 36 },
    ]
  }
];

export default function AuditAnalytics() {
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
      await measureAsync('auditAnalyticsDataLoading', async () => {
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Audit Trail Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Detailed analysis of system activity and user actions
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

      {/* Audit Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <PieChart 
            title="Audit Actions by Type" 
            data={auditActionTypeData} 
            height={300}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <PieChart 
            title="Audit Actions by Resource Type" 
            data={auditResourceTypeData} 
            height={300}
          />
        </div>
      </div>

      {/* Audit Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <LineChart 
          title="Audit Activity Timeline (Last 30 Days)" 
          data={auditActivityTimelineData} 
          xAxisLabel="Date" 
          yAxisLabel="Number of Actions" 
          height={300}
        />
      </div>

      {/* Audit Activity by User */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <BarChart 
          title="Audit Activity by User" 
          data={auditActivityByUserData} 
          horizontal={true}
          xAxisLabel="Number of Actions" 
          yAxisLabel="User" 
          height={300}
        />
      </div>

      {/* Activity Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <CalendarChart 
          title="Audit Activity Calendar" 
          data={calendarData} 
          height={200}
        />
      </div>

      {/* Additional Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Audit Trail Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">About the Audit System</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The audit trail system tracks all user actions within the application, providing accountability and compliance support. 
              Each action is logged with details including the user, action type, resource affected, and timestamp.
            </p>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Compliance Benefits</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Complete history of all system changes</li>
              <li>User accountability for all actions</li>
              <li>Detailed timestamps for audit verification</li>
              <li>Resource tracking across the entire system</li>
              <li>Support for regulatory compliance requirements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
