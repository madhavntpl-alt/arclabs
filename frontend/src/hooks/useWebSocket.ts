import { useEffect, useRef, useState, useCallback } from 'react';
import { SensorReading, DeviceStatus, Alert, EventLog } from '../types';

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface UseWebSocketOptions {
  url: string;
  onSensorReading?: (reading: SensorReading) => void;
  onDeviceStatus?: (status: DeviceStatus) => void;
  onAlert?: (alert: Alert) => void;
  onEvent?: (event: EventLog) => void;
  onCommandAck?: (ack: { command_id: string; success: boolean; message?: string }) => void;
  onHeartbeat?: (data: { timestamp: string; server_time: string }) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  latency: number;
  messagesPerSecond: number;
  send: (message: WebSocketMessage) => void;
  subscribe: (topics: string[]) => void;
  unsubscribe: (topics: string[]) => void;
  ping: () => void;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    onSensorReading,
    onDeviceStatus,
    onAlert,
    onEvent,
    onCommandAck,
    onHeartbeat,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
  } = options;

  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  const [latency, setLatency] = useState(0);
  const [messagesPerSecond, setMessagesPerSecond] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const messageCountRef = useRef(0);
  const lastMessageTimeRef = useRef(Date.now());
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const pendingPingsRef = useRef<Map<number, number>>(new Map());
  const pingCounterRef = useRef(0);

  // Message rate calculation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeDiff = (now - lastMessageTimeRef.current) / 1000;
      if (timeDiff > 0) {
        setMessagesPerSecond(messageCountRef.current / timeDiff);
      }
      messageCountRef.current = 0;
      lastMessageTimeRef.current = now;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
        console.log('[WebSocket] Connected');

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          pingCounterRef.current += 1;
          const pingId = pingCounterRef.current;
          pendingPingsRef.current.set(pingId, Date.now());
          ws.send(JSON.stringify({ type: 'ping', payload: { id: pingId } }));
        }, 30000);
      };

      ws.onmessage = (event) => {
        messageCountRef.current += 1;

        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Handle pong for latency calculation
          if (message.type === 'pong' && message.payload?.id) {
            const sentTime = pendingPingsRef.current.get(message.payload.id);
            if (sentTime) {
              setLatency(Date.now() - sentTime);
              pendingPingsRef.current.delete(message.payload.id);
            }
            return;
          }

          // Handle heartbeat
          if (message.type === 'heartbeat') {
            onHeartbeat?.(message.payload);
            return;
          }

          // Route messages to handlers
          switch (message.type) {
            case 'sensor_reading':
              onSensorReading?.(message.payload);
              break;
            case 'device_status':
              onDeviceStatus?.(message.payload);
              break;
            case 'alert':
              onAlert?.(message.payload);
              break;
            case 'event':
              onEvent?.(message.payload);
              break;
            case 'command_ack':
              onCommandAck?.(message.payload);
              break;
            default:
              console.log('[WebSocket] Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onclose = (event) => {
        setStatus('disconnected');
        console.log('[WebSocket] Disconnected:', event.code, event.reason);

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`[WebSocket] Reconnecting... (attempt ${reconnectAttemptsRef.current})`);
          reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
        } else {
          setStatus('error');
          console.error('[WebSocket] Max reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setStatus('error');
      };
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
      setStatus('error');
    }
  }, [url, onSensorReading, onDeviceStatus, onAlert, onEvent, onCommandAck, onHeartbeat, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send, not connected');
    }
  }, []);

  const subscribe = useCallback((topics: string[]) => {
    send({ type: 'subscribe', payload: { topics } });
  }, [send]);

  const unsubscribe = useCallback((topics: string[]) => {
    send({ type: 'unsubscribe', payload: { topics } });
  }, [send]);

  const ping = useCallback(() => {
    pingCounterRef.current += 1;
    const pingId = pingCounterRef.current;
    pendingPingsRef.current.set(pingId, Date.now());
    send({ type: 'ping', payload: { id: pingId } });
  }, [send]);

  // Connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    status,
    latency,
    messagesPerSecond,
    send,
    subscribe,
    unsubscribe,
    ping,
  };
}

export default useWebSocket;