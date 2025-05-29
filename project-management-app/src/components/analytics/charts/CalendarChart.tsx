"use client";

import React, { useMemo } from 'react';
import { ResponsiveCalendar } from '@nivo/calendar';
import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags';
import { performanceUtils } from '@/lib/performance-monitor';

interface CalendarData {
  day: string; // Format: YYYY-MM-DD
  value: number;
}

interface CalendarChartProps {
  data: CalendarData[];
  title?: string;
  fromDate?: string; // Format: YYYY-MM-DD
  toDate?: string; // Format: YYYY-MM-DD
  emptyColor?: string;
  colors?: string[];
  height?: number;
  className?: string;
  dayBorderWidth?: number;
  monthBorderWidth?: number;
  monthLegend?: boolean;
}

export default function CalendarChart({
  data,
  title,
  fromDate,
  toDate,
  emptyColor = '#f5f5f5',
  colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  height = 200,
  className = '',
  dayBorderWidth = 1,
  monthBorderWidth = 2,
  monthLegend = true,
}: CalendarChartProps) {
  // Start performance measurement
  const metricId = useMemo(() => {
    if (isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
      return performanceUtils.startMetric('CalendarChart.render', { dataPoints: data.length });
    }
    return null;
  }, [data.length]);
  
  // Clean up performance measurement on unmount
  React.useEffect(() => {
    return () => {
      if (metricId && isFeatureEnabled(FeatureFlag.PERFORMANCE_MONITORING)) {
        performanceUtils.endMetric('CalendarChart.render');
      }
    };
  }, [metricId]);

  // Calculate from and to dates if not provided
  const { calculatedFromDate, calculatedToDate } = useMemo(() => {
    if (fromDate && toDate) {
      return { calculatedFromDate: fromDate, calculatedToDate: toDate };
    }
    
    // If dates not provided, calculate from data or use current year
    if (data.length > 0) {
      const dates = data.map(d => new Date(d.day).getTime());
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      
      // Format dates as YYYY-MM-DD
      return {
        calculatedFromDate: minDate.toISOString().split('T')[0],
        calculatedToDate: maxDate.toISOString().split('T')[0],
      };
    }
    
    // Default to current year if no data
    const currentYear = new Date().getFullYear();
    return {
      calculatedFromDate: `${currentYear}-01-01`,
      calculatedToDate: `${currentYear}-12-31`,
    };
  }, [data, fromDate, toDate]);

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      )}
      <div style={{ height: `${height}px` }}>
        <ResponsiveCalendar
          data={data}
          from={calculatedFromDate}
          to={calculatedToDate}
          emptyColor={emptyColor}
          colors={colors}
          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
          yearSpacing={40}
          monthSpacing={10}
          monthBorderColor="#ffffff"
          dayBorderWidth={dayBorderWidth}
          dayBorderColor="#ffffff"
          monthBorderWidth={monthBorderWidth}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'row',
              translateY: 36,
              itemCount: 4,
              itemWidth: 42,
              itemHeight: 36,
              itemsSpacing: 14,
              itemDirection: 'right-to-left'
            }
          ]}
          tooltip={(data) => (
            <div className="bg-white p-2 rounded shadow-md border border-gray-200">
              <strong>{data.day}</strong>
              <br />
              <span>{data.value} {data.value === 1 ? 'item' : 'items'}</span>
            </div>
          )}
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
