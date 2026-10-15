"""
Data Processor - Validation, transformation, aggregation
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from app.models.sensor import SensorReading, SensorType, SensorStatus
from app.models.alert import SensorThreshold, AlertSeverity
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class DataProcessor:
    def __init__(self):
        self.calibration = {
            "water_level": {"slope": 58.0, "offset": -2.5},
            "gas": {"r0": 10.0, "slope": -0.45, "intercept": 1.2},
            "temperature": {"offset": 0.0},
            "humidity": {"offset": 0.0},
            "battery": {"divider_ratio": 11.0, "adc_ref": 5.0, "offset": 0.0},
        }

    def process_reading(self, raw_message: Dict) -> Optional[SensorReading]:
        """Process raw sensor message into validated SensorReading"""
        try:
            sensor_type = raw_message.get("sensor")
            value = raw_message.get("value")
            unit = raw_message.get("unit", "")
            timestamp = raw_message.get("timestamp")

            if not sensor_type or value is None:
                return None

            # Apply calibration
            calibrated_value = self._apply_calibration(sensor_type, value)
            
            # Get thresholds
            thresholds = self._get_thresholds(sensor_type)
            
            # Determine status
            status = self._evaluate_status(calibrated_value, thresholds)
            
            # Convert timestamp
            if isinstance(timestamp, (int, float)):
                dt = datetime.fromtimestamp(timestamp)
            else:
                dt = datetime.now()

            return SensorReading(
                sensor_type=sensor_type,
                value=round(calibrated_value, 2),
                unit=unit,
                timestamp=dt,
                status=status,
                thresholds=thresholds,
            )
        except Exception as e:
            logger.error(f"Error processing reading: {e}")
            return None

    def _apply_calibration(self, sensor_type: str, raw_value: float) -> float:
        """Apply sensor-specific calibration"""
        cal = self.calibration.get(sensor_type, {})
        
        if sensor_type == "water_level":
            slope = cal.get("slope", 58.0)
            offset = cal.get("offset", -2.5)
            return raw_value * slope + offset
        
        elif sensor_type == "temperature":
            offset = cal.get("offset", 0.0)
            return raw_value + offset
        
        elif sensor_type == "humidity":
            offset = cal.get("offset", 0.0)
            return raw_value + offset
        
        elif sensor_type == "gas":
            # MQ-2 gas sensor: Rs/R0 ratio calculation
            r0 = cal.get("r0", 10.0)
            # Simplified: assume raw_value is Rs/R0 ratio
            # ppm = 10^((log10(Rs/R0) - intercept) / slope)
            slope = cal.get("slope", -0.45)
            intercept = cal.get("intercept", 1.2)
            import math
            ratio = raw_value / r0
            if ratio > 0:
                ppm = 10 ** ((math.log10(ratio) - intercept) / slope)
                return ppm
            return 0
        
        elif sensor_type == "battery":
            divider_ratio = cal.get("divider_ratio", 11.0)
            adc_ref = cal.get("adc_ref", 5.0)
            offset = cal.get("offset", 0.0)
            # raw_value is ADC reading (0-1023 for 10-bit ADC)
            voltage = (raw_value / 1023.0) * adc_ref * divider_ratio + offset
            return voltage
        
        return raw_value

    def _get_thresholds(self, sensor_type: str):
        """Get default thresholds for sensor type"""
        defaults = {
            "water_level": {"min": 10, "max": 200},
            "temperature": {"min": 0, "max": 50},
            "humidity": {"min": 20, "max": 80},
            "gas": {"max": 1000},
            "battery": {"min": 3.3, "max": 4.2},
        }
        return defaults.get(sensor_type, {})

    def _evaluate_status(self, value: float, thresholds: Dict) -> SensorStatus:
        """Evaluate sensor status based on thresholds"""
        if not thresholds:
            return SensorStatus.NORMAL
        
        if "min" in thresholds and value < thresholds["min"]:
            return SensorStatus.CRITICAL
        if "max" in thresholds and value > thresholds["max"]:
            return SensorStatus.CRITICAL
        
        # Warning at 80% of threshold
        if "min" in thresholds and value < thresholds["min"] * 1.2:
            return SensorStatus.WARNING
        if "max" in thresholds and value > thresholds["max"] * 0.8:
            return SensorStatus.WARNING
        
        return SensorStatus.NORMAL

    def aggregate_readings(self, readings: List[Dict], interval_seconds: int = 60) -> Dict:
        """Aggregate readings into time intervals"""
        if not readings:
            return {}
        
        # Group by interval
        intervals = {}
        for reading in readings:
            ts = reading.get("timestamp")
            if isinstance(ts, (int, float)):
                interval_start = int(ts // interval_seconds) * interval_seconds
            else:
                continue
            
            sensor_type = reading.get("sensor_type")
            if sensor_type not in intervals:
                intervals[sensor_type] = {}
            
            if interval_start not in intervals[sensor_type]:
                intervals[sensor_type][interval_start] = []
            
            intervals[sensor_type][interval_start].append(reading.get("value", 0))
        
        # Calculate aggregates
        result = {}
        for sensor_type, intervals_data in intervals.items():
            result[sensor_type] = []
            for interval_start, values in sorted(intervals_data.items()):
                if values:
                    result[sensor_type].append({
                        "timestamp": datetime.fromtimestamp(interval_start).isoformat(),
                        "min": min(values),
                        "max": max(values),
                        "avg": sum(values) / len(values),
                        "count": len(values),
                    })
        
        return result


import math