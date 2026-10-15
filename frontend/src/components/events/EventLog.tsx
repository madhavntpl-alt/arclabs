'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, X, ChevronDown, ChevronUp, Download, Clock, AlertTriangle, AlertCircle, Info, CheckCircle, Trash2, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { EventLog, EventType, AlertSeverity } from '../../types/event';
import { EventFilters } from './EventFilters';

interface EventLogProps {
  events: EventLog[];
  onFilterChange: (filters: any) => void;
  onDelete?: (eventId: string) => void;
  className?: string;
}

const severityConfig = {
  info: { icon: Info, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/30', label: 'Info' },
  warning: { icon: AlertTriangle, color: 'text-warning-600 dark:text-warning-400', bg: 'bg-warning-100 dark:bg-warning-900/30', label: 'Warning' },
  critical: { icon: AlertCircle, color: 'text-danger-600 dark:text-danger-400', bg: 'bg-danger-100 dark:bg-danger-900/30', label: 'Critical' },
  emergency: { icon: AlertCircle, color: 'text-danger-900 dark:text-danger-300', bg: 'bg-danger-200 dark:bg-danger-800', label: 'Emergency' },
};

const eventTypeConfig: Record<EventType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  sensor_reading: { label: 'Sensor Reading', icon: () => <Settings className="w-4 h-4" /> },
  threshold_exceeded: { label: 'Threshold Exceeded', icon: () => <AlertTriangle className="w-4 h-4" /> },
  threshold_cleared: { label: 'Threshold Cleared', icon: () => <CheckCircle className="w-4 h-4" /> },
  automation_triggered: { label: 'Automation Triggered', icon: () => <Settings className="w-4 h-4" /> },
  command_sent: { label: 'Command Sent', icon: () => <ChevronUp className="w-4 h-4" /> },
  command_ack: { label: 'Command Acknowledged', icon: () => <CheckCircle className="w-4 h-4" /> },
  command_failed: { label: 'Command Failed', icon: () => <X className="w-4 h-4" /> },
  device_connected: { label: 'Device Connected', icon: () => <CheckCircle className="w-4 h-4" /> },
  device_disconnected: { label: 'Device Disconnected', icon: () => <X className="w-4 h-4" /> },
  device_error: { label: 'Device Error', icon: () => <AlertCircle className="w-4 h-4" /> },
  firmware_update: { label: 'Firmware Update', icon: () => <Settings className="w-4 h-4" /> },
  calibration: { label: 'Calibration', icon: () => <Settings className="w-4 h-4" /> },
  config_changed: { label: 'Config Changed', icon: () => <Settings className="w-4 h-4" /> },
  user_action: { label: 'User Action', icon: () => <Settings className="w-4 h-4" /> },
  system_startup: { label: 'System Startup', icon: () => <Clock className="w-4 h-4" /> },
  system_shutdown: { label: 'System Shutdown', icon: () => <Clock className="w-4 h-4" /> },
  error: { label: 'Error', icon: () => <AlertCircle className="w-4 h-4" /> },
};

export function EventLog({ events, onFilterChange, onDelete, className }: EventLogProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'timestamp', direction: 'desc' });

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const aVal = (a as any)[sortConfig.key];
      const bVal = (b as any)[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [events, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  return (
    <Card className={className}>
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center">
            <Settings className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Event Log</h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">{events.length} events</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EventFilters onFilterChange={onFilterChange} />
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Event List */}
      <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
        <AnimatePresence>
          {sortedEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <Settings className="w-16 h-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">No Events</h3>
              <p className="text-secondary-500 dark:text-secondary-400">No events match the current filters.</p>
            </motion.div>
          ) : (
            sortedEvents.map((event, index) => (
              <EventRow
                key={event.id}
                event={event}
                index={index}
                expanded={expandedEvents.has(event.id)}
                onToggleExpand={toggleExpand}
                onDelete={onDelete}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {events.length > 50 && (
        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            Showing {Math.min(events.length, 50)} of {events.length} events
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function EventRow({
  event,
  index,
  expanded,
  onToggleExpand,
  onDelete,
  sortConfig,
  onSort,
}: {
  event: EventLog;
  index: number;
  expanded: boolean;
  onToggleExpand: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
}) {
  const config = severityConfig[event.severity];
  const typeConfig = eventTypeConfig[event.event_type as EventType] || { label: event.event_type, icon: Settings };
  const TypeIcon = typeConfig.icon;

  const sortableFields = ['timestamp', 'event_type', 'severity', 'device_id'];
  const isSortable = (field: string) => sortableFields.includes(field);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors"
    >
      <td className="px-4 py-3">
        <div className={clsx('flex items-center gap-2', config.bg + ' rounded-lg p-2')}>
          <config.icon className={clsx('w-4 h-4', config.color)} />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <TypeIcon className="w-4 h-4 text-secondary-500" />
          <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
            {typeConfig.label}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={event.severity as any}>{config.label}</Badge>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-secondary-900 dark:text-secondary-100 max-w-xs truncate">
          {event.message}
        </p>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <p className="text-sm text-secondary-600 dark:text-secondary-400 font-mono">
          {event.device_id}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-secondary-600 dark:text-secondary-400 font-mono whitespace-nowrap">
          {new Date(event.timestamp).toLocaleString()}
        </p>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onToggleExpand(event.id)}
            className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(event.id)}
              className="p-1.5 rounded-lg text-secondary-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

function EventRow({ event, index, expanded, onToggleExpand, onDelete, sortConfig, onSort }: any) {
  const config = severityConfig[event.severity];
  const typeConfig = eventTypeConfig[event.event_type as EventType] || { label: event.event_type, icon: Settings };
  const TypeIcon = typeConfig.icon;

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors"
      >
        <td className="px-4 py-3">
          <div className={clsx('flex items-center gap-2', config.bg + ' rounded-lg p-2')}>
            <config.icon className={clsx('w-4 h-4', config.color)} />
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <TypeIcon className="w-4 h-4 text-secondary-500" />
            <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
              {typeConfig.label}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge variant={event.severity as any}>{config.label}</Badge>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-secondary-900 dark:text-secondary-100 max-w-xs truncate">
            {event.message}
          </p>
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <p className="text-sm text-secondary-600 dark:text-secondary-400 font-mono">
            {event.device_id}
          </p>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-secondary-600 dark:text-secondary-400 font-mono whitespace-nowrap">
            {new Date(event.timestamp).toLocaleString()}
          </p>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => onToggleExpand(event.id)}
              className="p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(event.id)}
                className="p-1.5 rounded-lg text-secondary-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </motion.tr>

      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <td colSpan={7} className="px-4 pb-4">
              <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-lg p-4 ml-4 mr-4 mb-2 border border-secondary-200 dark:border-secondary-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {event.metadata && Object.entries(event.metadata).map(([key, value]) => (
                    <div key={key} className="col-span-1">
                      <p className="text-secondary-500 dark:text-secondary-400 font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                      <p className="font-mono text-secondary-900 dark:text-secondary-100">{JSON.stringify(value)}</p>
                    </div>
                  ))}
                  <div className="col-span-1">
                    <p className="text-secondary-500 dark:text-secondary-400 font-medium">Correlation ID</p>
                    <p className="font-mono text-secondary-900 dark:text-secondary-100">{event.correlation_id || 'N/A'}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-secondary-500 dark:text-secondary-400 font-medium">Event ID</p>
                    <p className="font-mono text-secondary-900 dark:text-secondary-100">{event.id}</p>
                  </div>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

export default EventLog;