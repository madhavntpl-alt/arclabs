import { SensorType, SENSOR_TYPE_INFO, DEFAULT_THRESHOLDS } from '@arc-labs/shared';

// Re-export shared constants
export { SensorType, SENSOR_TYPE_INFO, DEFAULT_THRESHOLDS };

// Frontend-specific constants
export const SENSOR_TYPES = Object.values(SensorType);

export const CHART_COLORS = {
  water_level: '#3b82f6',
  temperature: '#ef4444',
  humidity: '#06b6d4',
  gas: '#f59e0b',
  battery: '#22c55e',
};

export const STATUS_COLORS = {
  normal: '#22c55e',
  warning: '#f59e0b',
  critical: '#ef4444',
  unknown: '#6b7280',
};

export const SEVERITY_COLORS = {
  info: '#3b82f6',
  warning: '#f59e0b',
  critical: '#ef4444',
  emergency: '#7c2d12',
};

export const DEVICE_STATUSES = ['online', 'offline', 'error', 'updating'] as const;

export const EVENT_TYPES = [
  'sensor_reading',
  'threshold_exceeded',
  'threshold_cleared',
  'automation_triggered',
  'command_sent',
  'command_ack',
  'command_failed',
  'device_connected',
  'device_disconnected',
  'device_error',
  'firmware_update',
  'calibration',
  'config_changed',
  'user_action',
  'system_startup',
  'system_shutdown',
  'error',
] as const;

export const TIME_RANGES = [
  { value: '1h', label: '1 Hour', interval: '1m' },
  { value: '6h', label: '6 Hours', interval: '5m' },
  { value: '24h', label: '24 Hours', interval: '15m' },
  { value: '7d', label: '7 Days', interval: '1h' },
  { value: '30d', label: '30 Days', interval: '1d' },
] as const;

export const CHART_INTERVALS = {
  '1m': { label: '1 Minute', ms: 60000 },
  '5m': { label: '5 Minutes', ms: 300000 },
  '15m': { label: '15 Minutes', ms: 900000 },
  '1h': { label: '1 Hour', ms: 3600000 },
  '1d': { label: '1 Day', ms: 86400000 },
} as const;

export const PUMP_DURATION_PRESETS = [15, 30, 60, 120, 180, 300];

export const MAX_HISTORY_POINTS = 1000;
export const MAX_EVENTS = 500;
export const MAX_ALERTS = 500;

export const WEBSOCKET_RECONNECT_INTERVAL = 5000;
export const WEBSOCKET_MAX_RECONNECT_ATTEMPTS = 10;
export const WEBSOCKET_PING_INTERVAL = 30000;

export const API_RETRY_ATTEMPTS = 3;
export const API_TIMEOUT = 30000;

export const DEBOUNCE_DELAY = 300;
export const THROTTLE_DELAY = 100;