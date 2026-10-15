"""
Alert models
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum
from app.models.base import BaseSchema


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class AlertStatus(str, Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    SUPPRESSED = "suppressed"


class SensorType(str, Enum):
    WATER_LEVEL = "water_level"
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    GAS = "gas"
    BATTERY = "battery"


class Alert(BaseSchema):
    id: str
    device_id: str
    rule_id: Optional[str] = None
    severity: AlertSeverity
    status: AlertStatus = AlertStatus.ACTIVE
    message: str
    sensor_type: Optional[SensorType] = None
    value: Optional[float] = None
    threshold: Optional[float] = None
    unit: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None


class ThresholdConfig(BaseModel):
    water_level_min_cm: float = Field(..., ge=0, le=300)
    water_level_max_cm: float = Field(..., ge=0, le=300)
    temp_min_c: float = Field(..., ge=-40, le=80)
    temp_max_c: float = Field(..., ge=-40, le=80)
    humidity_min_pct: float = Field(..., ge=0, le=100)
    humidity_max_pct: float = Field(..., ge=0, le=100)
    gas_threshold_ppm: float = Field(..., ge=0, le=10000)
    battery_min_v: float = Field(..., ge=0, le=5)
    battery_max_v: float = Field(..., ge=0, le=5)


class SensorThreshold(BaseModel):
    sensor_type: SensorType
    min: Optional[float] = None
    max: Optional[float] = None
    severity: AlertSeverity
    enabled: bool = True


class ThresholdEvaluationResult(BaseModel):
    sensor_type: SensorType
    value: float
    thresholds: SensorThreshold
    exceeded: bool
    severity: AlertSeverity
    message: str


class AlertRule(BaseSchema):
    id: str
    name: str
    description: Optional[str] = None
    enabled: bool = True
    severity: AlertSeverity
    conditions: List[dict] = []
    actions: List[dict] = []
    cooldown_seconds: int = Field(default=60, ge=0, le=86400)
    created_at: datetime
    updated_at: datetime


class AlertNotification(BaseSchema):
    alert_id: str
    channel: str
    recipient: str
    subject: str
    body: str
    sent_at: Optional[datetime] = None
    delivery_status: str = "pending"
    error_message: Optional[str] = None