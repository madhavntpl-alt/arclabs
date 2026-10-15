'use client';

import { motion } from 'motion/react';
import { useUIStore } from '../../store/uiStore';
import { EventLog } from '../../components/events/EventLog';
import { clsx } from 'clsx';

export function Events() {
  const { events, addEvent } = useUIStore();
  const [filterEventType, setFilterEventType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Mock events for demo
  const mockEvents = [
    { id: 'evt_1', event_type: 'threshold_exceeded', severity: 'warning' as const, device_id: 'device_1', message: 'Water level below minimum: 8.5 cm', metadata: { sensor: 'water_level', value: 8.5, threshold: 10 }, timestamp: new Date(Date.now() - 300000).toISOString() },
    { id: 'evt_2', event_type: 'automation_triggered', severity: 'info' as const, device_id: 'device_1', message: 'Automation rule "Low Water Pump" executed', metadata: { rule_id: 'rule_1', rule_name: 'Low Water Pump' }, timestamp: new Date(Date.now() - 600000).toISOString() },
    { id: 'evt_3', event_type: 'command_sent', severity: 'info' as const, device_id: 'device_1', message: 'Pump ON command sent for 60s', metadata: { command_id: 'cmd_123', command_type: 'pump_on', params: { duration: 60 } }, timestamp: new Date(Date.now() - 900000).toISOString() },
    { id: 'evt_4', event_type: 'command_ack', severity: 'info' as const, device_id: 'device_1', message: 'Pump activated for 60s', metadata: { command_id: 'cmd_123', ack_success: true }, timestamp: new Date(Date.now() - 899000).toISOString() },
    { id: 'evt_5', event_type: 'device_connected', severity: 'info' as const, device_id: 'device_1', message: 'Device connected', timestamp: new Date(Date.now() - 3600000).toISOString() },
  ];

  const filteredEvents = mockEvents.filter(event => {
    if (filterEventType !== 'all' && event.event_type !== filterEventType) return false;
    if (filterSeverity !== 'all' && event.severity !== filterSeverity) return false;
    if (filterDevice !== 'all' && event.device_id !== filterDevice) return false;
    if (search && !event.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Events</h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {mockEvents.length} total events
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 w-64"
          />
          <select
            value={filterEventType}
            onChange={e => setFilterEventType(e.target.value)}
            className="px-3 py-2 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">All Types</option>
            <option value="threshold_exceeded">Threshold Exceeded</option>
            <option value="automation_triggered">Automation Triggered</option>
            <option value="command_sent">Command Sent</option>
            <option value="command_ack">Command Acknowledged</option>
            <option value="device_connected">Device Connected</option>
            <option value="device_disconnected">Device Disconnected</option>
          </select>
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="px-3 py-2 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
      </motion.div>

      {/* Event Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <EventLog
          events={filteredEvents}
          onFilterChange={() => {}}
          onDelete={id => { /* delete event */ }}
        />
      </motion.div>
    </div>
  );
}

import { useState } from 'react';