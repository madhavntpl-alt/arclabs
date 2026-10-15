/**
 * Zod Validation Schemas
 * Frontend validation schemas using Zod
 */

import { z } from 'zod';
import {
  SensorType,
  SensorReading,
  SensorStatus,
  ThresholdConfig,
  Device,
  DeviceStatus,
  ActuatorType,
  Alert,
  AlertSeverity,
  AlertStatus,
  AutomationRule,
  AutomationCondition,
  AutomationAction,
  EventType,
  EventLog,
} from '../types';

// ============================================================================
// Sensor Schemas
// ============================================================================

export const sensorReadingSchema = z.object({
  sensor_type: z.nativeEnum(SensorType),
  value: z.number().finite(),
  unit: z.string().min(1),
  timestamp: z.string().datetime(),
  status: z.enum(['normal', 'warning', 'critical', 'unknown']),
  thresholds: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  device_id: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const sensorHistoryPointSchema = z.object({
  timestamp: z.string().datetime(),
  min: z.number().finite(),
  max: z.number().finite(),
  avg: z.number().finite(),
  count: z.number().int().positive(),
});

export const sensorHistorySchema = z.object({
  sensor_type: z.nativeEnum(SensorType),
  unit: z.string().min(1),
  interval: z.string().min(1),
  data: z.array(sensorHistoryPointSchema),
});

// ============================================================================
// Device Schemas
// ============================================================================

export const deviceConfigSchema = z.object({
  serial_port: z.string().min(1),
  baudrate: z.number().int().positive(),
  sensors: z.array(z.nativeEnum(SensorType)),
  actuators: z.array(z.string()),
  thresholds: z.record(z.string(), z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  })),
  automation_enabled: z.boolean(),
  firmware_update_url: z.string().url().optional(),
});

export const actuatorStatusSchema = z.object({
  type: z.string().min(1),
  state: z.boolean(),
  last_changed: z.string().datetime(),
  auto_controlled: z.boolean(),
});

export const deviceMetricsSchema = z.object({
  uptime_seconds: z.number().int().nonnegative(),
  free_heap: z.number().int().nonnegative(),
  messages_received: z.number().int().nonnegative(),
  messages_sent: z.number().int().nonnegative(),
  errors: z.number().int().nonnegative(),
  last_error: z.string().optional(),
  wifi_rssi: z.number().int().optional(),
  cpu_temperature: z.number().optional(),
});

export const deviceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  status: z.enum(['online', 'offline', 'error', 'updating']),
  last_seen: z.string().datetime(),
  firmware_version: z.string().min(1),
  hardware_version: z.string().min(1),
  sensors: z.array(z.nativeEnum(SensorType)),
  actuators: z.array(z.string()),
  config: deviceConfigSchema,
  metrics: deviceMetricsSchema.optional(),
  current_readings: z.array(sensorReadingSchema).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const deviceRegistrationSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1),
  hardware_version: z.string().min(1),
  serial_port: z.string().min(1),
  baudrate: z.number().int().positive(),
  sensors: z.array(z.nativeEnum(SensorType)),
  actuators: z.array(z.string()),
});

// ============================================================================
// Alert Schemas
// ============================================================================

export const alertSchema = z.object({
  id: z.string().min(1),
  device_id: z.string().min(1),
  rule_id: z.string().optional(),
  severity: z.enum(['info', 'warning', 'critical', 'emergency']),
  status: z.enum(['active', 'acknowledged', 'resolved', 'suppressed']),
  message: z.string().min(1),
  sensor_type: z.nativeEnum(SensorType).optional(),
  value: z.number().finite().optional(),
  threshold: z.number().finite().optional(),
  unit: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  created_at: z.string().datetime(),
  acknowledged_at: z.string().datetime().optional(),
  acknowledged_by: z.string().optional(),
  resolved_at: z.string().datetime().optional(),
  resolved_by: z.string().optional(),
});

export const thresholdConfigSchema = z.object({
  water_level_min_cm: z.number().finite().min(0).max(300),
  water_level_max_cm: z.number().finite().min(0).max(300),
  temp_min_c: z.number().finite().min(-40).max(80),
  temp_max_c: z.number().finite().min(-40).max(80),
  humidity_min_pct: z.number().finite().min(0).max(100),
  humidity_max_pct: z.number().finite().min(0).max(100),
  gas_threshold_ppm: z.number().finite().min(0).max(10000),
  battery_min_v: z.number().finite().min(0).max(5),
  battery_max_v: z.number().finite().min(0).max(5),
}).refine(
  (data) => data.water_level_min_cm < data.water_level_max_cm,
  { message: 'water_level_min_cm must be less than water_level_max_cm', path: ['water_level_min_cm'] }
).refine(
  (data) => data.temp_min_c < data.temp_max_c,
  { message: 'temp_min_c must be less than temp_max_c', path: ['temp_min_c'] }
).refine(
  (data) => data.humidity_min_pct < data.humidity_max_pct,
  { message: 'humidity_min_pct must be less than humidity_max_pct', path: ['humidity_min_pct'] }
).refine(
  (data) => data.battery_min_v < data.battery_max_v,
  { message: 'battery_min_v must be less than battery_max_v', path: ['battery_min_v'] }
);

export const calibrationConfigSchema = z.object({
  water_level: z.object({
    slope: z.number().finite(),
    offset: z.number().finite(),
  }).optional(),
  gas: z.object({
    r0: z.number().finite().positive(),
    slope: z.number().finite(),
    intercept: z.number().finite(),
  }).optional(),
  temperature: z.object({
    offset: z.number().finite(),
  }).optional(),
  humidity: z.object({
    offset: z.number().finite(),
  }).optional(),
  battery: z.object({
    divider_ratio: z.number().finite().positive(),
    adc_ref: z.number().finite().positive(),
    offset: z.number().finite(),
  }).optional(),
});

// ============================================================================
// Automation Schemas
// ============================================================================

export const automationConditionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['sensor', 'time', 'state', 'expression']),
  sensor_type: z.nativeEnum(SensorType).optional(),
  operator: z.enum(['<', '<=', '>', '>=', '==', '!=', 'between', 'outside']).optional(),
  value: z.number().finite().optional(),
  value_max: z.number().finite().optional(),
  duration_seconds: z.number().int().nonnegative().optional(),
  time_start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  time_end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  days_of_week: z.array(z.number().int().min(0).max(6)).optional(),
  device_id: z.string().optional(),
  actuator_type: z.string().optional(),
  state: z.boolean().optional(),
  expression: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === 'sensor') {
      return data.sensor_type !== undefined && data.operator !== undefined && data.value !== undefined;
    }
    if (data.type === 'time') {
      return data.time_start !== undefined && data.time_end !== undefined;
    }
    if (data.type === 'state') {
      return data.device_id !== undefined && data.actuator_type !== undefined;
    }
    if (data.type === 'expression') {
      return data.expression !== undefined;
    }
    return false;
  },
  { message: 'Invalid condition configuration for type' }
);

export const automationActionSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    'actuator_set', 'actuator_toggle', 'pump_on', 'pump_off',
    'notify', 'log', 'webhook', 'set_threshold', 'enable_rule', 'disable_rule'
  ]),
  params: z.record(z.string(), z.unknown()),
  delay_seconds: z.number().int().nonnegative().optional(),
  condition: z.string().optional(),
});

export const automationRuleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  enabled: z.boolean(),
  priority: z.number().int().min(1).max(100),
  conditions: z.array(automationConditionSchema).min(1),
  actions: z.array(automationActionSchema).min(1),
  logic: z.enum(['AND', 'OR']),
  cooldown_seconds: z.number().int().min(0).max(86400),
  max_executions_per_day: z.number().int().positive().optional(),
  execution_count: z.number().int().nonnegative(),
  last_triggered: z.string().datetime().optional(),
  last_success: z.string().datetime().optional(),
  last_error: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const createAutomationRuleSchema = automationRuleSchema.omit({
  id: true,
  execution_count: true,
  last_triggered: true,
  last_success: true,
  last_error: true,
  created_at: true,
  updated_at: true,
});

// ============================================================================
// Event Schemas
// ============================================================================

export const eventMetadataSchema = z.object({
  sensor_type: z.nativeEnum(SensorType).optional(),
  sensor_value: z.number().finite().optional(),
  sensor_unit: z.string().optional(),
  threshold_value: z.number().finite().optional(),
  rule_id: z.string().optional(),
  rule_name: z.string().optional(),
  command_id: z.string().optional(),
  command_type: z.string().optional(),
  command_params: z.record(z.string(), z.unknown()).optional(),
  ack_success: z.boolean().optional(),
  error_code: z.string().optional(),
  error_message: z.string().optional(),
  firmware_version: z.string().optional(),
  config_changes: z.record(z.string(), z.object({
    old: z.unknown(),
    new: z.unknown(),
  })).optional(),
  user_id: z.string().optional(),
  user_action: z.string().optional(),
}).passthrough();

export const eventLogSchema = z.object({
  id: z.string().min(1),
  event_type: z.string().min(1),
  severity: z.enum(['info', 'warning', 'critical', 'emergency']),
  device_id: z.string().min(1),
  message: z.string().min(1),
  metadata: eventMetadataSchema.optional(),
  timestamp: z.string().datetime(),
  correlation_id: z.string().optional(),
});

export const eventQuerySchema = z.object({
  event_type: z.string().optional(),
  event_types: z.array(z.string()).optional(),
  severity: z.enum(['info', 'warning', 'critical', 'emergency']).optional(),
  severities: z.array(z.enum(['info', 'warning', 'critical', 'emergency'])).optional(),
  device_id: z.string().optional(),
  device_ids: z.array(z.string()).optional(),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  limit: z.number().int().positive().max(1000).default(100),
  offset: z.number().int().nonnegative().default(0),
  sort: z.string().default('-timestamp'),
  search: z.string().optional(),
});

// ============================================================================
// Control Schemas
// ============================================================================

export const pumpControlSchema = z.object({
  action: z.enum(['on', 'off', 'toggle']),
  duration_seconds: z.number().int().positive().max(3600).optional(),
}).refine(
  (data) => data.action !== 'on' || data.duration_seconds !== undefined,
  { message: 'duration_seconds required when action is "on"', path: ['duration_seconds'] }
);

export const relayControlSchema = z.object({
  relay: z.number().int().min(1).max(4),
  state: z.boolean(),
});

export const emergencyStopSchema = z.object({});

// ============================================================================
// WebSocket Message Schemas
// ============================================================================

export const wsClientMessageSchema = z.object({
  type: z.enum(['ping', 'subscribe', 'unsubscribe']),
  payload: z.object({
    topics: z.array(z.enum(['sensor_readings', 'alerts', 'events', 'device_status'])).optional(),
  }).optional(),
});

export const wsServerMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('sensor_reading'),
    payload: sensorReadingSchema,
  }),
  z.object({
    type: z.literal('device_status'),
    payload: z.object({
      device_id: z.string(),
      status: z.enum(['online', 'offline', 'error', 'updating']),
      uptime_seconds: z.number().int().nonnegative(),
      free_heap: z.number().int().nonnegative(),
    }),
  }),
  z.object({
    type: z.literal('alert'),
    payload: z.object({
      id: z.string(),
      severity: z.enum(['info', 'warning', 'critical', 'emergency']),
      message: z.string(),
      sensor: z.string().optional(),
      value: z.number().optional(),
      threshold: z.number().optional(),
      timestamp: z.string().datetime(),
    }),
  }),
  z.object({
    type: z.literal('event'),
    payload: eventLogSchema,
  }),
  z.object({
    type: z.literal('command_ack'),
    payload: z.object({
      command_id: z.string(),
      success: z.boolean(),
      message: z.string(),
    }),
  }),
  z.object({
    type: z.literal('heartbeat'),
    payload: z.object({
      timestamp: z.string().datetime(),
      server_time: z.string().datetime(),
    }),
  }),
]);

// ============================================================================
// Type Exports
// ============================================================================

export type SensorReadingInput = z.infer<typeof sensorReadingSchema>;
export type DeviceInput = z.infer<typeof deviceSchema>;
export type DeviceRegistrationInput = z.infer<typeof deviceRegistrationSchema>;
export type AlertInput = z.infer<typeof alertSchema>;
export type ThresholdConfigInput = z.infer<typeof thresholdConfigSchema>;
export type CalibrationConfigInput = z.infer<typeof calibrationConfigSchema>;
export type AutomationRuleInput = z.infer<typeof automationRuleSchema>;
export type CreateAutomationRuleInput = z.infer<typeof createAutomationRuleSchema>;
export type AutomationConditionInput = z.infer<typeof automationConditionSchema>;
export type AutomationActionInput = z.infer<typeof automationActionSchema>;
export type EventLogInput = z.infer<typeof eventLogSchema>;
export type EventQueryInput = z.infer<typeof eventQuerySchema>;
export type PumpControlInput = z.infer<typeof pumpControlSchema>;
export type RelayControlInput = z.infer<typeof relayControlSchema>;
export type WSClientMessageInput = z.infer<typeof wsClientMessageSchema>;
export type WSServerMessage = z.infer<typeof wsServerMessageSchema>;