import { SensorType, SENSOR_TYPE_INFO, formatSensorValue } from '@arc-labs/shared';

/**
 * Format a sensor value with its unit
 */
export function formatSensorValueWithUnit(type: SensorType, value: number): string {
  return formatSensorValue(type, value);
}

/**
 * Format a timestamp for display
 */
export function formatTimestamp(timestamp: string | Date, options: Intl.DateTimeFormatOptions = {}): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Format a timestamp as relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatTimestamp(date, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * Format a duration in seconds to human readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/**
 * Format a number with appropriate precision
 */
export function formatNumber(value: number, precision: number = 2): string {
  if (value === 0) return '0';
  if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(precision) + 'M';
  if (Math.abs(value) >= 1000) return (value / 1000).toFixed(precision) + 'K';
  return value.toFixed(precision);
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Get sensor color for charts/UI
 */
export function getSensorColor(type: SensorType): string {
  return SENSOR_TYPE_INFO[type].color;
}

/**
 * Get sensor unit
 */
export function getSensorUnit(type: SensorType): string {
  return SENSOR_TYPE_INFO[type].unit;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate a short ID
 */
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}