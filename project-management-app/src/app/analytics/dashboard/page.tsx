"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  GaugeChart, 
  CalendarChart 
} from '@/components/analytics/charts';
import { 
  DataPoint, 
  TimeSeriesDataPoint,
  AnalyticsFilters 
} from '@/lib/analytics/types';
import { measureAsync } from '@/lib/performance';
import DashboardFilter from '@/components/analytics/DashboardFilter';
import PerformanceMonitor from '@/components/analytics/PerformanceMonitor';

// Mock data for initial development
const projectStatusData: DataPoint[] = [
  { name: 'Not Started', value: 12, color: '#94a3b8' },
  { name: 'In Progress', value: 18, color: '#3b82f6' },
  { name: 'Delayed', value: 5, color: '#f59e0b' },
  { name: 'Completed', value: 25, color: '#10b981' },
];

const taskCompletionData: TimeSeriesDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 30 + i);
  return {
    date: date.toISOString().split('T')[0],
    value: Math.floor(Math.random() * 10) + 1
  };
});

const locationData: DataPoint[] = [
  { name: 'Cape Town', value: 15 },
  { name: 'Johannesburg', value: 22 },
  { name: 'Durban', value: 18 },
  { name: 'Pretoria', value: 12 },
  { name: 'Bloemfontein', value: 8 },
];

const tasksByAssigneeData: DataPoint[] = [
  { name: 'John Smith', value: 24 },
  { name: 'Sarah Johnson', value: 18 },
  { name: 'Michael Brown', value: 15 },
  { name: 'Emily Davis', value: 12 },
  { name: 'David Wilson', value: 9 },
];

// Calendar data for activity heatmap
const calendarData = Array.from({ length: 200 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 200 + i);
  return {
    day: date.toISOString().split('T')[0],
    value: Math.floor(Math.random() * 5)
  };
});

// Performance metrics
const performanceMetrics = {
  projectCompletion: 68,
  taskCompletion: 72,
  onTimeDelivery: 85,
  budgetAdherence: 92,
};

export default function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: [null, null],
    projects: [],
    locations: [],
    statuses: [],
    assignees: [],
    groupBy: 'month',
  });

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      await measureAsync('analyticsDataLoading', async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
      });
    };
    
    loadData();
  }, []);

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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive overview of project performance and metrics
          </p>
        </div>
        
        {/* Dashboard Filter Component */}
        <DashboardFilter 
          filters={filters}
          onApplyFilters={(newFilters) => setFilters(newFilters)}
          availableProjects={[
            { id: 'proj1', name: 'Fibre Installation Cape Town' },
            { id: 'proj2', name: 'Network Upgrade Johannesburg' },
            { id: 'proj3', name: 'Maintenance Durban' },
            { id: 'proj4', name: 'New Installation Pretoria' },
            { id: 'proj5', name: 'Infrastructure Bloemfontein' }
          ]}
          availableLocations={[
            { id: 'loc1', name: 'Cape Town' },
            { id: 'loc2', name: 'Johannesburg' },
            { id: 'loc3', name: 'Durban' },
            { id: 'loc4', name: 'Pretoria' },
            { id: 'loc5', name: 'Bloemfontein' }
          ]}
          availableStatuses={[
            { id: 'status1', name: 'Not Started' },
            { id: 'status2', name: 'In Progress' },
            { id: 'status3', name: 'Delayed' },
            { id: 'status4', name: 'Completed' }
          ]}
        />
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GaugeChart 
          title="Project Completion" 
          value={performanceMetrics.projectCompletion} 
          unit="%" 
          thresholds={[50, 80]}
        />
        <GaugeChart 
          title="Task Completion" 
          value={performanceMetrics.taskCompletion} 
          unit="%" 
          thresholds={[50, 80]}
        />
        <GaugeChart 
          title="On-Time Delivery" 
          value={performanceMetrics.onTimeDelivery} 
          unit="%" 
          thresholds={[60, 85]}
        />
        <GaugeChart 
          title="Budget Adherence" 
          value={performanceMetrics.budgetAdherence} 
          unit="%" 
          thresholds={[70, 90]}
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <PieChart 
            title="Projects by Status" 
            data={projectStatusData} 
            height={300}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <LineChart 
            title="Task Completion Trend" 
            data={taskCompletionData} 
            xAxisLabel="Date" 
            yAxisLabel="Tasks Completed" 
            height={300}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <BarChart 
            title="Projects by Location" 
            data={locationData} 
            xAxisLabel="Location" 
            yAxisLabel="Number of Projects" 
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

      {/* Activity Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <CalendarChart 
          title="Activity Calendar" 
          data={calendarData} 
          height={200}
        />
      </div>

      {/* Performance Monitor */}
      <PerformanceMonitor />
    </div>
  );
}
