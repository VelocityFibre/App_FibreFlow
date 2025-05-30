"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import ModuleOverviewLayout from '@/components/ModuleOverviewLayout';
import ActionButton from '@/components/ActionButton';

export default function DailyTrackerPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <ModuleOverviewLayout
      title="Daily Tracker"
      description="Track daily project progress, submit reports, and monitor milestones"
      actions={
        <div className="flex space-x-3">
          <ActionButton label="Add Daily Report" variant="primary" onClick={() => {}} />
          <Link href="/projects">
            <ActionButton label="Back to Projects" variant="outline" onClick={() => {}} />
          </Link>
        </div>
      }
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Select Date
          </label>
          <input
            type="date"
            id="date-select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 block w-full max-w-xs border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049] sm:text-sm"
          />
        </div>

        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Daily Progress Summary</h3>
            <p className="text-gray-600 dark:text-gray-300">No reports available for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Completed</h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Milestones Reached</h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Issues Reported</h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
            </div>
          </div>
        </div>
      </div>
    </ModuleOverviewLayout>
  );
}