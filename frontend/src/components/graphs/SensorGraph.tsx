'use client';

import { useMemo, useRef, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from 'recharts';
import { motion } from 'motion/react';
import { SensorType, SENSOR_TYPE_INFO, getSensorColor } from '../../constants/sensor-types';
import { clsx } from 'clsx';

interface SensorDataPoint {
  timestamp: string;
  value: number;
  min?: number;
  max?: number;
  avg?: number;
}

interface SensorGraphProps {
  data: SensorDataPoint[];
  sensorType: SensorType;
  unit?: string;
  height?: number;
  showArea?: boolean;
  showMinMax?: boolean;
  threshold?: { min?: number; max?: number };
  className?: string;
  animate?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div
        className="bg-secondary-900 dark:bg-secondary-100 text-white dark:text-secondary-900 px-3 py-2 rounded-lg shadow-lg border border-secondary-700 dark:border-secondary-300 text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="font-medium">{label}</p>
        <p className="text-primary-400 dark:text-primary-600">
          {payload[0].value.toFixed(2)} {payload[0].unit || ''}
        </p>
        {data.min !== undefined && <p>Min: {data.min.toFixed(2)}</p>}
        {data.max !== undefined && <p>Max: {data.max.toFixed(2)}</p>}
        {data.avg !== undefined && <p>Avg: {data.avg.toFixed(2)}</p>}
      </motion.div>
    );
  }
  return null;
};

export function SensorGraph({
  data,
  sensorType,
  unit,
  height = 300,
  showArea = true,
  showMinMax = false,
  threshold,
  className,
  animate = true,
}: SensorGraphProps) {
  const info = SENSOR_TYPE_INFO[sensorType];
  const displayUnit = unit || info.unit;
  const color = getSensorColor(sensorType);

  const chartData = useMemo(() => data.map((point, index) => ({
    ...point,
    timestamp: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fullTimestamp: new Date(point.timestamp).toISOString(),
    index,
  })), [data]);

  const hasMinMax = showMinMax && chartData.some(d => d.min !== undefined || d.max !== undefined);

  return (
    <motion.div
      className={clsx('card p-5', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          {info.label} ({displayUnit})
        </h3>
        {threshold && (
          <div className="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
            {threshold.min !== undefined && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-warning-500" />
                Min: {threshold.min}
              </span>
            )}
            {threshold.max !== undefined && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-danger-500" />
                Max: {threshold.max}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="h-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {showArea ? (
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`color-${sensorType}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
                {threshold?.min !== undefined && (
                  <linearGradient id={`threshold-min-${sensorType}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                )}
                {threshold?.max !== undefined && (
                  <linearGradient id={`threshold-max-${sensorType}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                )}
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 10%', 'dataMax + 10%']}
              />
              <Tooltip content={<CustomTooltip />} />

              {threshold?.min !== undefined && (
                <Area
                  type="monotone"
                  dataKey="minThreshold"
                  data={chartData.map(d => ({
                    ...d,
                    minThreshold: threshold.min!,
                  }))}
                  fill={`url(#threshold-min-${sensorType})`}
                  stroke="#f59e0b"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  isAnimationActive={animate}
                />
              )}

              {threshold?.max !== undefined && (
                <Area
                  type="monotone"
                  dataKey="maxThreshold"
                  data={chartData.map(d => ({
                    ...d,
                    maxThreshold: threshold.max!,
                  }))}
                  fill={`url(#threshold-max-${sensorType})`}
                  stroke="#ef4444"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  isAnimationActive={animate}
                />
              )}

              <Area
                type="monotone"
                dataKey="value"
                fill={`url(#color-${sensorType})`}
                stroke={color}
                strokeWidth={2}
                isAnimationActive={animate}
                animationDuration={1000}
                animationEasing="easeOut"
              />

              {hasMinMax && (
                <>
                  <Area
                    type="monotone"
                    dataKey="max"
                    fill="#e2e8f0"
                    stroke="transparent"
                    isAnimationActive={animate}
                  />
                  <Area
                    type="monotone"
                    dataKey="min"
                    fill="white"
                    stroke="transparent"
                    isAnimationActive={animate}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="#64748b"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    isAnimationActive={animate}
                  />
                </>
              )}
            </AreaChart>
          ) : (
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 10%', 'dataMax + 10%']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                isAnimationActive={animate}
                animationDuration={1000}
                animationEasing="easeOut"
                name={info.label}
              />
              {hasMinMax && (
                <>
                  <Line
                    type="monotone"
                    dataKey="max"
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Max"
                    isAnimationActive={animate}
                  />
                  <Line
                    type="monotone"
                    dataKey="min"
                    stroke="#22c55e"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Min"
                    isAnimationActive={animate}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="#64748b"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Avg"
                    isAnimationActive={animate}
                  />
                </>
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default SensorGraph;