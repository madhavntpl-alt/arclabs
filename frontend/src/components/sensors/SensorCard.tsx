import { motion } from 'motion/react';
import { SensorType, SENSOR_TYPE_INFO, getSensorColor, getSensorStatusColor, formatSensorValue } from '../../constants/sensor-types';
import { clsx } from 'clsx';

interface SensorCardProps {
  sensorType: SensorType;
  value: number | null;
  unit?: string;
  status?: 'normal' | 'warning' | 'critical' | 'unknown';
  threshold?: { min?: number; max?: number };
  label?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  onClick?: () => void;
  className?: string;
}

export function SensorCard({
  sensorType,
  value,
  unit,
  status = 'unknown',
  threshold,
  label,
  trend = 'stable',
  trendValue,
  onClick,
  className,
}: SensorCardProps) {
  const info = SENSOR_TYPE_INFO[sensorType];
  const displayUnit = unit || info.unit;
  const sensorColor = getSensorColor(sensorType);
  const statusColor = getSensorStatusColor(status);

  const formattedValue = value !== null
    ? `${value.toFixed(info.precision)} ${displayUnit}`
    : '--';

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  };

  const trendColors = {
    up: 'text-success-600 dark:text-success-400',
    down: 'text-danger-600 dark:text-danger-400',
    stable: 'text-secondary-500 dark:text-secondary-400',
  };

  return (
    <motion.div
      className={clsx(
        'card p-5 relative overflow-hidden group',
        onClick && 'cursor-pointer hover:shadow-elevated',
        className
      )}
      whileHover={{ y: -2, boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {/* Sensor type indicator */}
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: sensorColor }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${sensorColor}15` }}
          >
            <svg className="w-5 h-5" style={{ color: sensorColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {info.icon === 'water' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
              )}
              {info.icon === 'thermometer' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
              {info.icon === 'droplet' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
              )}
              {info.icon === 'wind' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              )}
              {info.icon === 'battery' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757a1.5 1.5 0 012.12 2.12l-3 3a4.5 4.5 0 006.364 6.364l3-3a1.5 1.5 0 00-2.12-2.12l-1.757 1.757a1.5 1.5 0 01-2.12-2.12l3-3z" />
              )}
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
              {label || info.label}
            </p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              {displayUnit}
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: statusColor }}
          animate={{ scale: status !== 'normal' ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 1, repeat: status !== 'normal' ? Infinity : 0 }}
        />
      </div>

      {/* Value */}
      <div className="mb-3">
        <motion.span
          className="text-4xl font-bold text-secondary-900 dark:text-secondary-100 tabular-nums"
          style={{ color: status !== 'normal' ? statusColor : 'inherit' }}
        >
          {value !== null ? value.toFixed(info.precision) : '--'}
        </motion.span>
        <span className="text-sm text-secondary-500 dark:text-secondary-400 ml-1">
          {displayUnit}
        </span>
      </div>

      {/* Trend */}
      {(trend !== 'stable' || trendValue !== undefined) && (
        <div className={clsx('flex items-center gap-1 text-sm', trendColors[trend])}>
          <span>{trendIcons[trend]}</span>
          {trendValue !== undefined && (
            <span>{trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%</span>
          )}
        </div>
      )}

      {/* Threshold visualization */}
      {threshold && (threshold.min !== undefined || threshold.max !== undefined) && value !== null && (
        <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
          <div className="relative h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
            {threshold.min !== undefined && (
              <div
                className="absolute top-0 bottom-0 bg-warning-500/30"
                style={{ left: 0, right: `${100 - (threshold.min / (threshold.max || 100)) * 100}%` }}
              />
            )}
            {threshold.max !== undefined && (
              <div
                className="absolute top-0 bottom-0 bg-danger-500/30"
                style={{ left: `${(threshold.max / (threshold.max || 100)) * 100}%`, right: 0 }}
              />
            )}
            <motion.div
              className="absolute top-1/2 w-3 h-3 rounded-full bg-white border-2 shadow-md -translate-y-1/2 transform"
              style={{
                left: `${Math.min(Math.max((value / (threshold.max || 100)) * 100, 0), 100)}%`,
                borderColor: status !== 'normal' ? statusColor : sensorColor,
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs text-secondary-500 dark:text-secondary-400 mt-1">
            {threshold.min !== undefined && <span>Min: {threshold.min}{displayUnit}</span>}
            {threshold.max !== undefined && <span>Max: {threshold.max}{displayUnit}</span>}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default SensorCard;