/**
 * Event Type Definitions
 * Event log, event types, and query interfaces
 */

import { SensorType } from './sensor';
import { AlertSeverity } from './alert';

export type EventType =
  | 'sensor_reading'
  | 'threshold_exceeded'
  | 'threshold_cleared'
  | 'automation_triggered'
  | 'command_sent'
  | 'command_ack'
  | 'command_failed'
  | 'device_connected'
  | 'device_disconnected'
  | 'device_error'
  | 'firmware_update'
  | 'calibration'
  | 'config_changed'
  | 'user_action'
  | 'system_startup'
  | 'system_shutdown'
  | 'error';

export interface EventLog {
  id: string;
  event_type: EventType;
  severity: AlertSeverity;
  device_id: string;
  message: string;
  metadata?: EventMetadata;
  timestamp: string;
  correlation_id?: string;
}

export interface EventMetadata {
  sensor_type?: SensorType;
  sensor_value?: number;
  sensor_unit?: string;
  threshold_value?: number;
  rule_id?: string;
  rule_name?: string;
  command_id?: string;
  command_type?: string;
  command_params?: Record<string, unknown>;
  ack_success?: boolean;
  error_code?: string;
  error_message?: string;
  firmware_version?: string;
  config_changes?: Record<string, { old: unknown; new: unknown }>;
  user_id?: string;
  user_action?: string;
  [key: string]: unknown;
}

export interface EventQuery {
  event_type?: EventType;
  event_types?: EventType[];
  severity?: AlertSeverity;
  severities?: AlertSeverity[];
  device_id?: string;
  device_ids?: string[];
  start?: string; // ISO 8601
  end?: string; // ISO 8601
  limit?: number;
  offset?: number;
  sort?: string; // e.g., '-timestamp', 'timestamp'
  search?: string; // Full-text search in message
}

export interface EventStats {
  by_type: Record<EventType, number>;
  by_severity: Record<AlertSeverity, number>;
  by_device: Record<string, number>;
  total: number;
  time_range: {
    start: string;
    end: string;
  };
}

export interface PaginatedEvents {
  events: EventLog[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export function createEvent(
  eventType: EventType,
  deviceId: string,
  message: string,
  options: {
    severity?: AlertSeverity;
    metadata?: EventMetadata;
    timestamp?: string;
    correlationId?: string;
  } = {}
): EventLog {
  const severity = options.severity ?? getDefaultSeverity(eventType);
  return {
    id: generateEventId(),
    event_type: eventType,
    severity,
    device_id: deviceId,
    message,
    metadata: options.metadata,
    timestamp: options.timestamp ?? new Date().toISOString(),
    correlation_id: options.correlationId,
  };
}

function getDefaultSeverity(eventType: EventType): AlertSeverity {
  switch (eventType) {
    case 'threshold_exceeded':
    case 'command_failed':
    case 'device_error':
    case 'error':
      return 'warning';
    case 'threshold_cleared':
    case 'device_disconnected':
      return 'info';
    case 'automation_triggered':
    case 'command_sent':
    case 'command_ack':
    case 'device_connected':
    case 'calibration':
    case 'config_changed':
    case 'user_action':
    case 'system_startup':
    case 'system_shutdown':
      return 'info';
    default:
      return 'info';
  }
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const EVENT_TYPES: EventType[] = [
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
];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  sensor_reading: 'Sensor Reading',
  threshold_exceeded: 'Threshold Exceeded',
  threshold_cleared: 'Threshold Cleared',
  automation_triggered: 'Automation Triggered',
  command_sent: 'Command Sent',
  command_ack: 'Command Acknowledged',
  command_failed: 'Command Failed',
  device_connected: 'Device Connected',
  device_disconnected: 'Device Disconnected',
  device_error: 'Device Error',
  firmware_update: 'Firmware Update',
  calibration: 'Calibration',
  config_changed: 'Configuration Changed',
  user_action: 'User Action',
  system_startup: 'System Startup',
  system_shutdown: 'System Shutdown',
  error: 'Error',
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  sensor_reading: '#3b82f6',
  threshold_exceeded: '#f59e0b',
  threshold_cleared: '#22c55e',
  automation_triggered: '#8b5cf6',
  command_sent: '#06b6d4',
  command_ack: '#22c55e',
  command_failed: '#ef4444',
  device_connected: '#22c55e',
  device_disconnected: '#6b7280',
  device_error: '#ef4444',
  firmware_update: '#8b5cf6',
  calibration: '#f59e0b',
  config_changed: '#3b82f6',
  user_action: '#ec4899',
  system_startup: '#22c55e',
  system_shutdown: '#6b7280',
  error: '#ef4444',
};

export function getEventTypeLabel(eventType: EventType): string {
  return EVENT_TYPE_LABELS[eventType] ?? eventType;
}

export function getEventTypeColor(eventType: EventType): string {
  return EVENT_TYPE_COLORS[eventType] ?? '#6b7280';
}