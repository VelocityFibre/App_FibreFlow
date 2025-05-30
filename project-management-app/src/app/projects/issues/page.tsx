"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import ModuleOverviewLayout from '@/components/ModuleOverviewLayout';
import ActionButton from '@/components/ActionButton';
import { FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function IssuesTrackerPage() {
  const [filter, setFilter] = useState('all');

  return (
    <ModuleOverviewLayout
      title="Issues Tracker"
      description="Track and resolve issues that arise during project implementation"
      actions={
        <div className="flex space-x-3">
          <ActionButton label="Report Issue" variant="primary" onClick={() => {}} />
          <Link href="/projects">
            <ActionButton label="Back to Projects" variant="outline" onClick={() => {}} />
          </Link>
        </div>
      }
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Issues</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  filter === 'all'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('open')}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  filter === 'open'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  filter === 'resolved'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <FiAlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Critical Issues</h4>
              </div>
              <p className="text-2xl font-bold text-red-900 dark:text-red-200 mt-2">0</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <FiClock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-200">Pending Resolution</h4>
              </div>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mt-2">0</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <h4 className="text-sm font-medium text-green-900 dark:text-green-200">Resolved This Week</h4>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-200 mt-2">0</p>
            </div>
          </div>

          <div className="text-center py-8">
            <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No issues reported</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by reporting your first issue.</p>
            <div className="mt-6">
              <ActionButton label="Report First Issue" variant="primary" onClick={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </ModuleOverviewLayout>
  );
}