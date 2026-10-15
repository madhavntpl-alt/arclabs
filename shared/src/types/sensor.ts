/**
 * Sensor Type Definitions
 * Core sensor reading and sensor type interfaces
 */

import { SensorType, SensorTypeInfo, SENSOR_TYPE_INFO } from '../constants/sensor-types';
import { Unit } from '../constants/units';

export { SensorType, SensorTypeInfo, SENSOR_TYPE_INFO } from '../constants/sensor-types';
export { Unit } from '../constants/units';

export interface SensorReading {
  sensor_type: SensorType;
  value: number;
  unit: Unit;
  timestamp: string; // ISO 8601
  status: SensorStatus;
  thresholds?: SensorThresholds;
  device_id?: string;
  metadata?: Record<string, unknown>;
}

export type SensorStatus = 'normal' | 'warning' | 'critical' | 'unknown';

export interface SensorThresholds {
  min?: number;
  max?: number;
}

export interface SensorHistoryPoint {
  timestamp: string;
  min: number;
  max: number;
  avg: number;
  count: number;
}

export interface SensorHistory {
  sensor_type: SensorType;
  unit: Unit;
  interval: string;
  data: SensorHistoryPoint[];
}

export interface SensorConfig {
  type: SensorType;
  enabled: boolean;
  calibration?: SensorCalibration;
  thresholds?: SensorThresholds;
  sampling_rate_hz?: number;
}

export interface SensorCalibration {
  slope?: number;
  offset?: number;
  r0?: number;
  intercept?: number;
  divider_ratio?: number;
  adc_ref?: number;
  last_calibrated?: string;
  calibrated_by?: string;
}

export interface DeviceSensorStatus {
  sensor_type: SensorType;
  status: 'active' | 'inactive' | 'error';
  last_reading?: SensorReading;
  error_message?: string;
}

export function createSensorReading(
  sensorType: SensorType,
  value: number,
  options: {
    timestamp?: string;
    status?: SensorStatus;
    thresholds?: SensorThresholds;
    device_id?: string;
    metadata?: Record<string, unknown>;
  } = {}
): SensorReading {
  const info = SENSOR_TYPE_INFO[sensorType];
  const timestamp = options.timestamp ?? new Date().toISOString();

  // Auto-determine status based on thresholds if not provided
  let status = options.status;
  if (!status && options.thresholds) {
    const { min, max } = options.thresholds;
    if (min !== undefined && value < min) {
      status = 'critical';
    } else if (max !== undefined && value > max) {
      status = 'critical';
    } else if (min !== undefined && value < min * 1.2) {
      status = 'warning';
    } else if (max !== undefined && value > max * 0.8) {
      status = 'warning';
    } else {
      status = 'normal';
    }
  }

  return {
    sensor_type: sensorType,
    value,
    unit: info.unit as Unit,
    timestamp,
    status: status ?? 'unknown',
    thresholds: options.thresholds,
    device_id: options.device_id,
    metadata: options.metadata,
  };
}

export function isSensorReadingValid(reading: SensorReading): boolean {
  const info = SENSOR_TYPE_INFO[reading.sensor_type];
  return (
    typeof reading.value === 'number' &&
    !isNaN(reading.value) &&
    reading.value >= info.minValue &&
    reading.value <= info.maxValue &&
    typeof reading.timestamp === 'string' &&
    !isNaN(Date.parse(reading.timestamp))
  );
}

export function getSensorStatusColor(status: SensorStatus): string {
  switch (status) {
    case 'normal':
      return '#22c55e'; // green-500
    case 'warning':
      return '#f59e0b'; // amber-500
    case 'critical':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}

export function getSensorStatusLabel(status: SensorStatus): string {
  switch (status) {
    case 'normal':
      return 'Normal';
    case 'warning':
      return 'Warning';
    case 'critical':
      return 'Critical';
    default:
      return 'Unknown';
  }
}