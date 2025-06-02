"use client";

import React, { useMemo } from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
import { performanceUtils } from '@/lib/performance-monitor';

interface HeatMapData {
  id: string;
  data: Array<{
    x: string;
    y: number;
  }>;
}

interface HeatMapChartProps {
  data: HeatMapData[];
  title?: string;
  xLegend?: string;
  yLegend?: string;
  colors?: string[];
  height?: number;
  className?: string;
}

export default function HeatMapChart({
  data,
  title,
  xLegend,
  yLegend,
  colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  height = 400,
  className = '',
}: HeatMapChartProps) {
  // Start performance measurement
  const metricId = useMemo(() => {
    if (isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
      return performanceUtils.startMetric('HeatMapChart.render', { 
        rows: data.length,
        columns: data[0]?.data.length || 0
      });
    }
    return null;
  }, [data]);
  
  // Clean up performance measurement on unmount
  React.useEffect(() => {
    return () => {
      if (metricId && isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
        performanceUtils.endMetric('HeatMapChart.render');
      }
    };
  }, [metricId]);

  // Find the min and max values for color scaling
  const { minValue, maxValue } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    
    data.forEach(row => {
      row.data.forEach(cell => {
        if (cell.y < min) min = cell.y;
        if (cell.y > max) max = cell.y;
      });
    });
    
    return { minValue: min, maxValue: max };
  }, [data]);

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      )}
      <div style={{ height: `${height}px` }}>
        <ResponsiveHeatMap
          data={data}
          margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
          valueFormat=">-.2s"
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: xLegend || '',
            legendOffset: 46
          }}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: xLegend || '',
            legendOffset: 46
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: yLegend || '',
            legendPosition: 'middle',
            legendOffset: -72
          }}
          colors={{
            type: 'sequential',
            scheme: 'greens',
            minValue: minValue,
            maxValue: maxValue
          }}
          emptyColor="#f5f5f5"
          borderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
          legends={[
            {
              anchor: 'bottom-right',
              translateX: 0,
              translateY: 30,
              length: 140,
              thickness: 8,
              direction: 'row',
              tickPosition: 'after',
              tickSize: 3,
              tickSpacing: 4,
              tickOverlap: false,
              tickFormat: '>-.2s',
              title: 'Value →',
              titleAlign: 'start',
              titleOffset: 4
            }
          ]}
          annotations={[]}
          theme={{
            tooltip: {
              container: {
                background: 'white',
                color: 'black',
                fontSize: 12,
                borderRadius: '4px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }
            }
          }}
        />
      </div>
    </div>
  );
}
