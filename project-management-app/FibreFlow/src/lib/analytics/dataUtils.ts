import { 
  DataPoint, 
  EnhancedDataPoint, 
  TimeSeriesDataPoint, 
  MultiSeriesData,
  ProjectAnalytics,
  TaskAnalytics,
  AnalyticsFilters
} from './types';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

/**
 * Utility functions for transforming and aggregating data for analytics visualizations
 */

/**
 * Groups data by a specific property and calculates count
 */
export function groupByCount<T>(
  data: T[], 
  groupByProperty: keyof T
): DataPoint[] {
  const groups: Record<string, number> = {};
  
  data.forEach(item => {
    const key = String(item[groupByProperty] || 'Unknown');
    groups[key] = (groups[key] || 0) + 1;
  });
  
  return Object.entries(groups).map(([name, value]) => ({ name, value }));
}

/**
 * Groups data by a specific property and calculates sum of a numeric property
 */
export function groupBySum<T>(
  data: T[], 
  groupByProperty: keyof T, 
  sumProperty: keyof T
): DataPoint[] {
  const groups: Record<string, number> = {};
  
  data.forEach(item => {
    const key = String(item[groupByProperty] || 'Unknown');
    const value = Number(item[sumProperty] || 0);
    groups[key] = (groups[key] || 0) + value;
  });
  
  return Object.entries(groups).map(([name, value]) => ({ name, value }));
}

/**
 * Groups time series data by date
 */
export function groupByDate<T>(
  data: T[],
  dateProperty: keyof T,
  valueProperty: keyof T,
  dateFormat: string = 'yyyy-MM-dd'
): TimeSeriesDataPoint[] {
  const groups: Record<string, number> = {};
  
  data.forEach(item => {
    const dateValue = item[dateProperty];
    if (!dateValue) return;
    
    const dateStr = typeof dateValue === 'string' 
      ? format(parseISO(dateValue), dateFormat)
      : format(dateValue as Date, dateFormat);
    
    const value = Number(item[valueProperty] || 0);
    groups[dateStr] = (groups[dateStr] || 0) + value;
  });
  
  return Object.entries(groups)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Creates multi-series data for charts that need multiple series
 */
export function createMultiSeriesData<T>(
  data: T[],
  seriesProperty: keyof T,
  categoryProperty: keyof T,
  valueProperty: keyof T
): MultiSeriesData[] {
  const seriesMap: Record<string, Record<string, number>> = {};
  
  // Get unique series and categories
  const seriesSet = new Set<string>();
  const categorySet = new Set<string>();
  
  data.forEach(item => {
    const series = String(item[seriesProperty] || 'Unknown');
    const category = String(item[categoryProperty] || 'Unknown');
    
    seriesSet.add(series);
    categorySet.add(category);
    
    if (!seriesMap[series]) {
      seriesMap[series] = {};
    }
    
    const value = Number(item[valueProperty] || 0);
    seriesMap[series][category] = (seriesMap[series][category] || 0) + value;
  });
  
  // Convert to MultiSeriesData format
  return Array.from(seriesSet).map(seriesName => ({
    name: seriesName,
    series: Array.from(categorySet).map(category => ({
      name: category,
      value: seriesMap[seriesName][category] || 0
    }))
  }));
}

/**
 * Applies filters to analytics data
 */
export function applyFilters<T extends { [key: string]: any }>(
  data: T[],
  filters: AnalyticsFilters,
  dateField: keyof T = 'created_at'
): T[] {
  return data.filter(item => {
    // Date range filter
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const itemDate = item[dateField] 
        ? typeof item[dateField] === 'string' 
          ? parseISO(item[dateField] as string) 
          : item[dateField] as Date
        : null;
        
      if (itemDate && !isWithinInterval(itemDate, {
        start: startOfDay(filters.dateRange[0]),
        end: endOfDay(filters.dateRange[1])
      })) {
        return false;
      }
    }
    
    // Project filter
    if (filters.projects?.length && item.project_id) {
      if (!filters.projects.includes(item.project_id as string)) {
        return false;
      }
    }
    
    // Location filter
    if (filters.locations?.length && item.location_id) {
      if (!filters.locations.includes(item.location_id as string)) {
        return false;
      }
    }
    
    // Status filter
    if (filters.statuses?.length && item.status) {
      if (!filters.statuses.includes(item.status as string)) {
        return false;
      }
    }
    
    // Assignee filter
    if (filters.assignees?.length && item.assigned_to) {
      if (!filters.assignees.includes(item.assigned_to as string)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Calculates completion rate for projects
 */
export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Generates color scale based on value
 */
export function generateColorScale(
  value: number, 
  min: number, 
  max: number, 
  colorRange: [string, string, string] = ['#ef4444', '#f59e0b', '#22c55e']
): string {
  if (value <= min) return colorRange[0];
  if (value >= max) return colorRange[2];
  
  const normalizedValue = (value - min) / (max - min);
  if (normalizedValue <= 0.5) {
    // Blend between first and second color
    return blendColors(colorRange[0], colorRange[1], normalizedValue * 2);
  } else {
    // Blend between second and third color
    return blendColors(colorRange[1], colorRange[2], (normalizedValue - 0.5) * 2);
  }
}

/**
 * Blends two colors based on ratio
 */
function blendColors(color1: string, color2: string, ratio: number): string {
  // Convert hex to RGB
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  // Parse the hex values
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  // Calculate blended color
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
