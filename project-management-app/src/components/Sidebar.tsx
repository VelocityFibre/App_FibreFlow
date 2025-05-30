"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects', label: 'Projects' },
  { href: '/customers', label: 'Customers' },
  { href: '/contractors', label: 'Contractors' },
  { href: '/my-tasks', label: 'My Tasks' },
  { href: '/planning', label: 'Planning' },
  { href: '/kanban', label: 'Kanban' },
  { href: '/gantt', label: 'Gantt' },
  { href: '/grid', label: 'Grid' },
  { href: '/materials', label: 'Materials' },
  { href: '/analytics/dashboard', label: 'Analytics', featureFlag: FeatureFlag.ANALYTICS_DASHBOARD },
  { href: '/auth', label: 'Settings' },
];

const adminItems = [
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
    <aside className="w-64 h-screen bg-[#003049] text-white flex flex-col justify-between">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-white">FibreFlow</h1>
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
                  ? 'bg-[#00527b] text-white' 
                  : 'text-white hover:bg-[#00527b] hover:text-white'}`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        {/* Admin Section */}
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-white uppercase tracking-wider">Admin</h3>
          <div className="mt-2 space-y-1">
            {adminItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive 
                    ? 'bg-[#00527b] text-white' 
                    : 'text-white hover:bg-[#00527b] hover:text-white'}`}
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
            <h3 className="px-3 text-xs font-semibold text-white uppercase tracking-wider">Analytics</h3>
            <div className="mt-2 space-y-1">
              {analyticsItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive 
                      ? 'bg-[#00527b] text-white' 
                      : 'text-white hover:bg-[#00527b] hover:text-white'}`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-[#00527b]">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-[#00527b] rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">VF</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Velocity Fibre</p>
            <p className="text-xs text-gray-300">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
