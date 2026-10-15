'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Save, Reset, AlertTriangle, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { ThresholdConfig, DEFAULT_THRESHOLDS, validateThresholds, mergeThresholds, SensorType, SENSOR_TYPE_INFO } from '../../constants';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface ThresholdConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: ThresholdConfig;
  onSave: (config: ThresholdConfig) => void;
}

const sensorGroups = [
  {
    title: 'Water Level',
    sensors: [SensorType.WATER_LEVEL],
    fields: [
      { key: 'water_level_min_cm', label: 'Minimum (cm)', type: 'number', min: 0, max: 300, step: 1 },
      { key: 'water_level_max_cm', label: 'Maximum (cm)', type: 'number', min: 0, max: 300, step: 1 },
    ],
  },
  {
    title: 'Temperature',
    sensors: [SensorType.TEMPERATURE],
    fields: [
      { key: 'temp_min_c', label: 'Minimum (°C)', type: 'number', min: -40, max: 80, step: 0.5 },
      { key: 'temp_max_c', label: 'Maximum (°C)', type: 'number', min: -40, max: 80, step: 0.5 },
    ],
  },
  {
    title: 'Humidity',
    sensors: [SensorType.HUMIDITY],
    fields: [
      { key: 'humidity_min_pct', label: 'Minimum (%)', type: 'number', min: 0, max: 100, step: 1 },
      { key: 'humidity_max_pct', label: 'Maximum (%)', type: 'number', min: 0, max: 100, step: 1 },
    ],
  },
  {
    title: 'Gas (Air Quality)',
    sensors: [SensorType.GAS],
    fields: [
      { key: 'gas_threshold_ppm', label: 'Threshold (ppm)', type: 'number', min: 0, max: 10000, step: 10 },
    ],
  },
  {
    title: 'Battery',
    sensors: [SensorType.BATTERY],
    fields: [
      { key: 'battery_min_v', label: 'Minimum (V)', type: 'number', min: 0, max: 5, step: 0.01 },
      { key: 'battery_max_v', label: 'Maximum (V)', type: 'number', min: 0, max: 5, step: 0.01 },
    ],
  },
];

export function ThresholdConfigModal({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}: ThresholdConfigModalProps) {
  const [config, setConfig] = useState<ThresholdConfig>(currentConfig);
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (key: keyof ThresholdConfig, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return;

    setConfig(prev => ({ ...prev, [key]: numValue }));
    setTouched(prev => ({ ...prev, [key]: true }));

    // Real-time validation
    const newConfig = mergeThresholds(config, { [key]: numValue });
    const validationErrors = validateThresholds(newConfig);
    setErrors(validationErrors);
  };

  const handleBlur = (key: keyof ThresholdConfig) => {
    setTouched(prev => ({ ...prev, [key]: true }));
  };

  const handleReset = () => {
    setConfig(DEFAULT_THRESHOLDS);
    setErrors([]);
    setTouched({});
  };

  const handleSave = () => {
    const validationErrors = validateThresholds(config);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Mark all as touched
      const allKeys = Object.keys(config) as (keyof ThresholdConfig)[];
      setTouched(allKeys.reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }
    onSave(config);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Threshold Configuration"
      description="Configure alert thresholds for each sensor type. Values outside these ranges will trigger alerts."
      size="lg"
      showCloseButton={true}
    >
      <div className="max-h-[60vh] overflow-y-auto">
        <div className="space-y-6">
          {sensorGroups.map(group => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-5"
            >
              <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SENSOR_TYPE_INFO[group.sensors[0]].color }} />
                {group.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.fields.map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <label htmlFor={field.key} className="label">
                      {field.label}
                    </label>
                    <Input
                      id={field.key}
                      type={field.type}
                      value={config[field.key as keyof ThresholdConfig] ?? ''}
                      onChange={e => handleChange(field.key as keyof ThresholdConfig, e.target.value)}
                      onBlur={() => handleBlur(field.key as keyof ThresholdConfig)}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      error={errors.some(e => e.includes(field.key.replace('_', ' '))) && touched[field.key]}
                    />
                    {(touched[field.key] || errors.length > 0) && errors.some(e => e.includes(field.key.replace('_', ' '))) && (
                      <p className="form-error text-sm">
                        {errors.find(e => e.includes(field.key.replace('_', ' ')))}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-secondary-200 dark:border-secondary-700">
        <Button variant="outline" onClick={handleReset}>
          <Reset className="w-4 h-4 mr-1" />
          Reset to Defaults
        </Button>
        <Button variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={errors.length > 0}
        >
          <Save className="w-4 h-4 mr-1" />
          Save Thresholds
        </Button>
      </div>
    </Modal>
  );
}

export default ThresholdConfigModal;