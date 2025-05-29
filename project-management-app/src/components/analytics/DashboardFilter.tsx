"use client";

import React, { useState } from 'react';
import { AnalyticsFilters } from '@/lib/analytics/types';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
import { performanceUtils } from '@/lib/performance-monitor';

interface DashboardFilterProps {
  filters: AnalyticsFilters;
  onApplyFilters: (filters: AnalyticsFilters) => void;
  availableProjects?: { id: string; name: string }[];
  availableLocations?: { id: string; name: string }[];
  availableStatuses?: { id: string; name: string }[];
  availableAssignees?: { id: string; name: string }[];
  className?: string;
}

export default function DashboardFilter({
  filters,
  onApplyFilters,
  availableProjects = [],
  availableLocations = [],
  availableStatuses = [],
  availableAssignees = [],
  className = '',
}: DashboardFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<AnalyticsFilters>(filters);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Start performance measurement if enabled
  React.useEffect(() => {
    let metricId: string | null = null;
    if (isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
      metricId = performanceUtils.startMetric('DashboardFilter.render');
    }
    
    return () => {
      if (metricId && isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
        performanceUtils.endMetric('DashboardFilter.render');
      }
    };
  }, []);

  // Update local date range when dates change
  React.useEffect(() => {
    if (startDate || endDate) {
      setLocalFilters(prev => ({
        ...prev,
        dateRange: [
          startDate ? new Date(startDate) : null,
          endDate ? new Date(endDate) : null
        ]
      }));
    }
  }, [startDate, endDate]);

  const handleToggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const handleResetFilters = () => {
    setLocalFilters({
      dateRange: [null, null],
      projects: [],
      locations: [],
      statuses: [],
      assignees: [],
      groupBy: 'month',
    });
    setStartDate('');
    setEndDate('');
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
    setIsOpen(false);
  };

  const handleMultiSelectChange = (field: keyof AnalyticsFilters, value: string) => {
    setLocalFilters(prev => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [field]: newValues
      };
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <button 
        onClick={handleToggleFilter}
        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
      >
        <span className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {Object.values(localFilters).some(value => 
            Array.isArray(value) ? value.length > 0 : value !== null
          ) && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              ✓
            </span>
          )}
        </span>
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter Dashboard</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Projects */}
              {availableProjects.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Projects
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-2">
                    {availableProjects.map((project) => (
                      <div key={project.id} className="flex items-center mb-1">
                        <input
                          id={`project-${project.id}`}
                          type="checkbox"
                          checked={(localFilters.projects as string[]).includes(project.id)}
                          onChange={() => handleMultiSelectChange('projects', project.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`project-${project.id}`}
                          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                        >
                          {project.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locations */}
              {availableLocations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Locations
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-2">
                    {availableLocations.map((location) => (
                      <div key={location.id} className="flex items-center mb-1">
                        <input
                          id={`location-${location.id}`}
                          type="checkbox"
                          checked={(localFilters.locations as string[]).includes(location.id)}
                          onChange={() => handleMultiSelectChange('locations', location.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`location-${location.id}`}
                          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                        >
                          {location.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statuses */}
              {availableStatuses.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Statuses
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-2">
                    {availableStatuses.map((status) => (
                      <div key={status.id} className="flex items-center mb-1">
                        <input
                          id={`status-${status.id}`}
                          type="checkbox"
                          checked={(localFilters.statuses as string[]).includes(status.id)}
                          onChange={() => handleMultiSelectChange('statuses', status.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`status-${status.id}`}
                          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                        >
                          {status.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Group By
                </label>
                <select
                  value={localFilters.groupBy || 'month'}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, groupBy: e.target.value as 'day' | 'week' | 'month' | 'quarter' | 'year' }))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="quarter">Quarter</option>
                  <option value="year">Year</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
