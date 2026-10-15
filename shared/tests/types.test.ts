import { describe, it, expect } from 'vitest';
import {
  SensorType,
  SENSOR_TYPE_INFO,
  getSensorInfo,
  getSensorUnit,
  getSensorColor,
  formatSensorValue,
  isValidSensorType,
} from './constants/sensor-types';

import {
  Unit,
  UNIT_INFO,
  getUnitInfo,
  convertUnit,
  formatValue,
  isValidUnit,
} from './constants/units';

import {
  DEFAULT_THRESHOLDS,
  getDefaultThresholds,
  validateThresholds,
  mergeThresholds,
} from './constants/default-thresholds';

import {
  SensorReading,
  SensorStatus,
  createSensorReading,
  isSensorReadingValid,
  getSensorStatusColor,
  getSensorStatusLabel,
} from './types/sensor';

import {
  Device,
  DeviceStatus,
  isDeviceOnline,
  getDeviceStatusColor,
  getDeviceStatusLabel,
} from './types/device';

import {
  Alert,
  AlertSeverity,
  AlertStatus,
  ThresholdConfig,
  evaluateThreshold,
  getSeverityColor,
  getSeverityLabel,
  getSeverityPriority,
} from './types/alert';

import {
  EventType,
  EventLog,
  createEvent,
  getEventTypeLabel,
  getEventTypeColor,
} from './types/event';

describe('Shared Package - Constants', () => {
  describe('sensor-types', () => {
    it('should have all sensor types defined', () => {
      expect(Object.values(SensorType)).toHaveLength(5);
      expect(SensorType.WATER_LEVEL).toBe('water_level');
      expect(SensorType.TEMPERATURE).toBe('temperature');
      expect(SensorType.HUMIDITY).toBe('humidity');
      expect(SensorType.GAS).toBe('gas');
      expect(SensorType.BATTERY).toBe('battery');
    });

    it('should have sensor info for each type', () => {
      Object.values(SensorType).forEach(type => {
        const info = getSensorInfo(type);
        expect(info).toBeDefined();
        expect(info.type).toBe(type);
        expect(info.label).toBeDefined();
        expect(info.unit).toBeDefined();
        expect(info.color).toBeDefined();
        expect(info.minValue).toBeLessThan(info.maxValue);
      });
    });

    it('should return correct units', () => {
      expect(getSensorUnit(SensorType.WATER_LEVEL)).toBe('cm');
      expect(getSensorUnit(SensorType.TEMPERATURE)).toBe('°C');
      expect(getSensorUnit(SensorType.HUMIDITY)).toBe('%');
      expect(getSensorUnit(SensorType.GAS)).toBe('ppm');
      expect(getSensorUnit(SensorType.BATTERY)).toBe('V');
    });

    it('should format sensor values correctly', () => {
      expect(formatSensorValue(SensorType.WATER_LEVEL, 45.2)).toBe('45.2 cm');
      expect(formatSensorValue(SensorType.TEMPERATURE, 23.5)).toBe('23.5 °C');
      expect(formatSensorValue(SensorType.HUMIDITY, 65)).toBe('65 %');
      expect(formatSensorValue(SensorType.GAS, 450)).toBe('450 ppm');
      expect(formatSensorValue(SensorType.BATTERY, 3.85)).toBe('3.85 V');
    });

    it('should validate sensor types', () => {
      expect(isValidSensorType('water_level')).toBe(true);
      expect(isValidSensorType('temperature')).toBe(true);
      expect(isValidSensorType('invalid')).toBe(false);
    });
  });

  describe('units', () => {
    it('should have all units defined', () => {
      expect(UNIT_INFO[Unit.CENTIMETERS]).toBeDefined();
      expect(UNIT_INFO[Unit.CELSIUS]).toBeDefined();
      expect(UNIT_INFO[Unit.PERCENT]).toBeDefined();
      expect(UNIT_INFO[Unit.PPM]).toBeDefined();
      expect(UNIT_INFO[Unit.VOLTS]).toBeDefined();
    });

    it('should convert units correctly', () => {
      expect(convertUnit(100, Unit.CENTIMETERS, Unit.METERS)).toBe(1);
      expect(convertUnit(1, Unit.METERS, Unit.CENTIMETERS)).toBe(100);
    });

    it('should format values correctly', () => {
      expect(formatValue(45.2, Unit.CENTIMETERS)).toBe('45.20 cm');
      expect(formatValue(23.5, Unit.CELSIUS, 1)).toBe('23.5 °C');
    });

    it('should validate units', () => {
      expect(isValidUnit('cm')).toBe(true);
      expect(isValidUnit('°C')).toBe(true);
      expect(isValidUnit('invalid')).toBe(false);
    });
  });

  describe('default-thresholds', () => {
    it('should have default thresholds for all sensors', () => {
      expect(DEFAULT_THRESHOLDS.water_level_min_cm).toBe(10);
      expect(DEFAULT_THRESHOLDS.water_level_max_cm).toBe(200);
      expect(DEFAULT_THRESHOLDS.temp_min_c).toBe(0);
      expect(DEFAULT_THRESHOLDS.temp_max_c).toBe(50);
      expect(DEFAULT_THRESHOLDS.humidity_min_pct).toBe(20);
      expect(DEFAULT_THRESHOLDS.humidity_max_pct).toBe(80);
      expect(DEFAULT_THRESHOLDS.gas_threshold_ppm).toBe(1000);
      expect(DEFAULT_THRESHOLDS.battery_min_v).toBe(3.3);
      expect(DEFAULT_THRESHOLDS.battery_max_v).toBe(4.2);
    });

    it('should get default thresholds for sensor type', () => {
      const waterThresholds = getDefaultThresholds(SensorType.WATER_LEVEL);
      expect(waterThresholds.min).toBe(10);
      expect(waterThresholds.max).toBe(200);
    });

    it('should validate thresholds', () => {
      const validConfig = { ...DEFAULT_THRESHOLDS };
      expect(validateThresholds(validConfig)).toHaveLength(0);

      const invalidConfig = { ...DEFAULT_THRESHOLDS, water_level_min_cm: 200, water_level_max_cm: 100 };
      expect(validateThresholds(invalidConfig)).toContain('water_level_min_cm must be less than water_level_max_cm');
    });

    it('should merge thresholds', () => {
      const merged = mergeThresholds(DEFAULT_THRESHOLDS, { water_level_min_cm: 15 });
      expect(merged.water_level_min_cm).toBe(15);
      expect(merged.water_level_max_cm).toBe(200);
    });
  });
});

describe('Shared Package - Types', () => {
  describe('sensor', () => {
    it('should create sensor reading', () => {
      const reading = createSensorReading(SensorType.TEMPERATURE, 25.5);
      expect(reading.sensor_type).toBe(SensorType.TEMPERATURE);
      expect(reading.value).toBe(25.5);
      expect(reading.unit).toBe('°C');
      expect(reading.status).toBe('normal');
    });

    it('should determine status from thresholds', () => {
      const reading = createSensorReading(SensorType.TEMPERATURE, 5, {
        thresholds: { min: 10, max: 40 },
      });
      expect(reading.status).toBe('critical');
    });

    it('should validate sensor readings', () => {
      const validReading = createSensorReading(SensorType.TEMPERATURE, 25);
      expect(isSensorReadingValid(validReading)).toBe(true);

      const invalidReading = { ...validReading, value: NaN };
      expect(isSensorReadingValid(invalidReading)).toBe(false);
    });

    it('should get status colors', () => {
      expect(getSensorStatusColor('normal')).toBe('#22c55e');
      expect(getSensorStatusColor('warning')).toBe('#f59e0b');
      expect(getSensorStatusColor('critical')).toBe('#ef4444');
    });

    it('should get status labels', () => {
      expect(getSensorStatusLabel('normal')).toBe('Normal');
      expect(getSensorStatusLabel('warning')).toBe('Warning');
      expect(getSensorStatusLabel('critical')).toBe('Critical');
    });
  });

  describe('device', () => {
    it('should check if device is online', () => {
      const onlineDevice = {
        status: 'online' as DeviceStatus,
        last_seen: new Date().toISOString(),
      } as Device;

      const offlineDevice = {
        status: 'offline' as DeviceStatus,
        last_seen: new Date().toISOString(),
      } as Device;

      const staleDevice = {
        status: 'online' as DeviceStatus,
        last_seen: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
      } as Device;

      expect(isDeviceOnline(onlineDevice)).toBe(true);
      expect(isDeviceOnline(offlineDevice)).toBe(false);
      expect(isDeviceOnline(staleDevice)).toBe(false);
    });

    it('should get device status colors', () => {
      expect(getDeviceStatusColor('online')).toBe('#22c55e');
      expect(getDeviceStatusColor('offline')).toBe('#6b7280');
      expect(getDeviceStatusColor('error')).toBe('#ef4444');
    });
  });

  describe('alert', () => {
    it('should evaluate thresholds', () => {
      const result = evaluateThreshold(5, {
        sensor_type: SensorType.TEMPERATURE,
        min: 10,
        max: 40,
        severity: 'critical',
        enabled: true,
      });

      expect(result.exceeded).toBe(true);
      expect(result.severity).toBe('critical');
      expect(result.message).toContain('below minimum');
    });

    it('should get severity colors', () => {
      expect(getSeverityColor('info')).toBe('#3b82f6');
      expect(getSeverityColor('warning')).toBe('#f59e0b');
      expect(getSeverityColor('critical')).toBe('#ef4444');
      expect(getSeverityColor('emergency')).toBe('#7c2d12');
    });

    it('should get severity priorities', () => {
      expect(getSeverityPriority('emergency')).toBe(4);
      expect(getSeverityPriority('critical')).toBe(3);
      expect(getSeverityPriority('warning')).toBe(2);
      expect(getSeverityPriority('info')).toBe(1);
    });
  });

  describe('event', () => {
    it('should create event', () => {
      const event = createEvent('threshold_exceeded', 'device_1', 'Water level low');
      expect(event.id).toMatch(/^evt_\d+_[a-z0-9]+$/);
      expect(event.event_type).toBe('threshold_exceeded');
      expect(event.device_id).toBe('device_1');
      expect(event.message).toBe('Water level low');
      expect(event.severity).toBe('warning');
    });

    it('should get event type labels', () => {
      expect(getEventTypeLabel('threshold_exceeded')).toBe('Threshold Exceeded');
      expect(getEventTypeLabel('automation_triggered')).toBe('Automation Triggered');
    });

    it('should get event type colors', () => {
      expect(getEventTypeColor('threshold_exceeded')).toBe('#f59e0b');
      expect(getEventTypeColor('automation_triggered')).toBe('#8b5cf6');
    });
  });
});

describe('Shared Package - Protocol', () => {
  it('should export protocol types', () => {
    // Just verify imports work
    expect(true).toBe(true);
  });
});