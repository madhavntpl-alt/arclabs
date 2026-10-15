/**
 * Alert Type Definitions
 * Alert, threshold configuration, and severity interfaces
 */

import { SensorType } from './sensor';
import { Unit } from '../constants/units';

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'suppressed';

export interface Alert {
  id: string;
  device_id: string;
  rule_id?: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  sensor_type?: SensorType;
  value?: number;
  threshold?: number;
  unit?: Unit;
  metadata?: Record<string, unknown>;
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface ThresholdConfig {
  water_level_min_cm: number;
  water_level_max_cm: number;
  temp_min_c: number;
  temp_max_c: number;
  humidity_min_pct: number;
  humidity_max_pct: number;
  gas_threshold_ppm: number;
  battery_min_v: number;
  battery_max_v: number;
}

export interface SensorThreshold {
  sensor_type: SensorType;
  min?: number;
  max?: number;
  severity: AlertSeverity;
  enabled: boolean;
}

export interface ThresholdEvaluationResult {
  sensor_type: SensorType;
  value: number;
  thresholds: SensorThreshold;
  exceeded: boolean;
  severity: AlertSeverity;
  message: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  severity: AlertSeverity;
  conditions: AlertCondition[];
  actions: AlertAction[];
  cooldown_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface AlertCondition {
  sensor_type: SensorType;
  operator: AlertOperator;
  value: number;
  value_max?: number; // For 'between' and 'outside' operators
  duration_seconds: number; // Condition must persist for this long
}

export type AlertOperator =
  | '<'
  | '<='
  | '>'
  | '>='
  | '=='
  | '!='
  | 'between'
  | 'outside';

export type AlertActionType =
  | 'notify'
  | 'log'
  | 'webhook'
  | 'email'
  | 'sms'
  | 'push';

export interface AlertAction {
  type: AlertActionType;
  params: Record<string, unknown>;
  delay_seconds?: number;
}

export interface AlertNotification {
  alert_id: string;
  channel: 'email' | 'sms' | 'push' | 'webhook' | 'in_app';
  recipient: string;
  subject: string;
  body: string;
  sent_at?: string;
  delivery_status?: 'pending' | 'sent' | 'failed';
  error_message?: string;
}

export function evaluateThreshold(
  value: number,
  threshold: SensorThreshold
): ThresholdEvaluationResult {
  const { sensor_type, min, max, severity, enabled } = threshold;

  if (!enabled) {
    return {
      sensor_type,
      value,
      thresholds: threshold,
      exceeded: false,
      severity: 'info',
      message: 'Threshold monitoring disabled',
    };
  }

  let exceeded = false;
  let message = '';

  if (min !== undefined && max !== undefined) {
    if (value < min) {
      exceeded = true;
      message = `${sensor_type} below minimum: ${value} < ${min}`;
    } else if (value > max) {
      exceeded = true;
      message = `${sensor_type} above maximum: ${value} > ${max}`;
    }
  } else if (min !== undefined) {
    if (value < min) {
      exceeded = true;
      message = `${sensor_type} below minimum: ${value} < ${min}`;
    }
  } else if (max !== undefined) {
    if (value > max) {
      exceeded = true;
      message = `${sensor_type} above maximum: ${value} > ${max}`;
    }
  }

  return {
    sensor_type,
    value,
    thresholds: threshold,
    exceeded,
    severity: exceeded ? severity : 'info',
    message: exceeded ? message : 'Within normal range',
  };
}

export function evaluateCondition(
  value: number,
  condition: AlertCondition
): boolean {
  const { operator, value: thresholdValue, value_max } = condition;

  switch (operator) {
    case '<':
      return value < thresholdValue;
    case '<=':
      return value <= thresholdValue;
    case '>':
      return value > thresholdValue;
    case '>=':
      return value >= thresholdValue;
    case '==':
      return value === thresholdValue;
    case '!=':
      return value !== thresholdValue;
    case 'between':
      return value >= thresholdValue && value <= (value_max ?? thresholdValue);
    case 'outside':
      return value < thresholdValue || value > (value_max ?? thresholdValue);
    default:
      return false;
  }
}

export function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'info':
      return '#3b82f6'; // blue-500
    case 'warning':
      return '#f59e0b'; // amber-500
    case 'critical':
      return '#ef4444'; // red-500
    case 'emergency':
      return '#7c2d12'; // red-900
    default:
      return '#6b7280';
  }
}

export function getSeverityLabel(severity: AlertSeverity): string {
  switch (severity) {
    case 'info':
      return 'Info';
    case 'warning':
      return 'Warning';
    case 'critical':
      return 'Critical';
    case 'emergency':
      return 'Emergency';
    default:
      return 'Unknown';
  }
}

export function getSeverityPriority(severity: AlertSeverity): number {
  switch (severity) {
    case 'emergency':
      return 4;
    case 'critical':
      return 3;
    case 'warning':
      return 2;
    case 'info':
      return 1;
    default:
      return 0;
  }
}