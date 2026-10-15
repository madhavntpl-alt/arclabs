import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import { useUIStore } from '../store/uiStore';
import { SensorReading, SensorType, SensorHistory, SensorHistoryPoint, DeviceStatus, Alert, EventLog, ThresholdConfig } from '../types';
import { api } from '../services/api';
import { DEFAULT_THRESHOLDS } from '../constants/default-thresholds';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Mock data for development
const MOCK_READINGS: SensorReading[] = [
  { sensor_type: 'water_level', value: 45.2, unit: 'cm', timestamp: new Date().toISOString(), status: 'normal', thresholds: { min: 10, max: 200 } },
  { sensor_type: 'temperature', value: 23.5, unit: '°C', timestamp: new Date().toISOString(), status: 'normal', thresholds: { min: 0, max: 50 } },
  { sensor_type: 'humidity', value: 65, unit: '%', timestamp: new Date().toISOString(), status: 'normal', thresholds: { min: 20, max: 80 } },
  { sensor_type: 'gas', value: 450, unit: 'ppm', timestamp: new Date().toISOString(), status: 'normal', thresholds: { max: 1000 } },
  { sensor_type: 'battery', value: 3.85, unit: 'V', timestamp: new Date().toISOString(), status: 'normal', thresholds: { min: 3.3, max: 4.2 } },
];

export function useSensorData() {
  const queryClient = useQueryClient();
  const { setSensorReadings, setDeviceStatus, setAlerts, addAlert, setEvents, addEvent } = useUIStore();

  // Fetch initial sensor readings
  const { data: sensorReadings, isLoading, error } = useQuery({
    queryKey: ['sensorReadings'],
    queryFn: () => api.getSensors(),
    staleTime: 5000,
    refetchInterval: 30000,
  });

  // Fetch device status
  const { data: deviceStatus } = useQuery({
    queryKey: ['deviceStatus'],
    queryFn: () => api.getDevices(),
    staleTime: 10000,
    refetchInterval: 60000,
  });

  // Fetch thresholds
  const { data: thresholds } = useQuery({
    queryKey: ['thresholds'],
    queryFn: () => api.getThresholds(),
    staleTime: 60000,
  });

  // WebSocket for real-time updates
  const { status: wsStatus, latency, messagesPerSecond } = useWebSocket({
    url: WS_URL,
    onSensorReading: (reading) => {
      setSensorReadings([reading]);
      queryClient.setQueryData(['sensorReadings'], (old: SensorReading[] | undefined) => {
        if (!old) return [reading];
        const exists = old.find(r => r.sensor_type === reading.sensor_type);
        if (exists) {
          return old.map(r => r.sensor_type === reading.sensor_type ? reading : r);
        }
        return [...old, reading];
      });
    },
    onDeviceStatus: (status) => {
      setDeviceStatus(status);
    },
    onAlert: (alert) => {
      addAlert(alert);
    },
    onEvent: (event) => {
      addEvent(event);
    },
  });

  // Fetch sensor history
  const fetchHistory = async (
    sensorType: SensorType,
    start: string,
    end: string,
    interval: string = '1m'
  ): Promise<SensorHistory> => {
    const response = await fetch(
      `${API_URL}/api/v1/sensors/history?sensor_type=${sensorType}&start=${start}&end=${end}&interval=${interval}`
    );
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  };

  // Fetch alerts
  const fetchAlerts = async (params?: { status?: string; limit?: number }) => {
    const searchParams = new URLSearchParams(params as any);
    const response = await fetch(`${API_URL}/api/v1/alerts?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  };

  // Fetch events
  const fetchEvents = async (params?: { event_type?: string; severity?: string; limit?: number }) => {
    const searchParams = new URLSearchParams(params as any);
    const response = await fetch(`${API_URL}/api/v1/events?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  };

  // Control functions
  const controlPump = async (action: 'on' | 'off' | 'toggle', duration?: number) => {
    const response = await fetch(`${API_URL}/api/v1/control/pump`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, duration_seconds: duration }),
    });
    if (!response.ok) throw new Error('Failed to control pump');
    return response.json();
  };

  const controlRelay = async (relay: number, state: boolean) => {
    const response = await fetch(`${API_URL}/api/v1/control/relay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relay, state }),
    });
    if (!response.ok) throw new Error('Failed to control relay');
    return response.json();
  };

  const emergencyStop = async () => {
    const response = await fetch(`${API_URL}/api/v1/control/emergency_stop`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to emergency stop');
    return response.json();
  };

  // Threshold functions
  const updateThresholds = async (config: Partial<ThresholdConfig>) => {
    const response = await fetch(`${API_URL}/api/v1/config/thresholds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...DEFAULT_THRESHOLDS, ...config }),
    });
    if (!response.ok) throw new Error('Failed to update thresholds');
    const data = await response.json();
    queryClient.invalidateQueries({ queryKey: ['thresholds'] });
    return data;
  };

  return {
    // State
    sensorReadings: sensorReadings || MOCK_READINGS,
    deviceStatus: deviceStatus?.[0] || null,
    thresholds: thresholds || DEFAULT_THRESHOLDS,
    isLoading,
    error,
    wsStatus,
    latency,
    messagesPerSecond,

    // Functions
    fetchHistory,
    fetchAlerts,
    fetchEvents,
    controlPump,
    controlRelay,
    emergencyStop,
    updateThresholds,

    // React Query helpers
    queryClient,
  };
}

export default useSensorData;