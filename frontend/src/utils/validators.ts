import { z } from 'zod';
import { SensorType, ThresholdConfig, DEFAULT_THRESHOLDS } from '@arc-labs/shared';

// Sensor reading validation
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

// Threshold configuration validation
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
  data => data.water_level_min_cm < data.water_level_max_cm,
  { message: 'water_level_min_cm must be less than water_level_max_cm', path: ['water_level_min_cm'] }
).refine(
  data => data.temp_min_c < data.temp_max_c,
  { message: 'temp_min_c must be less than temp_max_c', path: ['temp_min_c'] }
).refine(
  data => data.humidity_min_pct < data.humidity_max_pct,
  { message: 'humidity_min_pct must be less than humidity_max_pct', path: ['humidity_min_pct'] }
).refine(
  data => data.battery_min_v < data.battery_max_v,
  { message: 'battery_min_v must be less than battery_max_v', path: ['battery_min_v'] }
);

// Automation rule validation
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
  data => {
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

// Control validation
export const pumpControlSchema = z.object({
  action: z.enum(['on', 'off', 'toggle']),
  duration_seconds: z.number().int().positive().max(3600).optional(),
}).refine(
  data => data.action !== 'on' || data.duration_seconds !== undefined,
  { message: 'duration_seconds required when action is "on"', path: ['duration_seconds'] }
);

export const relayControlSchema = z.object({
  relay: z.number().int().min(1).max(4),
  state: z.boolean(),
});

export const emergencyStopSchema = z.object({});

// Type exports
export type SensorReadingInput = z.infer<typeof sensorReadingSchema>;
export type ThresholdConfigInput = z.infer<typeof thresholdConfigSchema>;
export type AutomationRuleInput = z.infer<typeof automationRuleSchema>;
export type CreateAutomationRuleInput = z.infer<typeof createAutomationRuleSchema>;
export type AutomationConditionInput = z.infer<typeof automationConditionSchema>;
export type AutomationActionInput = z.infer<typeof automationActionSchema>;
export type PumpControlInput = z.infer<typeof pumpControlSchema>;
export type RelayControlInput = z.infer<typeof relayControlSchema>;

// Validation helpers
export function validateThresholdConfig(config: Partial<ThresholdConfig>): { valid: boolean; errors: string[] } {
  const result = thresholdConfigSchema.safeParse({ ...DEFAULT_THRESHOLDS, ...config });
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return { valid: false, errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) };
}

export function validateAutomationRule(rule: any): { valid: boolean; errors: string[] } {
  const result = automationRuleSchema.safeParse(rule);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return { valid: false, errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) };
}

export function validateSensorReading(reading: any): { valid: boolean; errors: string[] } {
  const result = sensorReadingSchema.safeParse(reading);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return { valid: false, errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) };
}