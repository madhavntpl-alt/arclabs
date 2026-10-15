'use client';

import { motion } from 'motion/react';
import { AlertCircle, AlertTriangle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { Alert, AlertSeverity, AlertStatus } from '../../types/alert';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AlertItemProps {
  alert: Alert;
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

const severityConfig = {
  info: { icon: Info, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/30', label: 'Info' },
  warning: { icon: AlertTriangle, color: 'text-warning-600 dark:text-warning-400', bg: 'bg-warning-100 dark:bg-warning-900/30', label: 'Warning' },
  critical: { icon: AlertCircle, color: 'text-danger-600 dark:text-danger-400', bg: 'bg-danger-100 dark:bg-danger-900/30', label: 'Critical' },
  emergency: { icon: AlertCircle, color: 'text-danger-900 dark:text-danger-300', bg: 'bg-danger-200 dark:bg-danger-800', label: 'Emergency' },
};

const statusConfig = {
  active: { label: 'Active', color: 'text-danger-600 dark:text-danger-400' },
  acknowledged: { label: 'Acknowledged', color: 'text-warning-600 dark:text-warning-400' },
  resolved: { label: 'Resolved', color: 'text-success-600 dark:text-success-400' },
  suppressed: { label: 'Suppressed', color: 'text-secondary-500 dark:text-secondary-400' },
};

export function AlertItem({
  alert,
  onAcknowledge,
  onResolve,
  onDismiss,
  expanded = false,
  onToggleExpand,
}: AlertItemProps) {
  const config = severityConfig[alert.severity];
  const status = statusConfig[alert.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', config.bg)}>
          <Icon className={clsx('w-5 h-5', config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-secondary-900 dark:text-secondary-100">
                {alert.message}
              </h4>
              <Badge variant={alert.severity as any}>{config.label}</Badge>
              <Badge variant="outline">{status.label}</Badge>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              {onToggleExpand && (
                <button
                  onClick={onToggleExpand}
                  className="p-1 rounded-lg text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                  aria-label={expanded ? 'Collapse' : 'Expand'}
                >
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={() => onDismiss(alert.id)}
                className="p-1 rounded-lg text-secondary-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400 flex-wrap">
            {alert.sensor_type && (
              <span className="flex items-center gap-1">
                <span className="font-medium">{alert.sensor_type}:</span>
                {alert.value !== undefined && <span>{alert.value}{alert.unit ? ` ${alert.unit}` : ''}</span>}
              </span>
            )}
            {alert.threshold !== undefined && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Threshold:</span>
                <span>{alert.threshold}{alert.unit ? ` ${alert.unit}` : ''}</span>
              </span>
            )}
            <span>{new Date(alert.timestamp).toLocaleString()}</span>
            {alert.device_id && <span>Device: {alert.device_id}</span>}
          </div>

          {expanded && onToggleExpand && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700"
            >
              <div className="flex items-center gap-2 flex-wrap">
                {alert.status === 'active' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onAcknowledge(alert.id)}
                  >
                    Acknowledge
                  </Button>
                )}
                {(alert.status === 'active' || alert.status === 'acknowledged') && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => onResolve(alert.id)}
                  >
                    Resolve
                  </Button>
                )}
                {alert.metadata && (
                  <details className="ml-auto text-sm text-secondary-500">
                    <summary className="cursor-pointer">Show Details</summary>
                    <pre className="mt-2 p-3 bg-secondary-100 dark:bg-secondary-800 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(alert.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default AlertItem;