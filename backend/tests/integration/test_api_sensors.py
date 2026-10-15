"""
Integration tests for API endpoints
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch


class TestSensorsAPI:
    def test_get_sensors(self, client):
        response = client.get("/api/v1/sensors")
        assert response.status_code == 200
        data = response.json()
        assert "sensors" in data
        assert "device_status" in data
        assert len(data["sensors"]) == 5

    def test_get_sensor_history(self, client):
        response = client.get("/api/v1/sensors/history?sensor_type=temperature&interval=1h")
        assert response.status_code == 200
        data = response.json()
        assert "sensor_type" in data
        assert "data" in data


class TestDevicesAPI:
    def test_get_devices(self, client):
        response = client.get("/api/v1/devices")
        assert response.status_code == 200
        data = response.json()
        assert "devices" in data
        assert len(data["devices"]) >= 1

    def test_get_device_not_found(self, client):
        response = client.get("/api/v1/devices/nonexistent")
        assert response.status_code == 404


class TestControlAPI:
    def test_control_pump_on(self, client):
        response = client.post(
            "/api/v1/control/pump",
            json={"action": "on", "duration_seconds": 30}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["action"] == "on"

    def test_control_pump_off(self, client):
        response = client.post(
            "/api/v1/control/pump",
            json={"action": "off"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["action"] == "off"

    def test_control_pump_on_without_duration(self, client):
        response = client.post(
            "/api/v1/control/pump",
            json={"action": "on"}
        )
        assert response.status_code == 400

    def test_control_relay(self, client):
        response = client.post(
            "/api/v1/control/relay",
            json={"relay": 1, "state": True}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["relay"] == 1
        assert data["state"] is True

    def test_emergency_stop(self, client):
        response = client.post("/api/v1/control/emergency_stop")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestConfigAPI:
    def test_get_thresholds(self, client):
        response = client.get("/api/v1/config/thresholds")
        assert response.status_code == 200
        data = response.json()
        assert "water_level_min_cm" in data

    def test_update_thresholds(self, client):
        response = client.post(
            "/api/v1/config/thresholds",
            json={
                "water_level_min_cm": 15,
                "water_level_max_cm": 180,
                "temp_min_c": 5,
                "temp_max_c": 40,
                "humidity_min_pct": 30,
                "humidity_max_pct": 70,
                "gas_threshold_ppm": 800,
                "battery_min_v": 3.5,
                "battery_max_v": 4.1,
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestRulesAPI:
    def test_list_rules(self, client):
        response = client.get("/api/v1/rules")
        assert response.status_code == 200
        data = response.json()
        assert "rules" in data
        assert "total" in data

    def test_create_rule(self, client):
        response = client.post(
            "/api/v1/rules",
            json={
                "name": "Test Rule",
                "enabled": True,
                "priority": 10,
                "conditions": [
                    {"sensor": "temperature", "operator": ">", "value": 30, "duration_seconds": 60}
                ],
                "actions": [
                    {"type": "notify", "params": {"message": "High temperature!", "severity": "warning"}}
                ],
                "logic": "AND",
                "cooldown_seconds": 300,
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["name"] == "Test Rule"

    def test_get_rule_not_found(self, client):
        response = client.get("/api/v1/rules/nonexistent")
        assert response.status_code == 404

    def test_test_rule(self, client):
        response = client.post("/api/v1/rules/rule_1/test")
        assert response.status_code == 200
        data = response.json()
        assert "would_trigger" in data


class TestEventsAPI:
    def test_get_events(self, client):
        response = client.get("/api/v1/events")
        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        assert "total" in data

    def test_get_event_stats(self, client):
        response = client.get("/api/v1/events/stats")
        assert response.status_code == 200
        data = response.json()
        assert "by_type" in data
        assert "by_severity" in data


class TestHealthAPI:
    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "checks" in data

    def test_serial_health(self, client):
        response = client.get("/health/serial")
        assert response.status_code == 200
        data = response.json()
        assert "connected" in data
        assert "port" in data