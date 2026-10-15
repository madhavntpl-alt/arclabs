'use client';

import { motion } from 'motion/react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, RotateCcw, Loader2, Usb, Bluetooth, Wifi1, Wifi2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';

interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'error' | 'mock';
  deviceName?: string;
  lastConnected?: string;
  reconnectAttempts?: number;
  maxReconnectAttempts?: number;
  latency?: number;
  messagesPerSecond?: number;
  showDetails?: boolean;
  className?: string;
}

const statusConfig = {
  connected: { icon: Wifi, color: 'text-success-600 dark:text-success-400', bg: 'bg-success-100 dark:bg-success-900/30', label: 'Connected', pulse: true },
  connecting: { icon: Loader2, color: 'text-warning-600 dark:text-warning-400', bg: 'bg-warning-100 dark:bg-warning-900/30', label: 'Connecting', spin: true },
  disconnected: { icon: WifiOff, color: 'text-danger-600 dark:text-danger-400', bg: 'bg-danger-100 dark:bg-danger-900/30', label: 'Disconnected' },
  error: { icon: AlertCircle, color: 'text-danger-600 dark:text-danger-400', bg: 'bg-danger-100 dark:bg-danger-900/30', label: 'Error', pulse: true },
  mock: { icon: Wifi1, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/30', label: 'Mock Mode' },
};

export function ConnectionStatus({
  status,
  deviceName,
  lastConnected,
  reconnectAttempts = 0,
  maxReconnectAttempts = 10,
  latency,
  messagesPerSecond,
  showDetails = true,
  className,
}: ConnectionStatusProps) {
  const config = statusConfig[status];

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <Tooltip content={config.label} position="top">
        <motion.div
          className={clsx('w-8 h-8 rounded-full flex items-center justify-center', config.bg)}
          animate={{
            scale: config.pulse ? [1, 1.1, 1] : 1,
            rotate: config.spin ? 360 : 0,
          }}
          transition={{
            duration: config.pulse ? 2 : config.spin ? 1 : 0,
            repeat: config.pulse || config.spin ? Infinity : 0,
            ease: 'linear',
          }}
        >
          <config.icon className={clsx('w-4 h-4', config.color)} />
        </motion.div>
      </Tooltip>

      {showDetails && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={clsx('text-sm font-medium', status === 'connected' ? 'text-success-700 dark:text-success-300' : 'text-secondary-900 dark:text-secondary-100')}>
              {deviceName || 'Device'}
            </span>
            <Badge variant={status === 'connected' ? 'success' : status === 'connecting' ? 'warning' : status === 'mock' ? 'primary' : 'danger'}>
              {config.label}
            </Badge>
          </div>

          <div className="mt-1 flex flex-wrap gap-4 text-xs text-secondary-500 dark:text-secondary-400">
            {lastConnected && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last: {new Date(lastConnected).toLocaleTimeString()}
              </span>
            )}
            {status === 'connecting' && reconnectAttempts > 0 && (
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3 animate-spin" />
                Reconnecting... ({reconnectAttempts}/{maxReconnectAttempts})
              </span>
            )}
            {latency !== undefined && (
              <span className="flex items-center gap-1">
                <Wifi2 className="w-3 h-3" />
                {latency}ms
              </span>
            )}
            {messagesPerSecond !== undefined && (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3" />
                {messagesPerSecond.toFixed(1)}/s
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectionStatus;