import { SensorCard } from './SensorCard';
import { SensorType } from '../../constants/sensor-types';

interface GasCardProps {
  value: number | null;
  unit?: string;
  status?: 'normal' | 'warning' | 'critical' | 'unknown';
  threshold?: { min?: number; max?: number };
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  onClick?: () => void;
  className?: string;
}

export function GasCard(props: GasCardProps) {
  return (
    <SensorCard
      sensorType={SensorType.GAS}
      label="Gas (Air Quality)"
      {...props}
    />
  );
}

export default GasCard;