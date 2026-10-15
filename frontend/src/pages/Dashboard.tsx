'use client';

import { motion } from 'motion/react';
import { useSensorStore } from '../../store/sensorStore';
import { useDeviceStore } from '../../store/deviceStore';
import { useUIStore } from '../../store/uiStore';
import { WaterLevelCard } from '../../components/sensors/WaterLevelCard';
import { TempHumidityCard } from '../../components/sensors/TempHumidityCard';
import { GasCard } from '../../components/sensors/GasCard';
import { BatteryCard } from '../../components/sensors/BatteryCard';
import { SensorGraph } from '../../components/graphs/SensorGraph';
import { TimeRangeSelector } from '../../components/graphs/TimeRangeSelector';
import { Card } from '../../components/ui/Card';
import { clsx } from 'clsx';

const SENSOR_TYPES = ['water_level', 'temperature', 'humidity', 'gas', 'battery'] as const;

export function Dashboard() {
  const { readings, getReading, getHistory } = useSensorStore();
  const { activeDevice } = useDeviceStore();
  const { sidebarCollapsed } = useUIStore();

  const [timeRange, setTimeRange] = useState('24h');
  const [chartInterval, setChartInterval] = useState('15m');

  const waterLevel = getReading('water_level');
  const temperature = getReading('temperature');
  const humidity = getReading('humidity');
  const gas = getReading('gas');
  const battery = getReading('battery');

  const waterHistory = getHistory('water_level', 100);
  const tempHistory = getHistory('temperature', 100);
  const humidityHistory = getHistory('humidity', 100);
  const gasHistory = getHistory('gas', 100);
  const batteryHistory = getHistory('battery', 100);

  return (
    <div className={clsx('space-y-6', sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64')}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Dashboard</h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Real-time monitoring overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TimeRangeSelector
            value={timeRange}
            onChange={(value, interval) => {
              setTimeRange(value);
              setChartInterval(interval);
            }}
          />
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <WaterLevelCard
          value={waterLevel?.value ?? null}
          status={waterLevel?.status ?? 'unknown'}
          threshold={waterLevel?.thresholds}
          trend="stable"
        />
        <TempHumidityCard
          temperature={temperature?.value ?? null}
          humidity={humidity?.value ?? null}
          tempStatus={temperature?.status ?? 'unknown'}
          humidityStatus={humidity?.status ?? 'unknown'}
        />
        <GasCard
          value={gas?.value ?? null}
          status={gas?.status ?? 'unknown'}
          threshold={gas?.thresholds}
        />
        <BatteryCard
          value={battery?.value ?? null}
          status={battery?.status ?? 'unknown'}
          threshold={battery?.thresholds}
          charging={false}
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card>
          <SensorGraph
            data={waterHistory.map(r => ({ timestamp: r.timestamp, value: r.value }))}
            sensorType="water_level"
            height={300}
            threshold={{ min: 10, max: 200 }}
          />
        </Card>
        <Card>
          <SensorGraph
            data={tempHistory.map(r => ({ timestamp: r.timestamp, value: r.value }))}
            sensorType="temperature"
            height={300}
            threshold={{ min: 0, max: 50 }}
          />
        </Card>
        <Card>
          <SensorGraph
            data={humidityHistory.map(r => ({ timestamp: r.timestamp, value: r.value }))}
            sensorType="humidity"
            height={300}
            threshold={{ min: 20, max: 80 }}
          />
        </Card>
        <Card>
          <SensorGraph
            data={gasHistory.map(r => ({ timestamp: r.timestamp, value: r.value }))}
            sensorType="gas"
            height={300}
            threshold={{ max: 1000 }}
          />
        </Card>
      </motion.div>

      {/* Battery Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <SensorGraph
            data={batteryHistory.map(r => ({ timestamp: r.timestamp, value: r.value }))}
            sensorType="battery"
            height={250}
            threshold={{ min: 3.3, max: 4.2 }}
          />
        </Card>
      </motion.div>

      {/* Device Status */}
      {activeDevice && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">{activeDevice.name}</h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {activeDevice.type} • Firmware {activeDevice.firmware_version}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success-500" />
                  Online
                </span>
                <span>Uptime: {formatUptime(activeDevice.metrics?.uptime_seconds || 0)}</span>
                <span>Free Heap: {formatBytes(activeDevice.metrics?.free_heap || 0)}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// Helper functions
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

import { useState } from 'react';
import { Wifi } from 'lucide-react';