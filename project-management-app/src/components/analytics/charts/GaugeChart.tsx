"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
import { performanceUtils } from '@/lib/performance-monitor';

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  unit?: string;
  thresholds?: [number, number]; // [warning, critical] thresholds
  colors?: [string, string, string]; // [good, warning, critical] colors
  height?: number;
  className?: string;
}

export default function GaugeChart({
  value,
  min = 0,
  max = 100,
  title,
  unit = '%',
  thresholds = [60, 80],
  colors = ['#10b981', '#f59e0b', '#ef4444'],
  height = 200,
  className = '',
}: GaugeChartProps) {
  // Start performance measurement
  const metricId = useMemo(() => {
    if (isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
      return performanceUtils.startMetric('GaugeChart.render');
    }
    return null;
  }, []);
  
  // Clean up performance measurement on unmount
  React.useEffect(() => {
    return () => {
      if (metricId && isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
        performanceUtils.endMetric('GaugeChart.render');
      }
    };
  }, [metricId]);

  // Clamp value to min/max range
  const clampedValue = useMemo(() => {
    return Math.max(min, Math.min(max, value));
  }, [value, min, max]);

  // Calculate percentage for gauge
  const percentage = useMemo(() => {
    return ((clampedValue - min) / (max - min)) * 100;
  }, [clampedValue, min, max]);

  // Determine color based on thresholds
  const color = useMemo(() => {
    if (percentage >= thresholds[1]) return colors[2]; // Critical
    if (percentage >= thresholds[0]) return colors[1]; // Warning
    return colors[0]; // Good
  }, [percentage, thresholds, colors]);

  // Prepare data for the gauge chart
  const data = useMemo(() => {
    return [
      { name: 'Value', value: percentage },
      { name: 'Empty', value: 100 - percentage },
    ];
  }, [percentage]);

  // Calculate the start angle and end angle for a semi-circle
  const startAngle = 180;
  const endAngle = 0;

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      )}
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={startAngle}
              endAngle={endAngle}
              innerRadius={height * 0.5}
              outerRadius={height * 0.8}
              paddingAngle={0}
              dataKey="value"
              isAnimationActive={true}
              animationDuration={500}
            >
              <Cell fill={color} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Value display in the center of the gauge */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ top: height * 0.4 }}
        >
          <div className="text-3xl font-bold" style={{ color }}>
            {clampedValue.toFixed(clampedValue % 1 === 0 ? 0 : 1)}
            <span className="text-lg ml-1">{unit}</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {min} - {max} {unit}
          </div>
        </div>
      </div>
    </div>
  );
}
