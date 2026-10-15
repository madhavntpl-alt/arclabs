"""
WebSocket Manager - Connection manager, broadcast, heartbeat
"""

from typing import Dict, Set, Any
from app.websocket.manager import ConnectionManager as BaseConnectionManager
from app.websocket.messages import (
    create_sensor_reading_message,
    create_device_status_message,
    create_alert_message,
    create_event_message,
    create_command_ack_message,
    create_heartbeat_message,
)
from app.models.sensor import SensorReading, SensorType
from app.models.device import DeviceStatus
from app.models.alert import Alert, AlertSeverity
from app.models.event import EventLog, EventType
from app.core.logging import get_logger

logger = get_logger(__name__)


class WebSocketManager:
    def __init__(self):
        self.manager = BaseConnectionManager()
        self.heartbeat_interval = 30  # seconds
        self.heartbeat_task = None
        self.running = False

    async def start(self):
        self.running = True
        self.heartbeat_task = asyncio.create_task(self._heartbeat_loop())
        logger.info("WebSocket manager started")

    async def stop(self):
        self.running = False
        if self.heartbeat_task:
            self.heartbeat_task.cancel()
            try:
                await self.heartbeat_task
            except asyncio.CancelledError:
                pass
        logger.info("WebSocket manager stopped")

    async def broadcast_sensor_reading(self, reading):
        message = create_sensor_reading_message(
            sensor_type=reading.sensor_type,
            value=reading.value,
            unit=reading.unit,
            timestamp=reading.timestamp,
            status=reading.status,
            device_id=reading.device_id,
        )
        await self.manager.broadcast("sensor_readings", message)

    async def broadcast_device_status(self, device_id: str, status: str, uptime: int, free_heap: int, firmware_version: str = None):
        message = create_device_status_message(
            device_id=device_id,
            status=status,
            uptime_seconds=uptime,
            free_heap=free_heap,
            firmware_version=firmware_version,
        )
        await self.manager.broadcast("device_status", message)

    async def broadcast_alert(self, alert):
        message = create_alert_message(
            alert_id=alert.id,
            severity=alert.severity.value if hasattr(alert.severity, 'value') else alert.severity,
            message=alert.message,
            sensor=alert.sensor_type.value if hasattr(alert.sensor_type, 'value') else alert.sensor_type,
            value=alert.value,
            threshold=alert.threshold,
            timestamp=alert.created_at,
        )
        await self.manager.broadcast("alerts", message)

    async def broadcast_event(self, event):
        message = create_event_message({
            "id": event.id,
            "event_type": event.event_type,
            "severity": event.severity,
            "device_id": event.device_id,
            "message": event.message,
            "metadata": event.metadata,
            "timestamp": event.timestamp.isoformat(),
            "correlation_id": event.correlation_id,
        })
        await self.manager.broadcast("events", message)

    async def send_command_ack(self, connection, command_id: str, success: bool, message: str = ""):
        message = create_command_ack_message(command_id, success, message)
        await connection.send(message)

    async def _heartbeat_loop(self):
        while True:
            await asyncio.sleep(30)
            if self.manager.get_connection_count() > 0:
                message = create_heartbeat_message()
                await self.manager.broadcast_to_all(message)

    def get_stats(self) -> dict:
        return {
            "connections": self.manager.get_connection_count(),
            "topics": {
                topic: len(subscribers)
                for topic, subscribers in self.manager.topic_subscriptions.items()
            },
        }


import asyncio