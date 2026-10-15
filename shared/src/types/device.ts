/**
 * Device Type Definitions
 * Device status, configuration, and metrics interfaces
 */

import { SensorType } from './sensor';
import { SensorReading } from './sensor';

export type DeviceStatus = 'online' | 'offline' | 'error' | 'updating';

export type DeviceType = 'catalyst_mk1' | 'catalyst_mk2' | 'generic';

export interface DeviceConfig {
  serial_port: string;
  baudrate: number;
  sensors: SensorType[];
  actuators: ActuatorType[];
  thresholds: Record<string, { min?: number; max?: number }>;
  automation_enabled: boolean;
  firmware_update_url?: string;
}

export type ActuatorType = 'pump' | 'valve' | 'relay_1' | 'relay_2' | 'fan' | 'heater' | 'light';

export interface ActuatorStatus {
  type: ActuatorType;
  state: boolean;
  last_changed: string;
  auto_controlled: boolean;
}

export interface DeviceMetrics {
  uptime_seconds: number;
  free_heap: number;
  messages_received: number;
  messages_sent: number;
  errors: number;
  last_error?: string;
  wifi_rssi?: number;
  cpu_temperature?: number;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  last_seen: string;
  firmware_version: string;
  hardware_version: string;
  sensors: SensorType[];
  actuators: ActuatorType[];
  config: DeviceConfig;
  metrics?: DeviceMetrics;
  current_readings?: SensorReading[];
  created_at: string;
  updated_at: string;
}

export interface DeviceSummary {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  last_seen: string;
  firmware_version: string;
  sensor_count: number;
  actuator_count: number;
}

export interface DeviceRegistration {
  name: string;
  type: DeviceType;
  hardware_version: string;
  serial_port: string;
  baudrate: number;
  sensors: SensorType[];
  actuators: ActuatorType[];
}

export function isDeviceOnline(device: Device, timeoutMs: number = 60000): boolean {
  if (device.status !== 'online') return false;
  const lastSeen = new Date(device.last_seen).getTime();
  const now = Date.now();
  return (now - lastSeen) < timeoutMs;
}

export function getDeviceStatusColor(status: DeviceStatus): string {
  switch (status) {
    case 'online':
      return '#22c55e'; // green-500
    case 'offline':
      return '#6b7280'; // gray-500
    case 'error':
      return '#ef4444'; // red-500
    case 'updating':
      return '#3b82f6'; // blue-500
    default:
      return '#6b7280';
  }
}

export function getDeviceStatusLabel(status: DeviceStatus): string {
  switch (status) {
    case 'online':
      return 'Online';
    case 'offline':
      return 'Offline';
    case 'error':
      return 'Error';
    case 'updating':
      return 'Updating';
    default:
      return 'Unknown';
  }
}

export const ACTUATOR_TYPES: ActuatorType[] = [
  'pump',
  'valve',
  'relay_1',
  'relay_2',
  'fan',
  'heater',
  'light',
];

export const DEVICE_TYPES: DeviceType[] = [
  'catalyst_mk1',
  'catalyst_mk2',
  'generic',
];