"""
Unit tests for Alert Engine
"""

import pytest
from unittest.mock import MagicMock
from datetime import datetime
from app.services.alert_engine import AlertEngine
from app.models.alert import AlertSeverity, AlertStatus
from app.models.sensor import SensorType, SensorReading


class TestAlertEngine:
    @pytest.fixture
    def alert_engine(self):
        return AlertEngine()

    def test_evaluate_reading_normal(self, alert_engine):
        reading = MagicMock()
        reading.sensor_type = "temperature"
        reading.value = 25.0
        reading.unit = "°C"
        reading.device_id = "device_1"
        reading.timestamp = datetime.now()
        
        alerts = alert_engine.evaluate_reading(reading)
        assert len(alerts) == 0

    def test_evaluate_reading_threshold_exceeded(self, alert_engine):
        reading = MagicMock()
        reading.sensor_type = "temperature"
        reading.value = 60.0  # Above max of 50
        reading.unit = "°C"
        reading.device_id = "device_1"
        reading.timestamp = datetime.now()
        
        alerts = alert_engine.evaluate_reading(reading)
        assert len(alerts) == 1
        assert alerts[0].severity == "critical"
        assert "temperature" in alerts[0].message.lower()

    def test_evaluate_reading_warning(self, alert_engine):
        reading = MagicMock()
        reading.sensor_type = "temperature"
        reading.value = 48.0  # Close to max of 50
        reading.unit = "°C"
        reading.device_id = "device_1"
        reading.timestamp = datetime.now()
        
        alerts = alert_engine.evaluate_reading(reading)
        # Should be warning (80% of threshold)
        assert len(alerts) == 1
        assert alerts[0].severity in ["warning", "critical"]

    def test_acknowledge_alert(self, alert_engine):
        # First create an alert
        reading = MagicMock()
        reading.sensor_type = "temperature"
        reading.value = 60.0
        reading.unit = "°C"
        reading.device_id = "device_1"
        reading.timestamp = datetime.now()
        
        alerts = alert_engine.evaluate_reading(reading)
        alert_id = alerts[0].id
        
        # Acknowledge
        result = alert_engine.acknowledge_alert(alert_id, "test_user")
        assert result is True
        
        # Check alert status
        alert = alert_engine.active_alerts[alert_id]
        assert alert.status.value == "acknowledged"

    def test_resolve_alert(self, alert_engine):
        reading = MagicMock()
        reading.sensor_type = "temperature"
        reading.value = 60.0
        reading.device_id = "device_1"
        reading.timestamp = datetime.now()
        
        alerts = alert_engine.evaluate_reading(reading)
        alert_id = alerts[0].id
        
        result = alert_engine.resolve_alert(alert_id, "test_user")
        assert result is True
        
        alert = alert_engine.active_alerts[alert_id]
        assert alert.status.value == "resolved"

    def test_get_active_alerts(self, alert_engine):
        reading = MagicMock()
        reading.sensor_type = "temperature"
        reading.value = 60.0
        reading.device_id = "device_1"
        reading.timestamp = datetime.now()
        
        alert_engine.evaluate_reading(reading)
        
        active = alert_engine.get_active_alerts()
        assert len(active) == 1
        
        active_device = alert_engine.get_active_alerts(device_id="device_1")
        assert len(active_device) == 1
        
        active_other = alert_engine.get_active_alerts(device_id="device_2")
        assert len(active_other) == 0