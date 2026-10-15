import { SensorCard } from './SensorCard';
import { SensorType } from '../../constants/sensor-types';

interface WaterLevelCardProps {
  value: number | null;
  unit?: string;
  status?: 'normal' | 'warning' | 'critical' | 'unknown';
  threshold?: { min?: number; max?: number };
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  onClick?: () => void;
  className?: string;
}

export function WaterLevelCard(props: WaterLevelCardProps) {
  return (
    <SensorCard
      sensorType={SensorType.WATER_LEVEL}
      label="Water Level"
      {...props}
    />
  );
}

export default WaterLevelCard;