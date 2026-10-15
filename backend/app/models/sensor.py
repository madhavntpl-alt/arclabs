"""
Sensor models
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum
from app.models.base import BaseSchema


class SensorType(str, Enum):
    WATER_LEVEL = "water_level"
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    GAS = "gas"
    BATTERY = "battery"


class SensorStatus(str, Enum):
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"


class SensorThresholds(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None


class SensorReading(BaseSchema):
    sensor_type: SensorType
    value: float
    unit: str
    timestamp: datetime
    status: SensorStatus = SensorStatus.UNKNOWN
    thresholds: Optional[SensorThresholds] = None
    device_id: Optional[str] = None
    metadata: Optional[dict] = None


class SensorHistoryPoint(BaseSchema):
    timestamp: datetime
    min: float
    max: float
    avg: float
    count: int


class SensorHistory(BaseSchema):
    sensor_type: SensorType
    unit: str
    interval: str
    data: list[SensorHistoryPoint]


class SensorCalibration(BaseSchema):
    slope: Optional[float] = None
    offset: Optional[float] = None
    r0: Optional[float] = None
    intercept: Optional[float] = None
    divider_ratio: Optional[float] = None
    adc_ref: Optional[float] = None
    last_calibrated: Optional[datetime] = None
    calibrated_by: Optional[str] = None


class SensorConfig(BaseSchema):
    type: SensorType
    enabled: bool = True
    calibration: Optional[SensorCalibration] = None
    thresholds: Optional[SensorThresholds] = None
    sampling_rate_hz: Optional[int] = None