import {
  Device,
  DeviceStatus,
  DeviceType,
  ActuatorType,
  DeviceConfig,
  ActuatorStatus,
  DeviceMetrics,
  DeviceSummary,
  DeviceRegistration,
  isDeviceOnline,
  getDeviceStatusColor,
  getDeviceStatusLabel,
  ACTUATOR_TYPES,
  DEVICE_TYPES,
} from '@arc-labs/shared';

// Re-export shared types
export type {
  Device,
  DeviceStatus,
  DeviceType,
  ActuatorType,
  DeviceConfig,
  ActuatorStatus,
  DeviceMetrics,
  DeviceSummary,
  DeviceRegistration,
};

export { ACTUATOR_TYPES, DEVICE_TYPES };
export { isDeviceOnline, getDeviceStatusColor, getDeviceStatusLabel };

// Frontend-specific extensions
export interface DeviceCardProps {
  device: Device;
  onClick?: () => void;
  showMetrics?: boolean;
}

export interface DeviceSelectorProps {
  devices: Device[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}