'use client';

import { motion } from 'motion/react';
import { useDeviceStore } from '../../store/deviceStore';
import { useUIStore } from '../../store/uiStore';
import { ControlPanel } from '../../components/control/ControlPanel';
import { AutomationRules } from '../../components/control/AutomationRules';
import { clsx } from 'clsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

export function Control() {
  const { devices, getOnlineDevices, activeDevice } = useDeviceStore();
  const { sidebarCollapsed } = useUIStore();

  const onlineDevices = getOnlineDevices();
  const device = activeDevice || onlineDevices[0];

  // Mock state for demo
  const [pumpState, setPumpState] = useState(false);
  const [valveState, setValveState] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [pumpDuration, setPumpDuration] = useState(30);

  const rules = [
    {
      id: 'rule_1',
      name: 'Low Water Pump',
      enabled: true,
      priority: 10,
      logic: 'AND' as const,
      conditions: [
        { id: 'c1', type: 'sensor' as const, sensor_type: 'water_level', operator: '<', value: 20, duration_seconds: 30 },
      ],
      actions: [
        { id: 'a1', type: 'pump_on' as const, params: { duration_seconds: 60 } },
      ],
      cooldown_seconds: 300,
      execution_count: 5,
      last_triggered: new Date(Date.now() - 3600000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'rule_2',
      name: 'High Temp Valve',
      enabled: true,
      priority: 20,
      logic: 'AND' as const,
      conditions: [
        { id: 'c2', type: 'sensor' as const, sensor_type: 'temperature', operator: '>', value: 35, duration_seconds: 60 },
      ],
      actions: [
        { id: 'a2', type: 'actuator_set' as const, params: { actuator_type: 'valve', state: true } },
      ],
      cooldown_seconds: 600,
      execution_count: 2,
      last_triggered: new Date(Date.now() - 7200000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return (
    <div className={clsx('space-y-6', sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64')}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Control</h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Manual control and automation rules
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={device?.id || ''}
            onChange={e => { /* select device */ }}
            className="px-3 py-2 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {onlineDevices.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.status})</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Control</TabsTrigger>
            <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <ControlPanel
              pumpState={pumpState}
              valveState={valveState}
              automationEnabled={automationEnabled}
              onPumpToggle={setPumpState}
              onValveToggle={setValveState}
              onAutomationToggle={setAutomationEnabled}
              pumpDuration={pumpDuration}
              onPumpDurationChange={setPumpDuration}
            />
          </TabsContent>

          <TabsContent value="automation">
            <AutomationRules
              rules={rules}
              onCreate={rule => console.log('Create rule:', rule)}
              onUpdate={rule => console.log('Update rule:', rule)}
              onDelete={id => console.log('Delete rule:', id)}
              onToggle={(id, enabled) => console.log('Toggle rule:', id, enabled)}
              onDuplicate={id => console.log('Duplicate rule:', id)}
              onTest={id => console.log('Test rule:', id)}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';