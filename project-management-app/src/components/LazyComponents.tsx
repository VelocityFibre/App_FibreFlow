/**
 * Lazy-loaded components for code splitting
 * 
 * This file provides lazy-loaded versions of heavy components
 * to improve initial bundle size and loading performance.
 */

import { lazy, Suspense, ComponentType } from 'react';

// Loading spinner component
const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600 dark:text-gray-400">{message}</span>
  </div>
);

// Error boundary fallback for lazy components
const LazyErrorFallback = ({ error, retry }: { error: Error; retry?: () => void }) => (
  <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
    <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">Failed to load component</h3>
    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
      {error.message || 'An error occurred while loading this section'}
    </p>
    {retry && (
      <button
        onClick={retry}
        className="mt-2 px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    )}
  </div>
);

// Higher-order component for lazy loading with error boundary
function withLazyLoading<T extends {}>(
  Component: ComponentType<T>,
  loadingMessage?: string
) {
  return (props: T) => (
    <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
      <Component {...props} />
    </Suspense>
  );
}

// Lazy-loaded components for major features

// Analytics components (heavy with charts)
export const LazyAnalyticsDashboard = lazy(() => 
  import('../app/analytics/dashboard/page').then(module => ({ default: module.default }))
);

export const LazyAnalyticsCharts = lazy(() => 
  import('../components/analytics/charts').then(module => ({ default: module.BarChart }))
);

// Project Hierarchy (complex tree structure)
export const LazyProjectHierarchyView = lazy(() => 
  import('../components/ProjectHierarchy').then(module => ({ default: module.ProjectHierarchyView }))
);

// Grid DataTable (heavy with AG Grid)
export const LazyGridDataTable = lazy(() => 
  import('../app/grid/GridDataTable').then(module => ({ default: module.default }))
);

// Real-time components
export const LazyRealtimeProjectView = lazy(() => 
  import('../components/RealtimeProjectView').then(module => ({ default: module.default }))
);

export const LazyRealtimeTestComponents = lazy(() => 
  import('../components/RealtimeTestComponents').then(module => ({ default: module.RealtimeTestDashboard }))
);

// Archive management (infrequently used)
export const LazyArchivedItemsManager = lazy(() => 
  import('../components/ArchivedItemsManager').then(module => ({ default: module.default }))
);

// Admin components (role-restricted)
export const LazyAdminAuditLogs = lazy(() => 
  import('../app/admin/audit-logs/page').then(module => ({ default: module.default }))
);

export const LazyAdminPerformance = lazy(() => 
  import('../app/admin/performance/page').then(module => ({ default: module.default }))
);

// Wrapped components with loading states
export const AnalyticsDashboard = withLazyLoading(LazyAnalyticsDashboard, 'Loading analytics dashboard...');
export const ProjectHierarchyView = withLazyLoading(LazyProjectHierarchyView, 'Loading project hierarchy...');
export const GridDataTable = withLazyLoading(LazyGridDataTable, 'Loading data grid...');
export const RealtimeProjectView = withLazyLoading(LazyRealtimeProjectView, 'Loading real-time project view...');
export const ArchivedItemsManager = withLazyLoading(LazyArchivedItemsManager, 'Loading archive manager...');
export const AdminAuditLogs = withLazyLoading(LazyAdminAuditLogs, 'Loading audit logs...');
export const AdminPerformance = withLazyLoading(LazyAdminPerformance, 'Loading performance dashboard...');
export const RealtimeTestDashboard = withLazyLoading(LazyRealtimeTestComponents, 'Loading test dashboard...');

// Chart components (heavy with visualization libraries)
export const LazyBarChart = lazy(() => 
  import('../components/analytics/charts/BarChart').then(module => ({ default: module.default }))
);

export const LazyLineChart = lazy(() => 
  import('../components/analytics/charts/LineChart').then(module => ({ default: module.default }))
);

export const LazyPieChart = lazy(() => 
  import('../components/analytics/charts/PieChart').then(module => ({ default: module.default }))
);

export const LazyGaugeChart = lazy(() => 
  import('../components/analytics/charts/GaugeChart').then(module => ({ default: module.default }))
);

export const LazyHeatMapChart = lazy(() => 
  import('../components/analytics/charts/HeatMapChart').then(module => ({ default: module.default }))
);

export const LazyCalendarChart = lazy(() => 
  import('../components/analytics/charts/CalendarChart').then(module => ({ default: module.default }))
);

// Wrapped chart components
export const BarChart = withLazyLoading(LazyBarChart, 'Loading chart...');
export const LineChart = withLazyLoading(LazyLineChart, 'Loading chart...');
export const PieChart = withLazyLoading(LazyPieChart, 'Loading chart...');
export const GaugeChart = withLazyLoading(LazyGaugeChart, 'Loading chart...');
export const HeatMapChart = withLazyLoading(LazyHeatMapChart, 'Loading chart...');
export const CalendarChart = withLazyLoading(LazyCalendarChart, 'Loading chart...');

// Route-based lazy loading for pages
export const LazyRoutes = {
  // Analytics routes
  AnalyticsDashboard: lazy(() => import('../app/analytics/dashboard/page')),
  AnalyticsProjects: lazy(() => import('../app/analytics/projects/page')),
  AnalyticsTasks: lazy(() => import('../app/analytics/tasks/page')),
  AnalyticsLocations: lazy(() => import('../app/analytics/locations/page')),
  AnalyticsAudit: lazy(() => import('../app/analytics/audit/page')),
  
  // Admin routes
  AdminAuditLogs: lazy(() => import('../app/admin/audit-logs/page')),
  AdminPerformance: lazy(() => import('../app/admin/performance/page')),
  AdminFeatureFlags: lazy(() => import('../app/admin/feature-flags/page')),
  AdminPhasesTasks: lazy(() => import('../app/admin/phases-tasks/page')),
  AdminTasks: lazy(() => import('../app/admin/tasks/page')),
  
  // Feature routes
  ProjectsList: lazy(() => import('../app/projects/page')),
  ProjectDetails: lazy(() => import('../app/projects/[id]/page')),
  ProjectEdit: lazy(() => import('../app/projects/[id]/edit/page')),
  Gantt: lazy(() => import('../app/gantt/page')),
  Kanban: lazy(() => import('../app/kanban/page')),
  Grid: lazy(() => import('../app/grid/page')),
  
  // Management routes
  Customers: lazy(() => import('../app/customers/page')),
  Contractors: lazy(() => import('../app/contractors/page')),
  Contacts: lazy(() => import('../app/contacts/page')),
  Materials: lazy(() => import('../app/materials/page')),
  Locations: lazy(() => import('../app/locations/page')),
  MyTasks: lazy(() => import('../app/my-tasks/page')),
  Planning: lazy(() => import('../app/planning/page')),
  AutoSetup: lazy(() => import('../app/auto-setup/page'))
};

// Wrapper for route components
export function LazyRoute({ 
  component: Component, 
  loadingMessage = 'Loading page...',
  ...props 
}: { 
  component: ComponentType<any>;
  loadingMessage?: string;
  [key: string]: any;
}) {
  return (
    <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
      <Component {...props} />
    </Suspense>
  );
}

// Preload function for components that are likely to be needed
export function preloadComponent(componentLoader: () => Promise<any>) {
  // Use requestIdleCallback for non-critical preloading
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      componentLoader().catch(console.error);
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      componentLoader().catch(console.error);
    }, 100);
  }
}

// Preload critical components after initial load
export function preloadCriticalComponents() {
  preloadComponent(() => import('../components/ProjectHierarchy'));
  preloadComponent(() => import('../app/analytics/dashboard/page'));
  preloadComponent(() => import('../app/projects/page'));
}

// Export utility for bundle analysis
export const bundleInfo = {
  // Core components (always loaded)
  core: [
    'Sidebar',
    'ThemeSwitcher', 
    'ErrorBoundary',
    'ModuleOverviewLayout'
  ],
  
  // Lazy-loaded features
  lazy: [
    'AnalyticsDashboard',
    'ProjectHierarchyView', 
    'GridDataTable',
    'RealtimeProjectView',
    'ArchivedItemsManager',
    'Charts (Bar, Line, Pie, Gauge, HeatMap, Calendar)',
    'Admin components',
    'Route components'
  ],
  
  // Heavy dependencies
  heavyDeps: [
    'AG Grid',
    'Nivo Charts',
    'Recharts',
    'D3.js',
    'React Query DevTools'
  ]
};