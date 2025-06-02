"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects', label: 'Projects' },
  { href: '/customers', label: 'Customers' },
  { href: '/my-tasks', label: 'My Tasks' },
  { href: '/kanban', label: 'Kanban' },
  { href: '/gantt', label: 'Gantt' },
  { href: '/grid', label: 'Grid' },
  { href: '/materials', label: 'Materials' },
  { href: '/analytics/dashboard', label: 'Analytics', featureFlag: FeatureFlag.ANALYTICS_DASHBOARD },
  { href: '/auth', label: 'Settings' },
];

const adminItems = [
  { href: '/staff', label: 'Staff Management' },
  { href: '/auto-setup', label: 'Database Setup' },
  { href: '/admin/tasks', label: 'All Tasks' },
  { href: '/admin/phases-tasks', label: 'Phases & Tasks' },
  { href: '/admin/audit-logs', label: 'Audit Logs' },
  { href: '/admin/feature-flags', label: 'Feature Flags' },
  { href: '/admin/performance', label: 'Performance' },
];

const analyticsItems = [
  { href: '/analytics/dashboard', label: 'Overview' },
  { href: '/analytics/projects', label: 'Projects' },
  { href: '/analytics/tasks', label: 'Tasks' },
  { href: '/analytics/locations', label: 'Locations' },
  { href: '/analytics/audit', label: 'Audit Trail' },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">FibreFlow</h1>
      </div>
      
      <nav className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            // Skip items that require a feature flag that is not enabled
            if (item.featureFlag && !isFeatureEnabled(item.featureFlag)) {
              return null;
            }
            
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        {/* Admin Section */}
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</h3>
          <div className="mt-2 space-y-1">
            {adminItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Analytics Section - Only show if feature flag is enabled */}
        {isFeatureEnabled(FeatureFlag.ANALYTICS_DASHBOARD) && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Analytics</h3>
            <div className="mt-2 space-y-1">
              {analyticsItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive 
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">VF</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Velocity Fibre</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
