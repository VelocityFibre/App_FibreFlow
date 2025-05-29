/**
 * Analytics data models and TypeScript interfaces
 * These types define the structure of data used in analytics visualizations
 */

// Basic chart data point with name and value
export interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

// Extended data point with additional properties
export interface EnhancedDataPoint extends DataPoint {
  color?: string;
  id?: string | number;
  category?: string;
}

// Time series data point
export interface TimeSeriesDataPoint {
  date: string | Date;
  value: number;
  category?: string;
}

// Multi-series data for line and bar charts
export interface MultiSeriesData {
  name: string;
  series: EnhancedDataPoint[];
}

// Project analytics data
export interface ProjectAnalytics {
  id: string;
  name: string;
  tasksCompleted: number;
  tasksTotal: number;
  completionRate: number;
  daysActive: number;
  startDate?: string;
  endDate?: string;
  location?: string;
  phaseData?: EnhancedDataPoint[];
}

// Task analytics data
export interface TaskAnalytics {
  id: number;
  name: string;
  status: string;
  assignee?: string;
  daysAssigned: number;
  daysToComplete?: number;
  projectId: string;
  projectName?: string;
}

// Performance metrics for analytics dashboard
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  dataFetchTime: number;
  componentCount: number;
  memoryUsage?: number;
}

// Dashboard filter state
export interface AnalyticsFilters {
  dateRange?: [Date | null, Date | null];
  projects?: string[];
  locations?: string[];
  statuses?: string[];
  assignees?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

// Dashboard configuration
export interface DashboardConfig {
  charts: {
    id: string;
    type: 'bar' | 'line' | 'pie' | 'gauge' | 'calendar' | 'heatmap' | 'table';
    title: string;
    dataSource: string;
    position: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
    options?: Record<string, any>;
  }[];
}

// Chart theme options
export interface ChartTheme {
  colors: string[];
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  fontFamily: string;
  isDark: boolean;
}
