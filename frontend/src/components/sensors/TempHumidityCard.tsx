import { SensorCard } from './SensorCard';
import { SensorType } from '../../constants/sensor-types';

interface TempHumidityCardProps {
  temperature: number | null;
  humidity: number | null;
  tempStatus?: 'normal' | 'warning' | 'critical' | 'unknown';
  humidityStatus?: 'normal' | 'warning' | 'critical' | 'unknown';
  tempThreshold?: { min?: number; max?: number };
  humidityThreshold?: { min?: number; max?: number };
  tempTrend?: 'up' | 'down' | 'stable';
  humidityTrend?: 'up' | 'down' | 'stable';
  onClick?: () => void;
  className?: string;
}

export function TempHumidityCard({
  temperature,
  humidity,
  tempStatus = 'unknown',
  humidityStatus = 'unknown',
  tempThreshold,
  humidityThreshold,
  tempTrend = 'stable',
  humidityTrend = 'stable',
  onClick,
  className,
}: TempHumidityCardProps) {
  return (
    <div className={className}>
      <SensorCard
        sensorType={SensorType.TEMPERATURE}
        label="Temperature"
        value={temperature}
        unit="°C"
        status={tempStatus}
        threshold={tempThreshold}
        trend={tempTrend}
        onClick={onClick}
      />
      <SensorCard
        sensorType={SensorType.HUMIDITY}
        label="Humidity"
        value={humidity}
        unit="%"
        status={humidityStatus}
        threshold={humidityThreshold}
        trend={humidityTrend}
        onClick={onClick}
      />
    </div>
  );
}

export default TempHumidityCard;