"use client";

import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Dot
} from 'recharts';
import { TimeSeriesDataPoint, MultiSeriesData } from '@/lib/analytics/types';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
import { performanceUtils } from '@/lib/performance-monitor';

interface LineChartProps {
  data: TimeSeriesDataPoint[] | MultiSeriesData[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  showLegend?: boolean;
  showDots?: boolean;
  height?: number;
  className?: string;
  isMultiSeries?: boolean;
}

export default function LineChart({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  showLegend = true,
  showDots = true,
  height = 300,
  className = '',
  isMultiSeries = false,
}: LineChartProps) {
  // Start performance measurement
  const metricId = useMemo(() => {
    if (isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
      return performanceUtils.startMetric('LineChart.render', { 
        dataPoints: isMultiSeries 
          ? (data as MultiSeriesData[]).reduce((sum, series) => sum + series.series.length, 0)
          : data.length 
      });
    }
    return null;
  }, [data, isMultiSeries]);
  
  // Clean up performance measurement on unmount
  React.useEffect(() => {
    return () => {
      if (metricId && isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
        performanceUtils.endMetric('LineChart.render');
      }
    };
  }, [metricId]);

  // Prepare chart data based on whether it's multi-series or not
  const chartData = useMemo(() => {
    if (isMultiSeries) {
      // For multi-series, we need to transform the data
      // First, get all unique categories across all series
      const allSeries = data as MultiSeriesData[];
      const categories = new Set<string>();
      
      allSeries.forEach(series => {
        series.series.forEach(point => {
          categories.add(point.name);
        });
      });
      
      // Create a map of category -> { category, series1Value, series2Value, ... }
      const categoryMap: Record<string, any> = {};
      
      Array.from(categories).forEach(category => {
        categoryMap[category] = { name: category };
        
        allSeries.forEach(series => {
          const point = series.series.find(p => p.name === category);
          categoryMap[category][series.name] = point ? point.value : 0;
        });
      });
      
      // Convert the map to an array and sort by category
      return Object.values(categoryMap).sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // For single series, sort by date
      return [...(data as TimeSeriesDataPoint[])]
        .sort((a, b) => {
          const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
          const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
          return dateA.getTime() - dateB.getTime();
        });
    }
  }, [data, isMultiSeries]);

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis 
            dataKey={isMultiSeries ? "name" : "date"} 
            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
          />
          <YAxis 
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderColor: '#e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            formatter={(value: number) => [value, yAxisLabel || 'Value']}
            labelFormatter={(label) => xAxisLabel ? `${xAxisLabel}: ${label}` : label}
          />
          {showLegend && <Legend />}
          
          {isMultiSeries ? (
            // Render multiple lines for multi-series data
            (data as MultiSeriesData[]).map((series, index) => (
              <Line
                key={series.name}
                type="monotone"
                dataKey={series.name}
                stroke={colors[index % colors.length]}
                activeDot={{ r: 8 }}
                dot={showDots}
                isAnimationActive={true}
                animationDuration={500}
              />
            ))
          ) : (
            // Render single line for time series data
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              activeDot={{ r: 8 }}
              dot={showDots}
              isAnimationActive={true}
              animationDuration={500}
            />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
