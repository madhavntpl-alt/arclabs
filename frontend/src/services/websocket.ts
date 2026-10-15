import { useWebSocket } from '../hooks/useWebSocket';
import { SensorReading, DeviceStatus, Alert, EventLog } from '../types';
import { useSensorStore } from '../store/sensorStore';
import { useAlertStore } from '../store/alertStore';
import { useDeviceStore } from '../store/deviceStore';
import { useUIStore } from '../store/uiStore';

export function initializeWebSocket() {
  // This function is called during app initialization
  // The actual WebSocket connection is managed by useWebSocket hook
  // in the components that need it
  console.log('[WebSocket] Initialization complete');
}

export function createWebSocketManager() {
  const { setSensorReadings } = useSensorStore.getState();
  const { addAlert } = useAlertStore.getState();
  const { setDeviceStatus } = useDeviceStore.getState();
  const { addEvent, setConnectionStatus } = useUIStore.getState();

  return useWebSocket({
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live',
    onSensorReading: (reading: SensorReading) => {
      setSensorReadings(reading);
    },
    onDeviceStatus: (status: DeviceStatus) => {
      setDeviceStatus(status);
    },
    onAlert: (alert: Alert) => {
      addAlert(alert);
    },
    onEvent: (event: EventLog) => {
      addEvent(event);
    },
    onCommandAck: (ack) => {
      console.log('[WebSocket] Command acknowledged:', ack);
    },
    onHeartbeat: (data) => {
      console.log('[WebSocket] Heartbeat:', data);
    },
  });
}

export default { initializeWebSocket, createWebSocketManager };