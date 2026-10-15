"""
Pydantic Validation Models
Backend validation models shared with frontend via shared package
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator, model_validator
from typing_extensions import Annotated

# ============================================================================
# Enums
# ============================================================================

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

class AutomationOperator(str, Enum):
    LT = "<"
    LTE = "<="
    GT = ">"
    GTE = ">="
    EQ = "=="
    NEQ = "!="
    BETWEEN = "between"
    OUTSIDE = "outside"

class AutomationConditionType(str, Enum):
    SENSOR = "sensor"
    TIME = "time"
    STATE = "state"
    EXPRESSION = "expression"

class AutomationActionType(str, Enum):
    ACTUATOR_SET = "actuator_set"
    ACTUATOR_TOGGLE = "actuator_toggle"
    PUMP_ON = "pump_on"
    PUMP_OFF = "pump_off"
    NOTIFY = "notify"
    LOG = "log"
    WEBHOOK = "webhook"
    SET_THRESHOLD = "set_threshold"
    ENABLE_RULE = "enable_rule"
    DISABLE_RULE = "disable_rule"

class AutomationLogic(str, Enum):
    AND = "AND"
    OR = "OR"

class CommandType(str, Enum):
    PUMP_ON = "pump_on"
    PUMP_OFF = "pump_off"
    RELAY_SET = "relay_set"
    VALVE_SET = "valve_set"
    CALIBRATE = "calibrate"
    RESET = "reset"
    GET_STATUS = "get_status"
    SET_THRESHOLD = "set_threshold"
    ENABLE_AUTOMATION = "enable_automation"
    DISABLE_AUTOMATION = "disable_automation"
    EMERGENCY_STOP = "emergency_stop"

# ============================================================================
# Sensor Models
# ============================================================================

class SensorThresholds(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None

class SensorReading(BaseModel):
    sensor_type: SensorType
    value: float
    unit: str
    timestamp: datetime
    status: SensorStatus = SensorStatus.UNKNOWN
    thresholds: Optional[SensorThresholds] = None
    device_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    @field_validator('timestamp', mode='before')
    @classmethod
    def parse_timestamp(cls, v: Union[str, datetime]) -> datetime:
        if isinstance(v, str):
            return datetime.fromisoformat(v.replace('Z', '+00:00'))
        return v

class SensorHistoryPoint(BaseModel):
    timestamp: datetime
    min: float
    max: float
    avg: float
    count: int

class SensorHistory(BaseModel):
    sensor_type: SensorType
    unit: str
    interval: str
    data: List[SensorHistoryPoint]

class SensorConfig(BaseModel):
    type: SensorType
    enabled: bool = True
    calibration: Optional['SensorCalibration'] = None
    thresholds: Optional[SensorThresholds] = None
    sampling_rate_hz: Optional[int] = None

class SensorCalibration(BaseModel):
    slope: Optional[float] = None
    offset: Optional[float] = None
    r0: Optional[float] = None
    intercept: Optional[float] = None
    divider_ratio: Optional[float] = None
    adc_ref: Optional[float] = None
    last_calibrated: Optional[datetime] = None
    calibrated_by: Optional[str] = None

# ============================================================================
# Device Models
# ============================================================================

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
    sensors: List[SensorType] = []
    actuators: List[ActuatorType] = []
    thresholds: Dict[str, SensorThresholds] = {}
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
    sensors: List[SensorType] = []
    actuators: List[ActuatorType] = []
    config: DeviceConfig
    metrics: Optional[DeviceMetrics] = None
    current_readings: List[SensorReading] = []
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
    sensors: List[SensorType] = []
    actuators: List[ActuatorType] = []

# ============================================================================
# Alert Models
# ============================================================================

class Alert(BaseModel):
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

    @model_validator(mode='after')
    def validate_thresholds(self) -> 'ThresholdConfig':
        if self.water_level_min_cm >= self.water_level_max_cm:
            raise ValueError('water_level_min_cm must be less than water_level_max_cm')
        if self.temp_min_c >= self.temp_max_c:
            raise ValueError('temp_min_c must be less than temp_max_c')
        if self.humidity_min_pct >= self.humidity_max_pct:
            raise ValueError('humidity_min_pct must be less than humidity_max_pct')
        if self.battery_min_v >= self.battery_max_v:
            raise ValueError('battery_min_v must be less than battery_max_v')
        return self

class CalibrationConfig(BaseModel):
    water_level: Optional[Dict[str, float]] = None
    gas: Optional[Dict[str, float]] = None
    temperature: Optional[Dict[str, float]] = None
    humidity: Optional[Dict[str, float]] = None
    battery: Optional[Dict[str, float]] = None

# ============================================================================
# Automation Models
# ============================================================================

class AutomationCondition(BaseModel):
    id: str
    type: AutomationConditionType
    sensor_type: Optional[SensorType] = None
    operator: Optional[AutomationOperator] = None
    value: Optional[float] = None
    value_max: Optional[float] = None
    duration_seconds: Optional[int] = Field(default=None, ge=0)
    time_start: Optional[str] = None  # HH:MM format
    time_end: Optional[str] = None    # HH:MM format
    days_of_week: Optional[List[int]] = Field(default=None, min_length=1, max_length=7)
    device_id: Optional[str] = None
    actuator_type: Optional[ActuatorType] = None
    state: Optional[bool] = None
    expression: Optional[str] = None

    @model_validator(mode='after')
    def validate_condition(self) -> 'AutomationCondition':
        if self.type == AutomationConditionType.SENSOR:
            if not self.sensor_type or not self.operator or self.value is None:
                raise ValueError('Sensor condition requires sensor_type, operator, and value')
        elif self.type == AutomationConditionType.TIME:
            if not self.time_start or not self.time_end:
                raise ValueError('Time condition requires time_start and time_end')
        elif self.type == AutomationConditionType.STATE:
            if not self.device_id or not self.actuator_type:
                raise ValueError('State condition requires device_id and actuator_type')
        elif self.type == AutomationConditionType.EXPRESSION:
            if not self.expression:
                raise ValueError('Expression condition requires expression')
        return self

class AutomationActionParams(BaseModel):
    actuator_type: Optional[ActuatorType] = None
    state: Optional[bool] = None
    duration_seconds: Optional[int] = Field(default=None, ge=1, le=3600)
    message: Optional[str] = None
    severity: Optional[AlertSeverity] = None
    channels: Optional[List[str]] = None
    log_message: Optional[str] = None
    log_level: Optional[str] = None
    url: Optional[str] = None
    method: Optional[str] = None
    headers: Optional[Dict[str, str]] = None
    body: Optional[Dict[str, Any]] = None
    sensor_type: Optional[SensorType] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    rule_id: Optional[str] = None

class AutomationAction(BaseModel):
    id: str
    type: AutomationActionType
    params: AutomationActionParams = AutomationActionParams()
    delay_seconds: Optional[int] = Field(default=None, ge=0)
    condition: Optional[str] = None

class AutomationRule(BaseModel):
    id: str
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    enabled: bool = True
    priority: int = Field(default=10, ge=1, le=100)
    conditions: List[AutomationCondition] = Field(..., min_length=1)
    actions: List[AutomationAction] = Field(..., min_length=1)
    logic: AutomationLogic = AutomationLogic.AND
    cooldown_seconds: int = Field(default=60, ge=0, le=86400)
    max_executions_per_day: Optional[int] = Field(default=None, ge=1)
    execution_count: int = 0
    last_triggered: Optional[datetime] = None
    last_success: Optional[datetime] = None
    last_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    tags: Optional[List[str]] = None

class CreateAutomationRule(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    enabled: bool = True
    priority: int = Field(default=10, ge=1, le=100)
    conditions: List[AutomationCondition] = Field(..., min_length=1)
    actions: List[AutomationAction] = Field(..., min_length=1)
    logic: AutomationLogic = AutomationLogic.AND
    cooldown_seconds: int = Field(default=60, ge=0, le=86400)
    max_executions_per_day: Optional[int] = Field(default=None, ge=1)
    created_by: Optional[str] = None
    tags: Optional[List[str]] = None

# ============================================================================
# Event Models
# ============================================================================

class EventMetadata(BaseModel):
    sensor_type: Optional[SensorType] = None
    sensor_value: Optional[float] = None
    sensor_unit: Optional[str] = None
    threshold_value: Optional[float] = None
    rule_id: Optional[str] = None
    rule_name: Optional[str] = None
    command_id: Optional[str] = None
    command_type: Optional[str] = None
    command_params: Optional[Dict[str, Any]] = None
    ack_success: Optional[bool] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    firmware_version: Optional[str] = None
    config_changes: Optional[Dict[str, Dict[str, Any]]] = None
    user_id: Optional[str] = None
    user_action: Optional[str] = None

class EventLog(BaseModel):
    id: str
    event_type: EventType
    severity: AlertSeverity
    device_id: str
    message: str
    metadata: Optional[EventMetadata] = None
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

# ============================================================================
# Control Models
# ============================================================================

class PumpControl(BaseModel):
    action: str = Field(..., pattern="^(on|off|toggle)$")
    duration_seconds: Optional[int] = Field(default=None, ge=1, le=3600)

    @model_validator(mode='after')
    def validate_pump_control(self) -> 'PumpControl':
        if self.action == 'on' and self.duration_seconds is None:
            raise ValueError('duration_seconds required when action is "on"')
        return self

class RelayControl(BaseModel):
    relay: int = Field(..., ge=1, le=4)
    state: bool

class EmergencyStop(BaseModel):
    pass

# ============================================================================
# Serial Protocol Models
# ============================================================================

class SerialMessageBase(BaseModel):
    type: str
    timestamp: int = Field(..., gt=0)
    sequence: Optional[int] = None
    checksum: Optional[str] = None

class SensorReadingMessage(SerialMessageBase):
    type: str = "sensor_reading"
    payload: Dict[str, Any] = Field(..., description="Sensor reading payload")

class DeviceStatusMessage(SerialMessageBase):
    type: str = "device_status"
    payload: Dict[str, Any] = Field(..., description="Device status payload")

class EventMessage(SerialMessageBase):
    type: str = "event"
    payload: Dict[str, Any] = Field(..., description="Event payload")

class CommandAckMessage(SerialMessageBase):
    type: str = "command_ack"
    payload: Dict[str, Any] = Field(..., description="Command acknowledgment payload")

class CommandMessage(SerialMessageBase):
    type: str = "command"
    payload: Dict[str, Any] = Field(..., description="Command payload")

class ConfigUpdateMessage(SerialMessageBase):
    type: str = "config_update"
    payload: Dict[str, Any] = Field(..., description="Config update payload")

# ============================================================================
# Response Models
# ============================================================================

class ApiResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None
    error_code: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime
    checks: Dict[str, str]

class PaginatedResponse(BaseModel):
    total: int
    limit: int
    offset: int
    has_more: bool

# ============================================================================
# Forward References
# ============================================================================

SensorConfig.model_rebuild()
Device.model_rebuild()
AutomationRule.model_rebuild()