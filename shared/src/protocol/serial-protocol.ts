/**
 * Serial Protocol Definitions
 * Message types and validation for firmware-backend communication
 */

import { SensorType } from '../types/sensor';
import { ActuatorType } from '../types/device';
import { z } from 'zod';

// ============================================================================
// Base Message Types
// ============================================================================

export enum SerialMessageType {
  SENSOR_READING = 'sensor_reading',
  DEVICE_STATUS = 'device_status',
  EVENT = 'event',
  COMMAND_ACK = 'command_ack',
  COMMAND_NACK = 'command_nack',
  HEARTBEAT = 'heartbeat',
  ERROR = 'error',
  // Commands (backend -> firmware)
  COMMAND = 'command',
  CONFIG_UPDATE = 'config_update',
  CALIBRATE = 'calibrate',
  RESET = 'reset',
  GET_STATUS = 'get_status',
}

export interface SerialMessageBase {
  type: SerialMessageType;
  timestamp: number; // Unix timestamp (seconds)
  sequence?: number;
  checksum?: string; // CRC32 hex
}

// ============================================================================
// Firmware -> Backend Messages
// ============================================================================

export interface SensorReadingMessage extends SerialMessageBase {
  type: SerialMessageType.SENSOR_READING;
  payload: {
    sensor: SensorType;
    value: number;
    unit: string;
    raw_value?: number; // Raw ADC value
  };
}

export interface DeviceStatusMessage extends SerialMessageBase {
  type: SerialMessageType.DEVICE_STATUS;
  payload: {
    firmware_version: string;
    hardware_version: string;
    uptime_seconds: number;
    free_heap: number;
    wifi_rssi?: number;
    sensors_active: string[];
    actuators_state: Record<string, boolean>;
  };
}

export interface EventMessage extends SerialMessageBase {
  type: SerialMessageType.EVENT;
  payload: {
    event_type: string;
    severity: 'info' | 'warning' | 'critical' | 'emergency';
    message: string;
    metadata?: Record<string, unknown>;
  };
}

export interface CommandAckMessage extends SerialMessageBase {
  type: SerialMessageType.COMMAND_ACK;
  payload: {
    command_id: string;
    success: boolean;
    message?: string;
    data?: Record<string, unknown>;
  };
}

export interface CommandNackMessage extends SerialMessageBase {
  type: SerialMessageType.COMMAND_NACK;
  payload: {
    command_id: string;
    error_code: string;
    message: string;
  };
}

export interface HeartbeatMessage extends SerialMessageBase {
  type: SerialMessageType.HEARTBEAT;
  payload: {
    uptime_seconds: number;
    free_heap: number;
  };
}

export interface ErrorMessage extends SerialMessageBase {
  type: SerialMessageType.ERROR;
  payload: {
    error_code: string;
    message: string;
    context?: Record<string, unknown>;
  };
}

// ============================================================================
// Backend -> Firmware Commands
// ============================================================================

export interface CommandMessage extends SerialMessageBase {
  type: SerialMessageType.COMMAND;
  payload: {
    command_id: string;
    command: CommandType;
    params: CommandParams;
  };
}

export enum CommandType {
  PUMP_ON = 'pump_on',
  PUMP_OFF = 'pump_off',
  RELAY_SET = 'relay_set',
  VALVE_SET = 'valve_set',
  CALIBRATE = 'calibrate',
  RESET = 'reset',
  GET_STATUS = 'get_status',
  SET_THRESHOLD = 'set_threshold',
  ENABLE_AUTOMATION = 'enable_automation',
  DISABLE_AUTOMATION = 'disable_automation',
  EMERGENCY_STOP = 'emergency_stop',
}

export type CommandParams =
  | PumpOnParams
  | PumpOffParams
  | RelaySetParams
  | ValveSetParams
  | CalibrateParams
  | ResetParams
  | GetStatusParams
  | SetThresholdParams
  | EnableAutomationParams
  | DisableAutomationParams
  | EmergencyStopParams;

export interface PumpOnParams {
  duration_seconds: number;
}

export interface PumpOffParams {}

export interface RelaySetParams {
  relay: 1 | 2;
  state: boolean;
}

export interface ValveSetParams {
  state: boolean;
  duration_seconds?: number;
}

export interface CalibrateParams {
  sensor: SensorType;
  value: number; // Known reference value
}

export interface ResetParams {}

export interface GetStatusParams {}

export interface SetThresholdParams {
  sensor: SensorType;
  min?: number;
  max?: number;
}

export interface EnableAutomationParams {
  rule_id?: string; // Optional: enable specific rule
}

export interface DisableAutomationParams {
  rule_id?: string; // Optional: disable specific rule
}

export interface EmergencyStopParams {}

// ============================================================================
// Config Update Message
// ============================================================================

export interface ConfigUpdateMessage extends SerialMessageBase {
  type: SerialMessageType.CONFIG_UPDATE;
  payload: {
    thresholds?: Record<string, { min?: number; max?: number }>;
    automation_enabled?: boolean;
    sampling_rate_hz?: number;
    calibration?: Record<string, SensorCalibration>;
  };
}

export interface SensorCalibration {
  slope?: number;
  offset?: number;
  r0?: number;
  intercept?: number;
  divider_ratio?: number;
  adc_ref?: number;
}

// ============================================================================
// Union Types
// ============================================================================

export type FirmwareToBackendMessage =
  | SensorReadingMessage
  | DeviceStatusMessage
  | EventMessage
  | CommandAckMessage
  | CommandNackMessage
  | HeartbeatMessage
  | ErrorMessage;

export type BackendToFirmwareMessage =
  | CommandMessage
  | ConfigUpdateMessage;

// ============================================================================
// Zod Validation Schemas
// ============================================================================

export const sensorReadingSchema = z.object({
  type: z.literal(SerialMessageType.SENSOR_READING),
  timestamp: z.number().int().positive(),
  sequence: z.number().int().optional(),
  checksum: z.string().optional(),
  payload: z.object({
    sensor: z.nativeEnum(SensorType),
    value: z.number(),
    unit: z.string(),
    raw_value: z.number().optional(),
  }),
});

export const deviceStatusSchema = z.object({
  type: z.literal(SerialMessageType.DEVICE_STATUS),
  timestamp: z.number().int().positive(),
  sequence: z.number().int().optional(),
  checksum: z.string().optional(),
  payload: z.object({
    firmware_version: z.string(),
    hardware_version: z.string(),
    uptime_seconds: z.number().int().nonnegative(),
    free_heap: z.number().int().nonnegative(),
    wifi_rssi: z.number().int().optional(),
    sensors_active: z.array(z.string()),
    actuators_state: z.record(z.string(), z.boolean()),
  }),
});

export const eventSchema = z.object({
  type: z.literal(SerialMessageType.EVENT),
  timestamp: z.number().int().positive(),
  sequence: z.number().int().optional(),
  checksum: z.string().optional(),
  payload: z.object({
    event_type: z.string(),
    severity: z.enum(['info', 'warning', 'critical', 'emergency']),
    message: z.string(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const commandAckSchema = z.object({
  type: z.literal(SerialMessageType.COMMAND_ACK),
  timestamp: z.number().int().positive(),
  sequence: z.number().int().optional(),
  checksum: z.string().optional(),
  payload: z.object({
    command_id: z.string(),
    success: z.boolean(),
    message: z.string().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const commandNackSchema = z.object({
  type: z.literal(SerialMessageType.COMMAND_NACK),
  timestamp: z.number().int().positive(),
  sequence: z.number().int().optional(),
  checksum: z.string().optional(),
  payload: z.object({
    command_id: z.string(),
    error_code: z.string(),
    message: z.string(),
  }),
});

export const heartbeatSchema = z.object({
  type: z.literal(SerialMessageType.HEARTBEAT),
  timestamp: z.number().int().positive(),
  sequence: z.number().int().optional(),
  checksum: z.string().optional(),
  payload: z.object({
    uptime_seconds: z.number().int().nonnegative(),
    free_heap: z.number().int().nonnegative(),
  }),
});

export const errorSchema = z.object({
  type: z.literal(SerialMessageType.ERROR),
  timestamp: z.number().int().positive(),
  sequence: z.number().int().optional(),
  checksum: z.string().optional(),
  payload: z.object({
    error_code: z.string(),
    message: z.string(),
    context: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const commandSchema = z.object({
  type: z.literal(SerialMessageType.COMMAND),
  timestamp: z.number().int().positive(),
  sequence: z.number().int().optional(),
  checksum: z.string().optional(),
  payload: z.object({
    command_id: z.string(),
    command: z.nativeEnum(CommandType),
    params: z.unknown(), // Validated by command type
  }),
});

export const configUpdateSchema = z.object({
  type: z.literal(SerialMessageType.CONFIG_UPDATE),
  timestamp: z.number().int().positive(),
  sequence: z.number().int().optional(),
  checksum: z.string().optional(),
  payload: z.object({
    thresholds: z.record(z.string(), z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    })).optional(),
    automation_enabled: z.boolean().optional(),
    sampling_rate_hz: z.number().int().positive().optional(),
    calibration: z.record(z.string(), z.object({
      slope: z.number().optional(),
      offset: z.number().optional(),
      r0: z.number().optional(),
      intercept: z.number().optional(),
      divider_ratio: z.number().optional(),
      adc_ref: z.number().optional(),
    })).optional(),
  }),
});

// ============================================================================
// Parsing Utilities
// ============================================================================

export function parseSerialLine(line: string): FirmwareToBackendMessage | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);

    // Validate based on type
    switch (parsed.type) {
      case SerialMessageType.SENSOR_READING:
        return sensorReadingSchema.parse(parsed);
      case SerialMessageType.DEVICE_STATUS:
        return deviceStatusSchema.parse(parsed);
      case SerialMessageType.EVENT:
        return eventSchema.parse(parsed);
      case SerialMessageType.COMMAND_ACK:
        return commandAckSchema.parse(parsed);
      case SerialMessageType.COMMAND_NACK:
        return commandNackSchema.parse(parsed);
      case SerialMessageType.HEARTBEAT:
        return heartbeatSchema.parse(parsed);
      case SerialMessageType.ERROR:
        return errorSchema.parse(parsed);
      default:
        console.warn(`Unknown message type: ${parsed.type}`);
        return null;
    }
  } catch (error) {
    console.error('Failed to parse serial line:', error, 'Line:', trimmed);
    return null;
  }
}

export function serializeCommand(command: CommandMessage): string {
  return JSON.stringify(command);
}

export function serializeConfigUpdate(config: ConfigUpdateMessage): string {
  return JSON.stringify(config);
}

// ============================================================================
// CRC32 Checksum (for future use)
// ============================================================================

export function calculateCRC32(data: string): string {
  // Simple CRC32 implementation
  // In production, use a proper CRC32 library
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff).toString(16).padStart(8, '0');
}

export function verifyCRC32(data: string, checksum: string): boolean {
  return calculateCRC32(data) === checksum;
}