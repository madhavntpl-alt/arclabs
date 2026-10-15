"""
Device models
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum
from app.models.base import BaseSchema


class DeviceStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    ERROR = "error"
    UPDATING = "updating"


class DeviceType(str, Enum):
    CATALYST_MK1 = "catalyst_mk1"
    CATALYST_MK2 = "catalyst_mk2"
    GENERIC = "generic"


class ActuatorType(str, Enum):
    PUMP = "pump"
    VALVE = "valve"
    RELAY_1 = "relay_1"
    RELAY_2 = "relay_2"
    FAN = "fan"
    HEATER = "heater"
    LIGHT = "light"


class ActuatorStatus(BaseModel):
    type: ActuatorType
    state: bool
    last_changed: datetime
    auto_controlled: bool = False


class DeviceMetrics(BaseModel):
    uptime_seconds: int
    free_heap: int
    messages_received: int
    messages_sent: int
    errors: int
    last_error: Optional[str] = None
    wifi_rssi: Optional[int] = None
    cpu_temperature: Optional[float] = None


class DeviceConfig(BaseModel):
    serial_port: str
    baudrate: int = 115200
    sensors: List[str] = []
    actuators: List[ActuatorType] = []
    thresholds: dict = {}
    automation_enabled: bool = True
    firmware_update_url: Optional[str] = None


class Device(BaseModel):
    id: str
    name: str
    type: DeviceType
    status: DeviceStatus
    last_seen: datetime
    firmware_version: str
    hardware_version: str
    sensors: List[str] = []
    actuators: List[ActuatorType] = []
    config: DeviceConfig
    metrics: Optional[DeviceMetrics] = None
    created_at: datetime
    updated_at: datetime


class DeviceSummary(BaseModel):
    id: str
    name: str
    type: DeviceType
    status: DeviceStatus
    last_seen: datetime
    firmware_version: str
    sensor_count: int
    actuator_count: int


class DeviceRegistration(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: DeviceType
    hardware_version: str
    serial_port: str
    baudrate: int = 115200
    sensors: List[str] = []
    actuators: List[ActuatorType] = []