'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Droplets, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle, X, Settings, Clock, Play, Pause, Stop } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Toggle } from '../ui/Toggle';
import { Slider } from '../ui/Slider';
import { Modal } from '../ui/Modal';

interface ControlPanelProps {
  pumpState: boolean;
  valveState: boolean;
  automationEnabled: boolean;
  onPumpToggle: (state: boolean) => void;
  onValveToggle: (state: boolean) => void;
  onAutomationToggle: (enabled: boolean) => void;
  pumpDuration?: number;
  onPumpDurationChange?: (duration: number) => void;
  className?: string;
}

export function ControlPanel({
  pumpState,
  valveState,
  automationEnabled,
  onPumpToggle,
  onValveToggle,
  onAutomationToggle,
  pumpDuration = 30,
  onPumpDurationChange,
  className,
}: ControlPanelProps) {
  const [showPumpModal, setShowPumpModal] = useState(false);
  const [pumpDurationInput, setPumpDurationInput] = useState(pumpDuration);

  const handlePumpConfirm = () => {
    onPumpToggle(true);
    if (onPumpDurationChange) onPumpDurationChange(pumpDurationInput);
    setShowPumpModal(false);
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Automation Master Toggle */}
      <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Automation Engine</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Automatically control actuators based on sensor thresholds
              </p>
            </div>
          </div>
          <Toggle
            checked={automationEnabled}
            onChange={onAutomationToggle}
            label="Enabled"
            description={automationEnabled ? 'Automation rules are active' : 'Automation is disabled'}
            size="lg"
          />
        </div>
      </Card>

      {/* Pump Control */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              pumpState ? 'bg-success-100 dark:bg-success-900/30' : 'bg-secondary-100 dark:bg-secondary-800'
            )}>
              <Zap className={clsx('w-6 h-6', pumpState ? 'text-success-600 dark:text-success-400' : 'text-secondary-500')} />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Water Pump</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {pumpState ? 'Running' : 'Stopped'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={pumpState ? 'danger' : 'primary'}
              size="lg"
              onClick={() => {
                if (pumpState) {
                  onPumpToggle(false);
                } else {
                  setPumpDurationInput(pumpDuration);
                  setShowPumpModal(true);
                }
              }}
              leftIcon={pumpState ? <Stop className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            >
              {pumpState ? 'Stop Pump' : 'Start Pump'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Default Duration (seconds)</label>
            <Slider
              min={5}
              max={300}
              step={5}
              value={pumpDuration}
              onChange={onPumpDurationChange || (() => {})}
              showValue
              valueFormat={val => `${val}s`}
            />
          </div>
          <div>
            <label className="label">Quick Actions</label>
            <div className="flex gap-2">
              {[15, 30, 60, 120].map(duration => (
                <Button
                  key={duration}
                  variant={pumpDuration === duration ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onPumpDurationChange?.(duration)}
                >
                  {duration}s
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Valve Control */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              valveState ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-secondary-100 dark:bg-secondary-800'
            )}>
              <Droplets className={clsx('w-6 h-6', valveState ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-500')} />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Water Valve</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {valveState ? 'Open' : 'Closed'}
              </p>
            </div>
          </div>
          <Toggle
            checked={valveState}
            onChange={onValveToggle}
            label={valveState ? 'Open' : 'Closed'}
            description="Control water valve"
            size="lg"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={valveState ? 'danger' : 'success'}
            onClick={() => onValveToggle(!valveState)}
            leftIcon={valveState ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            className="flex-1"
          >
            {valveState ? 'Close Valve' : 'Open Valve'}
          </Button>
          <Button variant="outline" size="md" leftIcon={<Clock className="w-4 h-4" />}>
            Timed Open
          </Button>
        </div>
      </Card>

      {/* Emergency Stop */}
      <Card className="border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-danger-600 dark:text-danger-400" />
            </div>
            <div>
              <h3 className="font-semibold text-danger-900 dark:text-danger-100">Emergency Stop</h3>
              <p className="text-sm text-danger-700 dark:text-danger-300">
                Immediately stop all actuators and disable automation
              </p>
            </div>
          </div>
          <Button variant="danger" size="lg" leftIcon={<Stop className="w-4 h-4" />}>
            EMERGENCY STOP
          </Button>
        </div>
      </Card>

      {/* Pump Duration Modal */}
      <Modal
        isOpen={showPumpModal}
        onClose={() => setShowPumpModal(false)}
        title="Start Water Pump"
        description="Set the duration for pump operation"
        size="sm"
      >
        <div className="space-y-4">
          <Slider
            min={5}
            max={300}
            step={5}
            value={pumpDurationInput}
            onChange={setPumpDurationInput}
            showValue
            valueFormat={val => `${val}s`}
          />
          <div className="flex gap-2">
            {[15, 30, 60, 120].map(duration => (
              <Button
                key={duration}
                variant={pumpDurationInput === duration ? 'primary' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setPumpDurationInput(duration)}
              >
                {duration}s
              </Button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowPumpModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handlePumpConfirm}>
              <Play className="w-4 h-4 mr-1" />
              Start Pump
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ControlPanel;