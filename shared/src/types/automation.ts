/**
 * Automation Type Definitions
 * Automation rules, conditions, and actions interfaces
 */

import { SensorType } from './sensor';
import { ActuatorType } from './device';
import { AlertSeverity } from './alert';

export type AutomationOperator =
  | '<'
  | '<='
  | '>'
  | '>='
  | '=='
  | '!='
  | 'between'
  | 'outside';

export type AutomationConditionType = 'sensor' | 'time' | 'state' | 'expression';

export interface AutomationCondition {
  id: string;
  type: AutomationConditionType;
  // Sensor condition
  sensor_type?: SensorType;
  operator?: AutomationOperator;
  value?: number;
  value_max?: number;
  duration_seconds?: number;
  // Time condition
  time_start?: string; // HH:MM
  time_end?: string; // HH:MM
  days_of_week?: number[]; // 0-6, Sunday-Saturday
  // State condition
  device_id?: string;
  actuator_type?: ActuatorType;
  state?: boolean;
  // Expression condition (advanced)
  expression?: string; // JavaScript-like expression
}

export type AutomationActionType =
  | 'actuator_set'
  | 'actuator_toggle'
  | 'pump_on'
  | 'pump_off'
  | 'notify'
  | 'log'
  | 'webhook'
  | 'set_threshold'
  | 'enable_rule'
  | 'disable_rule';

export interface AutomationAction {
  id: string;
  type: AutomationActionType;
  params: AutomationActionParams;
  delay_seconds?: number;
  condition?: string; // Optional condition expression
}

export interface AutomationActionParams {
  // actuator_set / actuator_toggle
  actuator_type?: ActuatorType;
  state?: boolean;
  // pump_on
  duration_seconds?: number;
  // notify
  message?: string;
  severity?: AlertSeverity;
  channels?: ('email' | 'sms' | 'push' | 'webhook' | 'in_app')[];
  // log
  log_message?: string;
  log_level?: 'info' | 'warning' | 'error';
  // webhook
  url?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  // set_threshold
  sensor_type?: SensorType;
  min_value?: number;
  max_value?: number;
  // enable_rule / disable_rule
  rule_id?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number; // Lower number = higher priority
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  logic: 'AND' | 'OR'; // How to combine conditions
  cooldown_seconds: number;
  max_executions_per_day?: number;
  execution_count: number;
  last_triggered?: string;
  last_success?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  tags?: string[];
}

export interface AutomationExecution {
  id: string;
  rule_id: string;
  rule_name: string;
  triggered_at: string;
  conditions_met: boolean;
  condition_results: ConditionResult[];
  actions_executed: ActionResult[];
  duration_ms: number;
  error?: string;
}

export interface ConditionResult {
  condition_id: string;
  condition_type: string;
  sensor_type?: SensorType;
  current_value?: number;
  threshold_value?: number;
  result: boolean;
  evaluated_at: string;
}

export interface ActionResult {
  action_id: string;
  action_type: string;
  success: boolean;
  output?: unknown;
  error?: string;
  executed_at: string;
  duration_ms: number;
}

export interface AutomationEngineConfig {
  enabled: boolean;
  evaluation_interval_seconds: number;
  max_concurrent_executions: number;
  default_cooldown_seconds: number;
  safety_interlock_enabled: boolean;
  emergency_stop_enabled: boolean;
}

export const DEFAULT_AUTOMATION_CONFIG: AutomationEngineConfig = {
  enabled: true,
  evaluation_interval_seconds: 1,
  max_concurrent_executions: 10,
  default_cooldown_seconds: 60,
  safety_interlock_enabled: true,
  emergency_stop_enabled: true,
};

export function evaluateCondition(
  condition: AutomationCondition,
  context: EvaluationContext
): boolean {
  switch (condition.type) {
    case 'sensor':
      return evaluateSensorCondition(condition, context);
    case 'time':
      return evaluateTimeCondition(condition);
    case 'state':
      return evaluateStateCondition(condition, context);
    case 'expression':
      return evaluateExpressionCondition(condition, context);
    default:
      return false;
  }
}

interface EvaluationContext {
  sensorValues: Map<SensorType, number>;
  actuatorStates: Map<string, boolean>;
  deviceStatuses: Map<string, string>;
  currentTime: Date;
  variables: Record<string, unknown>;
}

function evaluateSensorCondition(condition: AutomationCondition, context: EvaluationContext): boolean {
  if (!condition.sensor_type || !condition.operator) return false;

  const currentValue = context.sensorValues.get(condition.sensor_type);
  if (currentValue === undefined) return false;

  // Check duration if specified
  if (condition.duration_seconds && condition.duration_seconds > 0) {
    // This would require tracking condition state over time
    // Simplified for now
  }

  return evaluateOperator(currentValue, condition.operator, condition.value, condition.value_max);
}

function evaluateTimeCondition(condition: AutomationCondition): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentDay = now.getDay(); // 0 = Sunday

  if (condition.time_start && condition.time_end) {
    const [startH, startM] = condition.time_start.split(':').map(Number);
    const [endH, endM] = condition.time_end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      if (currentMinutes < startMinutes || currentMinutes > endMinutes) return false;
    } else {
      // Overnight range (e.g., 22:00 - 06:00)
      if (currentMinutes < startMinutes && currentMinutes > endMinutes) return false;
    }
  }

  if (condition.days_of_week && condition.days_of_week.length > 0) {
    if (!condition.days_of_week.includes(currentDay)) return false;
  }

  return true;
}

function evaluateStateCondition(condition: AutomationCondition, context: EvaluationContext): boolean {
  if (!condition.device_id || !condition.actuator_type) return false;

  const key = `${condition.device_id}:${condition.actuator_type}`;
  const currentState = context.actuatorStates.get(key);
  if (currentState === undefined) return false;

  return condition.state === undefined || currentState === condition.state;
}

function evaluateExpressionCondition(condition: AutomationCondition, context: EvaluationContext): boolean {
  if (!condition.expression) return false;

  try {
    // WARNING: Using eval is dangerous in production!
    // In production, use a safe expression evaluator like expr-lang or similar
    const vars = {
      ...context.variables,
      sensors: Object.fromEntries(context.sensorValues),
      actuators: Object.fromEntries(context.actuatorStates),
      devices: Object.fromEntries(context.deviceStatuses),
      now: context.currentTime,
    };

    // eslint-disable-next-line no-eval
    return eval(`(() => { const ${Object.keys(vars).map(k => `${k} = vars["${k}"]`).join(', ')}; return ${condition.expression} })()`);
  } catch {
    return false;
  }
}

function evaluateOperator(
  value: number,
  operator: AutomationOperator,
  threshold?: number,
  thresholdMax?: number
): boolean {
  switch (operator) {
    case '<':
      return threshold !== undefined && value < threshold;
    case '<=':
      return threshold !== undefined && value <= threshold;
    case '>':
      return threshold !== undefined && value > threshold;
    case '>=':
      return threshold !== undefined && value >= threshold;
    case '==':
      return threshold !== undefined && value === threshold;
    case '!=':
      return threshold !== undefined && value !== threshold;
    case 'between':
      return threshold !== undefined && thresholdMax !== undefined &&
        value >= threshold && value <= thresholdMax;
    case 'outside':
      return threshold !== undefined && thresholdMax !== undefined &&
        (value < threshold || value > thresholdMax);
    default:
      return false;
  }
}

export function createAutomationRule(
  name: string,
  conditions: AutomationCondition[],
  actions: AutomationAction[],
  options: Partial<AutomationRule> = {}
): AutomationRule {
  const now = new Date().toISOString();
  return {
    id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description: options.description,
    enabled: options.enabled ?? true,
    priority: options.priority ?? 10,
    conditions,
    actions,
    logic: options.logic ?? 'AND',
    cooldown_seconds: options.cooldown_seconds ?? 60,
    max_executions_per_day: options.max_executions_per_day,
    execution_count: 0,
    created_at: now,
    updated_at: now,
    created_by: options.created_by,
    tags: options.tags,
  };
}