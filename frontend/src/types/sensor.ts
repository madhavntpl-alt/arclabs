import { SensorType, SensorTypeInfo, SENSOR_TYPE_INFO, SensorStatus, SensorThresholds, SensorReading, SensorHistoryPoint, SensorHistory, SensorConfig, SensorCalibration, DeviceSensorStatus, createSensorReading, isSensorReadingValid, getSensorStatusColor, getSensorStatusLabel } from '@arc-labs/shared';

// Re-export shared types
export type {
  SensorType,
  SensorTypeInfo,
  SensorStatus,
  SensorThresholds,
  SensorReading,
  SensorHistoryPoint,
  SensorHistory,
  SensorConfig,
  SensorCalibration,
  DeviceSensorStatus,
};

export { SENSOR_TYPE_INFO, SensorType };
export { createSensorReading, isSensorReadingValid, getSensorStatusColor, getSensorStatusLabel };

// Frontend-specific extensions
export interface SensorChartDataPoint {
  timestamp: string;
  value: number;
  min?: number;
  max?: number;
  avg?: number;
}

export interface SensorDisplayProps {
  reading: SensorReading;
  showThreshold?: boolean;
  showTrend?: boolean;
  compact?: boolean;
}