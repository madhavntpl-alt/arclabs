'use client';

import { motion } from 'motion/react';
import { useAlertStore } from '../../store/alertStore';
import { AlertPanel } from '../../components/alerts/AlertPanel';
import { ThresholdConfigModal } from '../../components/alerts/ThresholdConfigModal';
import { clsx } from 'clsx';

export function Alerts() {
  const { alerts, getAlerts } = useAlertStore();
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'info' | 'warning' | 'critical' | 'emergency'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'acknowledged' | 'resolved' | 'suppressed'>('all');

  const filteredAlerts = getAlerts({
    severity: filterSeverity === 'all' ? undefined : filterSeverity,
    status: filterStatus === 'all' ? undefined : filterStatus,
  });

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length;

  return (
    <div className={clsx('space-y-6')}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Alerts</h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {alerts.length} total • {activeCount} active • {criticalCount} critical
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value as any)}
            className="px-3 py-2 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="emergency">Emergency</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
            <option value="suppressed">Suppressed</option>
          </select>
          <button
            onClick={() => setShowThresholdModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Configure Thresholds
          </button>
        </div>
      </motion.div>

      {/* Alert Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <AlertPanel
          alerts={filteredAlerts}
          onAcknowledge={id => alertStore.getState().acknowledgeAlert(id, 'current-user')}
          onResolve={id => alertStore.getState().resolveAlert(id, 'current-user')}
          onDismiss={id => alertStore.getState().dismissAlert(id)}
        />
      </motion.div>

      {/* Threshold Config Modal */}
      <ThresholdConfigModal
        isOpen={showThresholdModal}
        onClose={() => setShowThresholdModal(false)}
        currentConfig={/* current thresholds */ {} as any}
        onSave={config => { /* save thresholds */ }}
      />
    </div>
  );
}

// Import alert store at the top level for use in event handlers
import { useState } from 'react';
import { useAlertStore as useAlertStoreHook } from '../../store/alertStore';
const alertStore = useAlertStoreHook;