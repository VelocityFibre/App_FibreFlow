/**
 * Dynamic import utilities for Next.js optimization
 * 
 * Provides optimized dynamic imports with SSR support,
 * loading states, and error handling.
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Loading component for dynamic imports
const DynamicLoading = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600 dark:text-gray-400">{message}</span>
  </div>
);

// Error component for failed dynamic imports
const DynamicError = ({ error, retry }: { error: Error; retry?: () => void }) => (
  <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
    <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">Failed to load</h3>
    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
      {error.message || 'Component could not be loaded'}
    </p>
    {retry && (
      <button
        onClick={retry}
        className="mt-2 px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

// Configuration for dynamic imports
interface DynamicConfig {
  loading?: ComponentType<any>;
  ssr?: boolean;
  loadingMessage?: string;
}

// Helper to create optimized dynamic imports
function createDynamicComponent<T = {}>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  config: DynamicConfig = {}
) {
  const {
    loading = () => <DynamicLoading message={config.loadingMessage} />,
    ssr = false
  } = config;

  return dynamic(importFn, {
    loading,
    ssr
  });
}

// Analytics components (heavy with chart libraries)
export const DynamicAnalyticsDashboard = createDynamicComponent(
  () => import('../app/analytics/dashboard/page'),
  { loadingMessage: 'Loading analytics dashboard...', ssr: false }
);

export const DynamicAnalyticsProjects = createDynamicComponent(
  () => import('../app/analytics/projects/page'),
  { loadingMessage: 'Loading project analytics...', ssr: false }
);

export const DynamicAnalyticsTasks = createDynamicComponent(
  () => import('../app/analytics/tasks/page'),
  { loadingMessage: 'Loading task analytics...', ssr: false }
);

// Chart components (heavy visualization libraries)
export const DynamicBarChart = createDynamicComponent(
  () => import('../components/analytics/charts/BarChart'),
  { loadingMessage: 'Loading chart...', ssr: false }
);

export const DynamicLineChart = createDynamicComponent(
  () => import('../components/analytics/charts/LineChart'),
  { loadingMessage: 'Loading chart...', ssr: false }
);

export const DynamicPieChart = createDynamicComponent(
  () => import('../components/analytics/charts/PieChart'),
  { loadingMessage: 'Loading chart...', ssr: false }
);

export const DynamicGaugeChart = createDynamicComponent(
  () => import('../components/analytics/charts/GaugeChart'),
  { loadingMessage: 'Loading chart...', ssr: false }
);

export const DynamicHeatMapChart = createDynamicComponent(
  () => import('../components/analytics/charts/HeatMapChart'),
  { loadingMessage: 'Loading chart...', ssr: false }
);

export const DynamicCalendarChart = createDynamicComponent(
  () => import('../components/analytics/charts/CalendarChart'),
  { loadingMessage: 'Loading chart...', ssr: false }
);

// Grid components (heavy with AG Grid)
export const DynamicGridDataTable = createDynamicComponent(
  () => import('../app/grid/GridDataTable'),
  { loadingMessage: 'Loading data grid...', ssr: false }
);

export const DynamicTableSelector = createDynamicComponent(
  () => import('../app/grid/TableSelector'),
  { loadingMessage: 'Loading table selector...', ssr: false }
);

// Project hierarchy (complex tree structure)
export const DynamicProjectHierarchyView = createDynamicComponent(
  () => import('../components/ProjectHierarchy').then(mod => ({ default: mod.ProjectHierarchyView })),
  { loadingMessage: 'Loading project hierarchy...', ssr: false }
);

// Real-time components
export const DynamicRealtimeProjectView = createDynamicComponent(
  () => import('../components/RealtimeProjectView'),
  { loadingMessage: 'Loading real-time view...', ssr: false }
);

export const DynamicRealtimeTestDashboard = createDynamicComponent(
  () => import('../components/RealtimeTestComponents').then(mod => ({ default: mod.RealtimeTestDashboard })),
  { loadingMessage: 'Loading test dashboard...', ssr: false }
);

// Admin components (role-restricted)
export const DynamicAdminAuditLogs = createDynamicComponent(
  () => import('../app/admin/audit-logs/page'),
  { loadingMessage: 'Loading audit logs...', ssr: false }
);

export const DynamicAdminPerformance = createDynamicComponent(
  () => import('../app/admin/performance/page'),
  { loadingMessage: 'Loading performance dashboard...', ssr: false }
);

export const DynamicAdminFeatureFlags = createDynamicComponent(
  () => import('../app/admin/feature-flags/page'),
  { loadingMessage: 'Loading feature flags...', ssr: false }
);

export const DynamicAdminPhasesTasks = createDynamicComponent(
  () => import('../app/admin/phases-tasks/page'),
  { loadingMessage: 'Loading phases & tasks...', ssr: false }
);

export const DynamicAdminTasks = createDynamicComponent(
  () => import('../app/admin/tasks/page'),
  { loadingMessage: 'Loading task management...', ssr: false }
);

// Archive management (infrequently used)
export const DynamicArchivedItemsManager = createDynamicComponent(
  () => import('../components/ArchivedItemsManager'),
  { loadingMessage: 'Loading archive manager...', ssr: false }
);

// Project pages
export const DynamicProjectsList = createDynamicComponent(
  () => import('../app/projects/page'),
  { loadingMessage: 'Loading projects...', ssr: true }
);

export const DynamicProjectDetails = createDynamicComponent(
  () => import('../app/projects/[id]/page'),
  { loadingMessage: 'Loading project details...', ssr: true }
);

export const DynamicProjectEdit = createDynamicComponent(
  () => import('../app/projects/[id]/edit/page'),
  { loadingMessage: 'Loading project editor...', ssr: false }
);

// Gantt and Kanban (heavy UI libraries)
export const DynamicGantt = createDynamicComponent(
  () => import('../app/gantt/page'),
  { loadingMessage: 'Loading Gantt chart...', ssr: false }
);

export const DynamicKanban = createDynamicComponent(
  () => import('../app/kanban/page'),
  { loadingMessage: 'Loading Kanban board...', ssr: false }
);

// Management pages
export const DynamicCustomers = createDynamicComponent(
  () => import('../app/customers/page'),
  { loadingMessage: 'Loading customers...', ssr: true }
);

export const DynamicContractors = createDynamicComponent(
  () => import('../app/contractors/page'),
  { loadingMessage: 'Loading contractors...', ssr: true }
);

export const DynamicContacts = createDynamicComponent(
  () => import('../app/contacts/page'),
  { loadingMessage: 'Loading contacts...', ssr: true }
);

export const DynamicMaterials = createDynamicComponent(
  () => import('../app/materials/page'),
  { loadingMessage: 'Loading materials...', ssr: true }
);

export const DynamicLocations = createDynamicComponent(
  () => import('../app/locations/page'),
  { loadingMessage: 'Loading locations...', ssr: true }
);

export const DynamicMyTasks = createDynamicComponent(
  () => import('../app/my-tasks/page'),
  { loadingMessage: 'Loading your tasks...', ssr: false }
);

export const DynamicPlanning = createDynamicComponent(
  () => import('../app/planning/page'),
  { loadingMessage: 'Loading planning tools...', ssr: false }
);

export const DynamicAutoSetup = createDynamicComponent(
  () => import('../app/auto-setup/page'),
  { loadingMessage: 'Loading auto-setup...', ssr: false }
);

// Utility for preloading components
export function preloadDynamicComponent(importFn: () => Promise<any>) {
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback for non-critical preloading
    const preload = () => {
      importFn().catch(console.error);
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preload);
    } else {
      setTimeout(preload, 100);
    }
  }
}

// Critical component preloading strategy
export function preloadCriticalComponents() {
  // Preload components likely to be needed after initial page load
  preloadDynamicComponent(() => import('../components/ProjectHierarchy'));
  preloadDynamicComponent(() => import('../app/analytics/dashboard/page'));
  preloadDynamicComponent(() => import('../app/projects/page'));
}

// Bundle analysis information
export const bundleAnalysis = {
  // Components always in main bundle
  mainBundle: [
    'Layout components (Sidebar, Header)',
    'Theme system',
    'Error boundaries',
    'Core hooks and utilities'
  ],
  
  // Dynamically loaded chunks
  dynamicChunks: [
    {
      name: 'analytics',
      components: ['AnalyticsDashboard', 'Charts', 'Reports'],
      size: 'Large (~500KB)',
      loadTrigger: 'Analytics page visit'
    },
    {
      name: 'admin',
      components: ['AuditLogs', 'Performance', 'FeatureFlags'],
      size: 'Medium (~200KB)',
      loadTrigger: 'Admin page visit'
    },
    {
      name: 'project-hierarchy',
      components: ['ProjectHierarchyView', 'TaskCards'],
      size: 'Medium (~300KB)',
      loadTrigger: 'Project details page'
    },
    {
      name: 'grid',
      components: ['AG Grid DataTable'],
      size: 'Large (~400KB)',
      loadTrigger: 'Grid page visit'
    },
    {
      name: 'real-time',
      components: ['RealtimeComponents', 'PresenceTracking'],
      size: 'Small (~100KB)',
      loadTrigger: 'Real-time features enabled'
    }
  ],
  
  // Heavy dependencies
  heavyDependencies: [
    { name: 'AG Grid', size: '~300KB', usage: 'Data grid functionality' },
    { name: 'Nivo Charts', size: '~200KB', usage: 'Analytics charts' },
    { name: 'Recharts', size: '~150KB', usage: 'Dashboard charts' },
    { name: 'React Query DevTools', size: '~100KB', usage: 'Development only' }
  ]
};

export default {
  // Analytics
  AnalyticsDashboard: DynamicAnalyticsDashboard,
  AnalyticsProjects: DynamicAnalyticsProjects,
  AnalyticsTasks: DynamicAnalyticsTasks,
  
  // Charts
  BarChart: DynamicBarChart,
  LineChart: DynamicLineChart,
  PieChart: DynamicPieChart,
  GaugeChart: DynamicGaugeChart,
  HeatMapChart: DynamicHeatMapChart,
  CalendarChart: DynamicCalendarChart,
  
  // Grid
  GridDataTable: DynamicGridDataTable,
  TableSelector: DynamicTableSelector,
  
  // Project hierarchy
  ProjectHierarchyView: DynamicProjectHierarchyView,
  
  // Real-time
  RealtimeProjectView: DynamicRealtimeProjectView,
  RealtimeTestDashboard: DynamicRealtimeTestDashboard,
  
  // Admin
  AdminAuditLogs: DynamicAdminAuditLogs,
  AdminPerformance: DynamicAdminPerformance,
  AdminFeatureFlags: DynamicAdminFeatureFlags,
  AdminPhasesTasks: DynamicAdminPhasesTasks,
  AdminTasks: DynamicAdminTasks,
  
  // Archive
  ArchivedItemsManager: DynamicArchivedItemsManager,
  
  // Projects
  ProjectsList: DynamicProjectsList,
  ProjectDetails: DynamicProjectDetails,
  ProjectEdit: DynamicProjectEdit,
  
  // Views
  Gantt: DynamicGantt,
  Kanban: DynamicKanban,
  
  // Management
  Customers: DynamicCustomers,
  Contractors: DynamicContractors,
  Contacts: DynamicContacts,
  Materials: DynamicMaterials,
  Locations: DynamicLocations,
  MyTasks: DynamicMyTasks,
  Planning: DynamicPlanning,
  AutoSetup: DynamicAutoSetup
};