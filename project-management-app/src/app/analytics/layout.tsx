"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';

const analyticsNavItems = [
  { href: '/analytics/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/analytics/projects', label: 'Projects', icon: '🏗️' },
  { href: '/analytics/tasks', label: 'Tasks', icon: '✅' },
  { href: '/analytics/locations', label: 'Locations', icon: '📍' },
  { href: '/analytics/audit', label: 'Audit Trail', icon: '📝' },
];

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAnalyticsEnabled = isFeatureEnabled(FeatureFlag.ANALYTICS_DASHBOARD);

  if (!isAnalyticsEnabled) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6">
      {/* Analytics Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <nav className="flex p-2">
            {analyticsNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 mx-1 rounded-md text-sm font-medium flex items-center ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        {children}
      </div>

      {/* Analytics Footer - Version and Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div>Analytics Dashboard v1.0</div>
          <div>
            <span className="mr-4">Last updated: {new Date().toLocaleDateString()}</span>
            <span>Data source: Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
}
