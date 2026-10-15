import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '../store/uiStore';

interface SerialStatus {
  connected: boolean;
  port: string | null;
  baudrate: number;
  lastMessage: string | null;
  messagesPerSecond: number;
  errors: number;
}

export function useSerial() {
  const { serialStatus, setSerialStatus } = useUIStore();
  const [status, setStatus] = useState<SerialStatus>({
    connected: false,
    port: null,
    baudrate: 115200,
    lastMessage: null,
    messagesPerSecond: 0,
    errors: 0,
  });

  // Sync with store
  useEffect(() => {
    setStatus(prev => ({ ...prev, ...serialStatus }));
  }, [serialStatus]);

  const connect = useCallback(async (port: string, baudrate: number = 115200) => {
    setStatus(prev => ({ ...prev, connected: true, port, baudrate }));
    setSerialStatus({ connected: true, port, baudrate });
  }, [setSerialStatus]);

  const disconnect = useCallback(() => {
    setStatus(prev => ({ ...prev, connected: false, port: null }));
    setSerialStatus({ connected: false, port: null, baudrate: 115200 });
  }, [setSerialStatus]);

  const sendCommand = useCallback(async (command: any) => {
    // This would communicate with the backend via API
    console.log('Sending serial command:', command);
  }, []);

  return {
    ...status,
    connect,
    disconnect,
    sendCommand,
  };
}

export default useSerial;