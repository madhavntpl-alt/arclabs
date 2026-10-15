'use client';

import { motion } from 'motion/react';
import { useUIStore } from '../../store/uiStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Slider } from '../../components/ui/Slider';
import { Badge } from '../../components/ui/Badge';
import { clsx } from 'clsx';
import { SensorType, SENSOR_TYPE_INFO, DEFAULT_THRESHOLDS } from '@arc-labs/shared';
import { Thermometer, Droplet, Wind, Battery, AlertTriangle, CheckCircle, RotateCcw, Settings, Save } from 'lucide-react';

const calibrationSensors = [
  { type: SensorType.WATER_LEVEL, label: 'Water Level', icon: Droplet, unit: 'cm', fields: ['slope', 'offset'] },
  { type: SensorType.TEMPERATURE, label: 'Temperature', icon: Thermometer, unit: '°C', fields: ['offset'] },
  { type: SensorType.HUMIDITY, label: 'Humidity', icon: Droplet, unit: '%', fields: ['offset'] },
  { type: SensorType.GAS, label: 'Gas (Air Quality)', icon: Wind, unit: 'ppm', fields: ['r0', 'slope', 'intercept'] },
  { type: SensorType.BATTERY, label: 'Battery', icon: Battery, unit: 'V', fields: ['divider_ratio', 'adc_ref', 'offset'] },
];

const defaultCalibration = {
  water_level: { slope: 58.0, offset: -2.5 },
  temperature: { offset: 0.0 },
  humidity: { offset: 0.0 },
  gas: { r0: 10.0, slope: -0.45, intercept: 1.2 },
  battery: { divider_ratio: 11.0, adc_ref: 5.0, offset: 0.0 },
};

export function Calibration() {
  const { sidebarCollapsed } = useUIStore();
  const [activeSensor, setActiveSensor] = useState<SensorType>(SensorType.WATER_LEVEL);
  const [calibration, setCalibration] = useState(defaultCalibration);
  const [knownValue, setKnownValue] = useState('');
  const [calibrating, setCalibrating] = useState(false);
  const [lastCalibrated, setLastCalibrated] = useState<Record<string, string>>({});

  const sensorInfo = SENSOR_TYPE_INFO[activeSensor];
  const currentCalibration = calibration[activeSensor];

  const handleCalibrate = async () => {
    if (!knownValue) return;
    setCalibrating(true);
    // Simulate calibration process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastCalibrated(prev => ({ ...prev, [activeSensor]: new Date().toISOString() }));
    setCalibrating(false);
    setKnownValue('');
  };

  const handleReset = () => {
    setCalibration(prev => ({ ...prev, [activeSensor]: defaultCalibration[activeSensor] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Calibration</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Calibrate sensors for accurate readings</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export Calibration</Button>
          <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />}>Import Calibration</Button>
          <Button variant="primary" leftIcon={<Save className="w-4 h-4" />} onClick={() => { /* save calibration */ }}>Save All</Button>
        </div>
      </motion.div>

      {/* Sensor Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {calibrationSensors.map(sensor => (
          <button
            key={sensor.type}
            onClick={() => setActiveSensor(sensor.type)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeSensor === sensor.type
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700'
            )}
          >
            <sensor.icon className="w-4 h-4" />
            {sensor.label}
          </button>
        ))}
      </motion.div>

      {/* Calibration Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <div className="p-5 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', `bg-${sensorInfo.color}-100 dark:bg-${sensorInfo.color}-900/30`)}>
                <sensorInfo.icon className={clsx('w-6 h-6', `text-${sensorInfo.color}-600 dark:text-${sensorInfo.color}-400`)} />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">{sensorInfo.label} Calibration</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Unit: {sensorInfo.unit}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={lastCalibrated[activeSensor] ? 'success' : 'secondary'}>
                {lastCalibrated[activeSensor] ? `Last: ${new Date(lastCalibrated[activeSensor]).toLocaleDateString()}` : 'Not calibrated'}
              </Badge>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Current Calibration Values */}
            <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-5">
              <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-4">Current Calibration Parameters</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(currentCalibration).map(([key, value]) => (
                  <div key={key} className="space-y-1.5">
                    <label className="label text-sm">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <Input
                      type="number"
                      value={value}
                      onChange={e => setCalibration(prev => ({ ...prev, [activeSensor]: { ...prev[activeSensor], [key]: parseFloat(e.target.value) || 0 } }))}
                      step="any"
                      className="font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Live Calibration */}
            <div className="border-t border-secondary-200 dark:border-secondary-700 pt-6">
              <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
                Live Calibration
              </h4>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                Place the sensor in a known reference condition (e.g., water at 0cm, temperature at 25°C), enter the known value, and click Calibrate.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="label">Known Reference Value ({sensorInfo.unit})</label>
                  <Input
                    type="number"
                    value={knownValue}
                    onChange={e => setKnownValue(e.target.value)}
                    placeholder="Enter known value"
                    step="any"
                    disabled={calibrating}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    variant="primary"
                    onClick={handleCalibrate}
                    disabled={!knownValue || calibrating}
                    leftIcon={calibrating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                  >
                    {calibrating ? 'Calibrating...' : 'Calibrate'}
                  </Button>
                  <Button variant="outline" onClick={handleReset} disabled={calibrating} leftIcon={<RotateCcw className="w-4 h-4" />}>
                    Reset to Default
                  </Button>
                </div>
              </div>
            </div>

            {/* Calibration Instructions */}
            <div className="border-t border-secondary-200 dark:border-secondary-700 pt-6">
              <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-3">Calibration Instructions</h4>
              <div className="prose prose-sm text-secondary-600 dark:text-secondary-400 max-w-none">
                {getCalibrationInstructions(activeSensor)}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* All Sensors Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <div className="p-5 border-b border-secondary-200 dark:border-secondary-700">
            <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">All Sensors Calibration Status</h3>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-secondary-600 dark:text-secondary-400">
                    <th className="pb-2">Sensor</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Last Calibrated</th>
                    <th className="pb-2">Parameters</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {calibrationSensors.map(sensor => (
                    <tr key={sensor.type} className="border-t border-secondary-100 dark:border-secondary-800">
                      <td className="py-3 flex items-center gap-2">
                        <sensor.icon className={clsx('w-4 h-4', `text-${sensorInfo.color}-600`)} />
                        <span className="font-medium">{sensor.label}</span>
                      </td>
                      <td className="py-3">
                        <Badge variant={lastCalibrated[sensor.type] ? 'success' : 'secondary'}>
                          {lastCalibrated[sensor.type] ? 'Calibrated' : 'Default'}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-secondary-600 dark:text-secondary-400">
                        {lastCalibrated[sensor.type]
                          ? new Date(lastCalibrated[sensor.type]).toLocaleString()
                          : 'Never'}
                      </td>
                      <td className="py-3 text-sm text-secondary-600 dark:text-secondary-400 font-mono">
                        {Object.entries(calibration[sensor.type]).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => setActiveSensor(sensor.type)}
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                        >
                          Calibrate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function getCalibrationInstructions(type: SensorType): string {
  const instructions: Record<SensorType, string> = {
    water_level: `
      <ol>
        <li>Empty the tank completely (0 cm reference)</li>
        <li>Enter "0" as the known value and click Calibrate</li>
        <li>Fill tank to a known level (e.g., 50 cm)</li>
        <li>Enter "50" as the known value and click Calibrate again</li>
        <li>The system will calculate the slope and offset automatically</li>
      </ol>
    `,
    temperature: `
      <ol>
        <li>Place the sensor in an ice bath (0°C reference)</li>
        <li>Enter "0" as the known value and click Calibrate</li>
        <li>Place the sensor in boiling water (100°C at sea level)</li>
        <li>Enter "100" as the known value and click Calibrate again</li>
        <li>The system will calculate the offset automatically</li>
      </ol>
    `,
    humidity: `
      <ol>
        <li>Place the sensor in a dry environment (0% reference, e.g., with desiccant)</li>
        <li>Enter "0" as the known value and click Calibrate</li>
        <li>Place the sensor in a saturated salt solution (75% reference)</li>
        <li>Enter "75" as the known value and click Calibrate again</li>
        <li>The system will calculate the offset automatically</li>
      </ol>
    `,
    gas: `
      <ol>
        <li>Power on the sensor and let it warm up for 24-48 hours (burn-in period)</li>
        <li>Place in clean air and record the R0 value (resistance in clean air)</li>
        <li>Enter the measured R0 value in the calibration parameters</li>
        <li>Expose to known gas concentration (e.g., 1000 ppm LPG)</li>
        <li>Adjust slope and intercept to match the known concentration</li>
      </ol>
    `,
    battery: `
      <ol>
        <li>Measure the actual battery voltage with a multimeter</li>
        <li>Enter the measured voltage as the known value</li>
        <li>Click Calibrate to adjust the divider ratio</li>
        <li>Verify with another multimeter reading</li>
        <li>The system will calculate the correct divider ratio</li>
      </ol>
    `,
  };
  return instructions[type] || 'No instructions available.';
}

import { useState } from 'react';