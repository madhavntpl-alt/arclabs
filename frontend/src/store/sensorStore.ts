import { create } from 'zustand';
import { SensorReading, SensorType } from '../types/sensor';

interface SensorState {
  readings: Map<SensorType, SensorReading>;
  latestReading: SensorReading | null;
  history: Map<SensorType, SensorReading[]>;
  maxHistoryLength: number;
  setSensorReadings: (readings: SensorReading | SensorReading[]) => void;
  getReading: (type: SensorType) => SensorReading | undefined;
  getAllReadings: () => SensorReading[];
  addToHistory: (reading: SensorReading) => void;
  getHistory: (type: SensorType, limit?: number) => SensorReading[];
  clearHistory: (type?: SensorType) => void;
  setMaxHistoryLength: (length: number) => void;
}

export const useSensorStore = create<SensorState>((set, get) => ({
  readings: new Map(),
  latestReading: null,
  history: new Map(),
  maxHistoryLength: 1000,

  setSensorReadings: (readings) => {
    const readingArray = Array.isArray(readings) ? readings : [readings];
    set(state => {
      const newReadings = new Map(state.readings);
      let latest: SensorReading | null = state.latestReading;

      readingArray.forEach(reading => {
        newReadings.set(reading.sensor_type, reading);
        latest = reading;
      });

      return { readings: newReadings, latestReading: latest };
    });
  },

  getReading: (type) => {
    return get().readings.get(type);
  },

  getAllReadings: () => {
    return Array.from(get().readings.values());
  },

  addToHistory: (reading) => {
    set(state => {
      const newHistory = new Map(state.history);
      const existing = newHistory.get(reading.sensor_type) || [];
      const updated = [reading, ...existing].slice(0, state.maxHistoryLength);
      newHistory.set(reading.sensor_type, updated);
      return { history: newHistory };
    });
  },

  getHistory: (type, limit = 100) => {
    const history = get().history.get(type) || [];
    return history.slice(0, limit);
  },

  clearHistory: (type) => {
    set(state => {
      if (type) {
        const newHistory = new Map(state.history);
        newHistory.delete(type);
        return { history: newHistory };
      }
      return { history: new Map() };
    });
  },

  setMaxHistoryLength: (length) => {
    set({ maxHistoryLength: length });
  },
}));

export default useSensorStore;