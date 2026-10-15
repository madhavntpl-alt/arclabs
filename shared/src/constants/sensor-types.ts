/**
 * Sensor Type Definitions
 * Centralized sensor type constants shared across frontend, backend, and firmware
 */

export enum SensorType {
  WATER_LEVEL = 'water_level',
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  GAS = 'gas',
  BATTERY = 'battery',
}

export type SensorTypeValue = `${SensorType}`;

export const SENSOR_TYPES: SensorTypeValue[] = Object.values(SensorType);

export interface SensorTypeInfo {
  type: SensorType;
  label: string;
  unit: string;
  icon: string;
  color: string;
  minValue: number;
  maxValue: number;
  defaultThresholds: {
    min?: number;
    max?: number;
  };
  precision: number;
}

export const SENSOR_TYPE_INFO: Record<SensorType, SensorTypeInfo> = {
  [SensorType.WATER_LEVEL]: {
    type: SensorType.WATER_LEVEL,
    label: 'Water Level',
    unit: 'cm',
    icon: 'water',
    color: '#3b82f6', // blue-500
    minValue: 0,
    maxValue: 300,
    defaultThresholds: {
      min: 10,
      max: 200,
    },
    precision: 1,
  },
  [SensorType.TEMPERATURE]: {
    type: SensorType.TEMPERATURE,
    label: 'Temperature',
    unit: '°C',
    icon: 'thermometer',
    color: '#ef4444', // red-500
    minValue: -40,
    maxValue: 80,
    defaultThresholds: {
      min: 0,
      max: 50,
    },
    precision: 1,
  },
  [SensorType.HUMIDITY]: {
    type: SensorType.HUMIDITY,
    label: 'Humidity',
    unit: '%',
    icon: 'droplet',
    color: '#06b6d4', // cyan-500
    minValue: 0,
    maxValue: 100,
    defaultThresholds: {
      min: 20,
      max: 80,
    },
    precision: 0,
  },
  [SensorType.GAS]: {
    type: SensorType.GAS,
    label: 'Gas (Air Quality)',
    unit: 'ppm',
    icon: 'wind',
    color: '#f59e0b', // amber-500
    minValue: 0,
    maxValue: 10000,
    defaultThresholds: {
      max: 1000,
    },
    precision: 0,
  },
  [SensorType.BATTERY]: {
    type: SensorType.BATTERY,
    label: 'Battery Voltage',
    unit: 'V',
    icon: 'battery',
    color: '#22c55e', // green-500
    minValue: 0,
    maxValue: 5,
    defaultThresholds: {
      min: 3.3,
      max: 4.2,
    },
    precision: 2,
  },
};

export function getSensorInfo(type: SensorType): SensorTypeInfo {
  return SENSOR_TYPE_INFO[type];
}

export function getSensorUnit(type: SensorType): string {
  return SENSOR_TYPE_INFO[type].unit;
}

export function getSensorColor(type: SensorType): string {
  return SENSOR_TYPE_INFO[type].color;
}

export function formatSensorValue(type: SensorType, value: number): string {
  const info = SENSOR_TYPE_INFO[type];
  return `${value.toFixed(info.precision)} ${info.unit}`;
}

export function isValidSensorType(type: string): type is SensorType {
  return SENSOR_TYPES.includes(type as SensorType);
}