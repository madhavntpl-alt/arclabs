"""
Event models
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum
from app.models.base import BaseSchema


class EventType(str, Enum):
    SENSOR_READING = "sensor_reading"
    THRESHOLD_EXCEEDED = "threshold_exceeded"
    THRESHOLD_CLEARED = "threshold_cleared"
    AUTOMATION_TRIGGERED = "automation_triggered"
    COMMAND_SENT = "command_sent"
    COMMAND_ACK = "command_ack"
    COMMAND_FAILED = "command_failed"
    DEVICE_CONNECTED = "device_connected"
    DEVICE_DISCONNECTED = "device_disconnected"
    DEVICE_ERROR = "device_error"
    FIRMWARE_UPDATE = "firmware_update"
    CALIBRATION = "calibration"
    CONFIG_CHANGED = "config_changed"
    USER_ACTION = "user_action"
    SYSTEM_STARTUP = "system_startup"
    SYSTEM_SHUTDOWN = "system_shutdown"
    ERROR = "error"


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class EventLog(BaseSchema):
    id: str
    event_type: EventType
    severity: AlertSeverity
    device_id: str
    message: str
    metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime
    correlation_id: Optional[str] = None


class EventQuery(BaseModel):
    event_type: Optional[EventType] = None
    event_types: Optional[List[EventType]] = None
    severity: Optional[AlertSeverity] = None
    severities: Optional[List[AlertSeverity]] = None
    device_id: Optional[str] = None
    device_ids: Optional[List[str]] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    limit: int = Field(default=100, ge=1, le=1000)
    offset: int = Field(default=0, ge=0)
    sort: str = "-timestamp"
    search: Optional[str] = None


class PaginatedEvents(BaseModel):
    events: List[EventLog]
    total: int
    limit: int
    offset: int
    has_more: bool


class EventStats(BaseModel):
    by_type: Dict[str, int]
    by_severity: Dict[str, int]
    by_device: Dict[str, int]
    total: int
    time_range: Dict[str, str]


from typing import List