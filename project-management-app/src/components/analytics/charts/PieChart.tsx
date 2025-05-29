"use client";

import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';
import { DataPoint, EnhancedDataPoint } from '@/lib/analytics/types';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
import { performanceUtils } from '@/lib/performance-monitor';

interface PieChartProps {
  data: DataPoint[] | EnhancedDataPoint[];
  title?: string;
  colors?: string[];
  showLegend?: boolean;
  showLabels?: boolean;
  donut?: boolean;
  height?: number;
  className?: string;
}

export default function PieChart({
  data,
  title,
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#64748b'],
  showLegend = true,
  showLabels = true,
  donut = false,
  height = 300,
  className = '',
}: PieChartProps) {
  // Start performance measurement
  const metricId = useMemo(() => {
    if (isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
      return performanceUtils.startMetric('PieChart.render', { dataPoints: data.length });
    }
    return null;
  }, [data.length]);
  
  // Clean up performance measurement on unmount
  React.useEffect(() => {
    return () => {
      if (metricId && isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
        performanceUtils.endMetric('PieChart.render');
      }
    };
  }, [metricId]);

  // Filter out zero values and prepare chart data
  const chartData = useMemo(() => {
    return data
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // Calculate total for percentage display
  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // Custom label renderer
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    if (!showLabels) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={height / 3}
            innerRadius={donut ? height / 6 : 0}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            isAnimationActive={true}
            animationDuration={500}
          >
            {chartData.map((entry, index) => {
              const color = (entry as EnhancedDataPoint).color || colors[index % colors.length];
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Pie>
          <Tooltip
            formatter={(value: number) => {
              const percentage = ((value / total) * 100).toFixed(1);
              return [`${value} (${percentage}%)`, 'Value'];
            }}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              borderColor: '#e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          {showLegend && (
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{ paddingLeft: '20px' }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
