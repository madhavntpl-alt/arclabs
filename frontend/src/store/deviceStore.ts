import { create } from 'zustand';
import { Device, DeviceStatus, DeviceType, ActuatorType } from '../types/device';

interface DeviceState {
  devices: Map<string, Device>;
  activeDevice: Device | null;
  selectedDeviceId: string | null;
  setDevices: (devices: Device[]) => void;
  addDevice: (device: Device) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  removeDevice: (id: string) => void;
  getDevice: (id: string) => Device | undefined;
  getAllDevices: () => Device[];
  getOnlineDevices: () => Device[];
  setActiveDevice: (device: Device | null) => void;
  setSelectedDeviceId: (id: string | null) => void;
  updateActuatorState: (deviceId: string, actuator: ActuatorType, state: boolean) => void;
  updateMetrics: (deviceId: string, metrics: Partial<Device['metrics']>) => void;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: new Map(),
  activeDevice: null,
  selectedDeviceId: null,

  setDevices: (devices) => {
    const deviceMap = new Map(devices.map(d => [d.id, d]));
    set({ devices: deviceMap });
  },

  addDevice: (device) => {
    set(state => {
      const newDevices = new Map(state.devices);
      newDevices.set(device.id, device);
      return { devices: newDevices };
    });
  },

  updateDevice: (id, updates) => {
    set(state => {
      const existing = state.devices.get(id);
      if (!existing) return state;

      const newDevices = new Map(state.devices);
      newDevices.set(id, { ...existing, ...updates, updated_at: new Date().toISOString() });
      return { devices: newDevices };
    });
  },

  removeDevice: (id) => {
    set(state => {
      const newDevices = new Map(state.devices);
      newDevices.delete(id);
      return { devices: newDevices };
    });
  },

  getDevice: (id) => {
    return get().devices.get(id);
  },

  getAllDevices: () => {
    return Array.from(get().devices.values());
  },

  getOnlineDevices: () => {
    return Array.from(get().devices.values()).filter(d => d.status === 'online');
  },

  setActiveDevice: (device) => {
    set({ activeDevice: device, selectedDeviceId: device?.id || null });
  },

  setSelectedDeviceId: (id) => {
    const device = id ? get().devices.get(id) : null;
    set({ selectedDeviceId: id, activeDevice: device });
  },

  updateActuatorState: (deviceId, actuator, state) => {
    set(state => {
      const device = state.devices.get(deviceId);
      if (!device) return state;

      const newDevices = new Map(state.devices);
      newDevices.set(deviceId, {
        ...device,
        config: {
          ...device.config,
          actuators: device.config.actuators.map(a =>
            a === actuator ? actuator : a
          ),
        },
      });
      return { devices: newDevices };
    });
  },

  updateMetrics: (deviceId, metrics) => {
    set(state => {
      const device = state.devices.get(deviceId);
      if (!device || !device.metrics) return state;

      const newDevices = new Map(state.devices);
      newDevices.set(deviceId, {
        ...device,
        metrics: { ...device.metrics, ...metrics },
      });
      return { devices: newDevices };
    });
  },
}));

export default useDeviceStore;