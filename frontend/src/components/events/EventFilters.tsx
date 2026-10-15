'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { EventType, AlertSeverity } from '../../types/event';
import { createPortal } from 'react-dom';

interface EventFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
  className?: string;
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'sensor_reading', label: 'Sensor Reading' },
  { value: 'threshold_exceeded', label: 'Threshold Exceeded' },
  { value: 'threshold_cleared', label: 'Threshold Cleared' },
  { value: 'automation_triggered', label: 'Automation Triggered' },
  { value: 'command_sent', label: 'Command Sent' },
  { value: 'command_ack', label: 'Command Acknowledged' },
  { value: 'command_failed', label: 'Command Failed' },
  { value: 'device_connected', label: 'Device Connected' },
  { value: 'device_disconnected', label: 'Device Disconnected' },
  { value: 'device_error', label: 'Device Error' },
  { value: 'firmware_update', label: 'Firmware Update' },
  { value: 'calibration', label: ' Calibration' },
  { value: 'config_changed', label: 'Config Changed' },
  { value: 'user_action', label: 'User Action' },
  { value: 'system_startup', label: 'System Startup' },
  { value: 'system_shutdown', label: 'System Shutdown' },
  { value: 'error', label: 'Error' },
];

const SEVERITIES: { value: AlertSeverity; label: string }[] = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'critical', label: 'Critical' },
  { value: 'emergency', label: 'Emergency' },
];

export function EventFilters({ onFilterChange, initialFilters = {}, className }: EventFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    event_type: initialFilters.event_type || '',
    severity: initialFilters.severity || '',
    device_id: initialFilters.device_id || '',
    start: initialFilters.start || '',
    end: initialFilters.end || '',
    search: initialFilters.search || '',
  });

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== undefined);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      event_type: '',
      severity: '',
      device_id: '',
      start: '',
      end: '',
      search: '',
    });
  };

  const filterContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-1 w-80 bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-700 shadow-elevated overflow-hidden"
            role="dialog"
            aria-label="Event filters"
          >
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="label">Event Type</label>
                <Select
                  value={filters.event_type}
                  onChange={e => handleChange('event_type', e.target.value)}
                  options={[{ value: '', label: 'All types' }, ...EVENT_TYPES]}
                  placeholder="All types"
                />
              </div>

              <div>
                <label className="label">Severity</label>
                <Select
                  value={filters.severity}
                  onChange={e => handleChange('severity', e.target.value)}
                  options={[{ value: '', label: 'All severities' }, ...SEVERITIES]}
                  placeholder="All severities"
                />
              </div>

              <div>
                <label className="label">Device ID</label>
                <Input
                  value={filters.device_id}
                  onChange={e => handleChange('device_id', e.target.value)}
                  placeholder="Filter by device"
                />
              </div>

              <div>
                <label className="label">Search</label>
                <Input
                  value={filters.search}
                  onChange={e => handleChange('search', e.target.value)}
                  placeholder="Search in messages..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date</label>
                  <Input
                    type="datetime-local"
                    value={filters.start}
                    onChange={e => handleChange('start', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <Input
                    type="datetime-local"
                    value={filters.end}
                    onChange={e => handleChange('end', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-secondary-200 dark:border-secondary-700 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>Close</Button>
              <Button variant="primary" size="sm" onClick={() => setIsOpen(false)}>
                Apply
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className={clsx('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
          'bg-white dark:bg-secondary-800',
          'text-secondary-700 dark:text-secondary-300',
          hasActiveFilters ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-secondary-300 dark:border-secondary-600',
          'hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
          'focus:outline-none focus:ring-2'
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Filter events"
      >
        <Filter className={clsx('w-4 h-4', hasActiveFilters ? 'text-primary-600' : 'text-secondary-400')} />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
            {Object.values(filters).filter(v => v).length}
          </span>
        )}
        <ChevronDown className={clsx('w-4 h-4 text-secondary-400 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {typeof window !== 'undefined' && createPortal(filterContent, document.body)}
    </div>
  );
}

export default EventFilters;