"""
Alert Engine - Threshold evaluation, alert lifecycle
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from app.models.alert import Alert, AlertSeverity, AlertStatus, SensorThreshold, ThresholdEvaluationResult, evaluate_threshold
from app.models.sensor import SensorReading, SensorType
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class AlertEngine:
    def __init__(self):
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_history: List[Alert] = []
        self.max_history = 1000
        
        # Default thresholds from config
        self.thresholds = {
            SensorType.WATER_LEVEL: SensorThreshold(
                sensor_type=SensorType.WATER_LEVEL,
                min=settings.WATER_LEVEL_MIN_CM,
                max=settings.WATER_LEVEL_MAX_CM,
                severity=AlertSeverity.CRITICAL,
                enabled=True,
            ),
            SensorType.TEMPERATURE: SensorThreshold(
                sensor_type=SensorType.TEMPERATURE,
                min=settings.TEMP_MIN_C,
                max=settings.TEMP_MAX_C,
                severity=AlertSeverity.CRITICAL,
                enabled=True,
            ),
            SensorType.HUMIDITY: SensorThreshold(
                sensor_type=SensorType.HUMIDITY,
                min=settings.HUMIDITY_MIN_PCT,
                max=settings.HUMIDITY_MAX_PCT,
                severity=AlertSeverity.CRITICAL,
                enabled=True,
            ),
            SensorType.GAS: SensorThreshold(
                sensor_type=SensorType.GAS,
                max=settings.GAS_THRESHOLD_PPM,
                severity=AlertSeverity.CRITICAL,
                enabled=True,
            ),
            SensorType.BATTERY: SensorThreshold(
                sensor_type=SensorType.BATTERY,
                min=settings.BATTERY_MIN_V,
                max=settings.BATTERY_MAX_V,
                severity=AlertSeverity.CRITICAL,
                enabled=True,
            ),
        }

    def evaluate_reading(self, reading) -> List[Alert]:
        """Evaluate a sensor reading against thresholds"""
        new_alerts = []
        
        if reading.sensor_type in self.thresholds:
            threshold = self.thresholds[reading.sensor_type]
            result = evaluate_threshold(reading.value, threshold)
            
            if result.exceeded:
                alert = self._create_alert(reading, result)
                if alert:
                    new_alerts.append(alert)
            else:
                # Check if we need to clear an existing alert
                self._clear_alert(reading.sensor_type)
        
        return new_alerts

    def _create_alert(self, reading, result: ThresholdEvaluationResult) -> Optional[Alert]:
        """Create new alert if one doesn't already exist"""
        alert_key = f"{reading.device_id}_{reading.sensor_type}_{result.severity}"
        
        # Check if alert already exists
        if alert_key in self.active_alerts:
            existing = self.active_alerts[alert_key]
            if existing.status == AlertStatus.ACTIVE:
                # Update existing alert with new value
                existing.value = reading.value
                existing.threshold = result.thresholds.max or result.thresholds.min
                existing.metadata = {**existing.metadata, "last_value": reading.value}
                return None
        
        # Create new alert
        alert = Alert(
            id=f"alert_{datetime.now().timestamp()}_{reading.sensor_type}",
            device_id=reading.device_id or "unknown",
            severity=result.severity,
            status=AlertStatus.ACTIVE,
            message=result.message,
            sensor_type=reading.sensor_type,
            value=reading.value,
            threshold=result.thresholds.max or result.thresholds.min,
            unit=reading.unit,
            metadata={"reading_timestamp": reading.timestamp.isoformat()},
            created_at=datetime.now(),
        )
        
        self.active_alerts[alert_key] = alert
        self.alert_history.append(alert)
        if len(self.alert_history) > self.max_history:
            self.alert_history = self.alert_history[-self.max_history:]
        
        logger.warning(f"Alert created: {alert.message}")
        return alert

    def _clear_alert(self, sensor_type: SensorType):
        """Clear active alerts for sensor type"""
        keys_to_clear = [
            k for k, a in self.active_alerts.items()
            if a.sensor_type == sensor_type and a.status == AlertStatus.ACTIVE
        ]
        
        for key in keys_to_clear:
            alert = self.active_alerts[key]
            alert.status = AlertStatus.RESOLVED
            alert.resolved_at = datetime.now()
            logger.info(f"Alert cleared: {alert.message}")

    def acknowledge_alert(self, alert_id: str, acknowledged_by: str) -> bool:
        """Acknowledge an active alert"""
        for alert in self.active_alerts.values():
            if alert.id == alert_id:
                alert.status = AlertStatus.ACKNOWLEDGED
                alert.acknowledged_at = datetime.now()
                alert.acknowledged_by = acknowledged_by
                logger.info(f"Alert acknowledged: {alert_id} by {acknowledged_by}")
                return True
        return False

    def resolve_alert(self, alert_id: str, resolved_by: str) -> bool:
        """Resolve an active alert"""
        for alert in self.active_alerts.values():
            if alert.id == alert_id:
                alert.status = AlertStatus.RESOLVED
                alert.resolved_at = datetime.now()
                alert.resolved_by = resolved_by
                logger.info(f"Alert resolved: {alert_id} by {resolved_by}")
                return True
        return False

    def get_active_alerts(self, device_id: Optional[str] = None) -> List[Alert]:
        """Get all active alerts"""
        alerts = [a for a in self.active_alerts.values() if a.status == AlertStatus.ACTIVE]
        if device_id:
            alerts = [a for a in alerts if a.device_id == device_id]
        return alerts

    def get_alert_history(self, limit: int = 100) -> List:
        return self.alert_history[-limit:]

    def update_thresholds(self, sensor_type: SensorType, min_val: Optional[float], max_val: Optional[float]):
        """Update threshold configuration"""
        if sensor_type in self.thresholds:
            if min_val is not None:
                self.thresholds[sensor_type].min = min_val
            if max_val is not None:
                self.thresholds[sensor_type].max = max_val
            logger.info(f"Updated thresholds for {sensor_type}: min={min_val}, max={max_val}")


from datetime import datetime
from typing import List, Optional