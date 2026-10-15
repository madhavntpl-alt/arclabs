/**
 * Default Threshold Configuration
 * Centralized default threshold values for all sensor types
 */

import { SensorType, SENSOR_TYPE_INFO } from './sensor-types';

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

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  water_level_min_cm: SENSOR_TYPE_INFO[SensorType.WATER_LEVEL].defaultThresholds.min ?? 10,
  water_level_max_cm: SENSOR_TYPE_INFO[SensorType.WATER_LEVEL].defaultThresholds.max ?? 200,
  temp_min_c: SENSOR_TYPE_INFO[SensorType.TEMPERATURE].defaultThresholds.min ?? 0,
  temp_max_c: SENSOR_TYPE_INFO[SensorType.TEMPERATURE].defaultThresholds.max ?? 50,
  humidity_min_pct: SENSOR_TYPE_INFO[SensorType.HUMIDITY].defaultThresholds.min ?? 20,
  humidity_max_pct: SENSOR_TYPE_INFO[SensorType.HUMIDITY].defaultThresholds.max ?? 80,
  gas_threshold_ppm: SENSOR_TYPE_INFO[SensorType.GAS].defaultThresholds.max ?? 1000,
  battery_min_v: SENSOR_TYPE_INFO[SensorType.BATTERY].defaultThresholds.min ?? 3.3,
  battery_max_v: SENSOR_TYPE_INFO[SensorType.BATTERY].defaultThresholds.max ?? 4.2,
};

export interface SensorThresholds {
  min?: number;
  max?: number;
}

export function getDefaultThresholds(sensorType: SensorType): SensorThresholds {
  return SENSOR_TYPE_INFO[sensorType].defaultThresholds;
}

export function validateThresholds(config: Partial<ThresholdConfig>): string[] {
  const errors: string[] = [];

  if (config.water_level_min_cm !== undefined && config.water_level_max_cm !== undefined) {
    if (config.water_level_min_cm >= config.water_level_max_cm) {
      errors.push('water_level_min_cm must be less than water_level_max_cm');
    }
    if (config.water_level_min_cm < 0) {
      errors.push('water_level_min_cm must be positive');
    }
  }

  if (config.temp_min_c !== undefined && config.temp_max_c !== undefined) {
    if (config.temp_min_c >= config.temp_max_c) {
      errors.push('temp_min_c must be less than temp_max_c');
    }
  }

  if (config.humidity_min_pct !== undefined && config.humidity_max_pct !== undefined) {
    if (config.humidity_min_pct >= config.humidity_max_pct) {
      errors.push('humidity_min_pct must be less than humidity_max_pct');
    }
    if (config.humidity_min_pct < 0 || config.humidity_min_pct > 100) {
      errors.push('humidity_min_pct must be between 0 and 100');
    }
    if (config.humidity_max_pct < 0 || config.humidity_max_pct > 100) {
      errors.push('humidity_max_pct must be between 0 and 100');
    }
  }

  if (config.gas_threshold_ppm !== undefined && config.gas_threshold_ppm < 0) {
    errors.push('gas_threshold_ppm must be positive');
  }

  if (config.battery_min_v !== undefined && config.battery_max_v !== undefined) {
    if (config.battery_min_v >= config.battery_max_v) {
      errors.push('battery_min_v must be less than battery_max_v');
    }
    if (config.battery_min_v < 0) {
      errors.push('battery_min_v must be positive');
    }
  }

  return errors;
}

export function mergeThresholds(
  current: ThresholdConfig,
  updates: Partial<ThresholdConfig>
): ThresholdConfig {
  return {
    ...current,
    ...updates,
  };
}