'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ReconnectingIndicator } from './ReconnectingIndicator';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useUIStore } from '../../store/uiStore';

interface ConnectionContextType {
  status: 'connected' | 'connecting' | 'disconnected' | 'error' | 'mock';
  latency: number;
  messagesPerSecond: number;
  reconnectAttempts: number;
  lastConnected: string | null;
  deviceName: string | null;
}

const ConnectionContext = createContext<ConnectionContextType | null>(null);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const { status, setStatus, reconnectAttempts, setReconnectAttempts, lastConnected, setLastConnected } = useUIStore();
  const { latency, messagesPerSecond } = useWebSocket();
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [showReconnecting, setShowReconnecting] = useState(false);

  // Simulate connection status changes for demo
  useEffect(() => {
    if (status === 'connected') {
      setShowReconnecting(false);
      setReconnectAttempts(0);
    } else if (status === 'connecting' || status === 'disconnected') {
      setShowReconnecting(true);
    }
  }, [status, setShowReconnecting, setReconnectAttempts]);

  return (
    <ConnectionContext.Provider value={{
      status,
      latency,
      messagesPerSecond,
      reconnectAttempts,
      lastConnected,
      deviceName,
    }}>
      {children}
      <ReconnectingIndicator
        attempts={reconnectAttempts}
        maxAttempts={10}
        onDismiss={() => setShowReconnecting(false)}
        onRetry={() => {
          setStatus('connecting');
          // Trigger reconnection logic
          setTimeout(() => setStatus('connected'), 2000);
        }}
      />
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}

export default ConnectionProvider;