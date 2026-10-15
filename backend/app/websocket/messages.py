"""
Outbound WebSocket message types
"""

from typing import Dict, Any, Optional
from datetime import datetime
from enum import Enum


class WSMessageType(str, Enum):
    SENSOR_READING = "sensor_reading"
    DEVICE_STATUS = "device_status"
    ALERT = "alert"
    EVENT = "event"
    COMMAND_ACK = "command_ack"
    HEARTBEAT = "heartbeat"


def create_sensor_reading_message(
    sensor_type: str,
    value: float,
    unit: str,
    timestamp: Optional[datetime] = None,
    status: str = "normal",
    device_id: Optional[str] = None
) -> Dict[str, Any]:
    return {
        "type": WSMessageType.SENSOR_READING,
        "payload": {
            "sensor_type": sensor_type,
            "value": value,
            "unit": unit,
            "timestamp": (timestamp or datetime.now()).isoformat(),
            "status": status,
            "device_id": device_id,
        }
    }


def create_device_status_message(
    device_id: str,
    status: str,
    uptime_seconds: int,
    free_heap: int,
    firmware_version: Optional[str] = None
) -> Dict[str, Any]:
    return {
        "type": WSMessageType.DEVICE_STATUS,
        "payload": {
            "device_id": device_id,
            "status": status,
            "uptime_seconds": uptime_seconds,
            "free_heap": free_heap,
            "firmware_version": firmware_version,
        }
    }


def create_alert_message(
    alert_id: str,
    severity: str,
    message: str,
    sensor: Optional[str] = None,
    value: Optional[float] = None,
    threshold: Optional[float] = None,
    timestamp: Optional[datetime] = None
) -> Dict[str, Any]:
    return {
        "type": WSMessageType.ALERT,
        "payload": {
            "id": alert_id,
            "severity": severity,
            "message": message,
            "sensor": sensor,
            "value": value,
            "threshold": threshold,
            "timestamp": (timestamp or datetime.now()).isoformat(),
        }
    }


def create_event_message(event: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "type": WSMessageType.EVENT,
        "payload": event
    }


def create_command_ack_message(
    command_id: str,
    success: bool,
    message: str = ""
) -> Dict[str, Any]:
    return {
        "type": WSMessageType.COMMAND_ACK,
        "payload": {
            "command_id": command_id,
            "success": success,
            "message": message,
        }
    }


def create_heartbeat_message(
    timestamp: Optional[datetime] = None,
    server_time: Optional[datetime] = None
) -> Dict[str, Any]:
    return {
        "type": WSMessageType.HEARTBEAT,
        "payload": {
            "timestamp": (timestamp or datetime.now()).isoformat(),
            "server_time": (server_time or datetime.now()).isoformat(),
        }
    }