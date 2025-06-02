"use client";

import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';
import { DataPoint, EnhancedDataPoint } from '@/lib/analytics/types';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
import { performanceUtils } from '@/lib/performance-monitor';

interface BarChartProps {
  data: DataPoint[] | EnhancedDataPoint[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  barColor?: string;
  horizontal?: boolean;
  showLegend?: boolean;
  height?: number;
  className?: string;
}

export default function BarChart({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  barColor = '#3b82f6',
  horizontal = false,
  showLegend = true,
  height = 300,
  className = '',
}: BarChartProps) {
  // Start performance measurement
  const metricId = useMemo(() => {
    if (isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
      return performanceUtils.startMetric('BarChart.render', { dataPoints: data.length });
    }
    return null;
  }, [data.length]);
  
  // Clean up performance measurement on unmount
  React.useEffect(() => {
    return () => {
      if (metricId && isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
        performanceUtils.endMetric('BarChart.render');
      }
    };
  }, [metricId]);

  const chartData = useMemo(() => {
    // Ensure data is sorted by value for better visualization
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={chartData}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          {horizontal ? (
            <>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" />
              <YAxis />
            </>
          )}
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderColor: '#e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          {showLegend && <Legend />}
          <Bar 
            dataKey="value" 
            name={yAxisLabel || "Value"} 
            isAnimationActive={true}
            animationDuration={500}
          >
            {chartData.map((entry, index) => {
              const color = (entry as EnhancedDataPoint).color || barColor;
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
