'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, AlertTriangle, Info, X, ChevronDown, ChevronUp, Filter, Bell, BellOff } from 'lucide-react';
import { clsx } from 'clsx';
import { Alert, AlertSeverity, AlertStatus } from '../../types/alert';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  className?: string;
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

export function AlertPanel({
  alerts,
  onAcknowledge,
  onResolve,
  onDismiss,
  className,
}: AlertPanelProps) {
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('all');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [showThresholdModal, setShowThresholdModal] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    const severityMatch = filterSeverity === 'all' || alert.severity === filterSeverity;
    const statusMatch = filterStatus === 'all' || alert.status === filterStatus;
    return severityMatch && statusMatch;
  });

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length;

  return (
    <div className={clsx('card', className)}>
      {/* Header */}
      <div className="p-5 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-danger-600 dark:text-danger-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Alerts</h2>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                {alerts.length} total • {activeCount} active • {criticalCount} critical
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowThresholdModal(true)}>
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </Button>
            <Button variant="primary" size="sm" onClick={() => { /* Configure thresholds */ }}>
              <Bell className="w-4 h-4 mr-1" />
              Thresholds
            </Button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'info', 'warning', 'critical', 'emergency'] as const).map(severity => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(severity)}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                filterSeverity === severity
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-300 dark:hover:bg-secondary-700'
              )}
            >
              {severity === 'all' ? 'All' : severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
          <div className="w-px h-6 bg-secondary-200 dark:bg-secondary-700 mx-1" />
          {(['all', 'active', 'acknowledged', 'resolved'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                filterStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-300 dark:hover:bg-secondary-700'
              )}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
        <AnimatePresence>
          {filteredAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <BellOff className="w-12 h-12 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
              <p className="text-secondary-500 dark:text-secondary-400">
                {alerts.length === 0 ? 'No alerts recorded' : 'No alerts match current filters'}
              </p>
            </motion.div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                index={index}
                onAcknowledge={onAcknowledge}
                onResolve={onResolve}
                onDismiss={onDismiss}
                expanded={expandedAlert === alert.id}
                onToggleExpand={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Threshold Config Modal */}
      <Modal
        isOpen={showThresholdModal}
        onClose={() => setShowThresholdModal(false)}
        title="Configure Thresholds"
        description="Set threshold values for sensor alerts"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            Threshold configuration would be implemented here with form fields for each sensor type.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function AlertItem({
  alert,
  index,
  onAcknowledge,
  onResolve,
  onDismiss,
  expanded,
  onToggleExpand,
}: {
  alert: Alert;
  index: number;
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const config = severityConfig[alert.severity];
  const status = statusConfig[alert.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="p-5 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors"
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
              <button
                onClick={onToggleExpand}
                className="p-1 rounded-lg text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                aria-label={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onDismiss(alert.id)}
                className="p-1 rounded-lg text-secondary-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400">
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

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700"
              >
                <div className="flex items-center gap-2">
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
                      <pre className="mt-2 p-3 bg-secondary-100 dark:bg-secondary-800 rounded text-xs overflow-auto">
                        {JSON.stringify(alert.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default AlertPanel;