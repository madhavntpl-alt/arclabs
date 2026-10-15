import { SensorCard } from './SensorCard';
import { SensorType } from '../../constants/sensor-types';

interface BatteryCardProps {
  value: number | null;
  unit?: string;
  status?: 'normal' | 'warning' | 'critical' | 'unknown';
  threshold?: { min?: number; max?: number };
  charging?: boolean;
  onClick?: () => void;
  className?: string;
}

export function BatteryCard({
  value,
  unit,
  status = 'unknown',
  threshold,
  charging = false,
  onClick,
  className,
}: BatteryCardProps) {
  const batteryLevel = value !== null ? Math.min(Math.max((value - 3.3) / (4.2 - 3.3) * 100, 0), 100) : 0;

  return (
    <SensorCard
      sensorType={SensorType.BATTERY}
      label="Battery"
      value={value}
      unit={unit || 'V'}
      status={status}
      threshold={threshold}
      onClick={onClick}
      className={className}
    >
      {/* Battery visual indicator */}
      <div className="absolute top-4 right-4">
        <div className="relative w-14 h-8">
          <div
            className="absolute inset-0 border-2 rounded-lg"
            style={{ borderColor: status !== 'normal' ? (status === 'critical' ? '#ef4444' : '#f59e0b') : '#22c55e' }}
          />
          <div className="absolute right-0 top-2 w-2 h-4 bg-secondary-300 dark:bg-secondary-600 rounded-tr rounded-br" />
          <div
            className="absolute inset-1 rounded bg-secondary-200 dark:bg-secondary-700"
            style={{
              width: `${batteryLevel}%`,
              backgroundColor: status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#22c55e',
              transition: 'width 0.5s ease-out',
            }}
          />
        </div>
        {charging && (
          <svg className="absolute -top-2 right-1 w-5 h-5 text-primary-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )}
      </div>
    </SensorCard>
  );
}

export default BatteryCard;