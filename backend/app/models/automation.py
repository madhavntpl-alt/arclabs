"""
Automation models
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from enum import Enum
from app.models.base import BaseSchema


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


class AutomationCondition(BaseSchema):
    id: str
    type: AutomationConditionType
    sensor_type: Optional[str] = None
    operator: Optional[AutomationOperator] = None
    value: Optional[float] = None
    value_max: Optional[float] = None
    duration_seconds: Optional[int] = Field(default=None, ge=0)
    time_start: Optional[str] = None
    time_end: Optional[str] = None
    days_of_week: Optional[List[int]] = Field(default=None, min_length=1, max_length=7)
    device_id: Optional[str] = None
    actuator_type: Optional[str] = None
    state: Optional[bool] = None
    expression: Optional[str] = None


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


class AutomationActionParams(BaseSchema):
    actuator_type: Optional[str] = None
    state: Optional[bool] = None
    duration_seconds: Optional[int] = Field(default=None, ge=1, le=3600)
    message: Optional[str] = None
    severity: Optional[str] = None
    channels: Optional[List[str]] = None
    log_message: Optional[str] = None
    log_level: Optional[str] = None
    url: Optional[str] = None
    method: Optional[str] = None
    headers: Optional[Dict[str, str]] = None
    body: Optional[Dict[str, Any]] = None
    sensor_type: Optional[str] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    rule_id: Optional[str] = None


class AutomationAction(BaseSchema):
    id: str
    type: AutomationActionType
    params: AutomationActionParams = AutomationActionParams()
    delay_seconds: Optional[int] = Field(default=None, ge=0)
    condition: Optional[str] = None


class AutomationLogic(str, Enum):
    AND = "AND"
    OR = "OR"


class AutomationRule(BaseSchema):
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


class CreateAutomationRule(BaseSchema):
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


class AutomationExecution(BaseSchema):
    id: str
    rule_id: str
    rule_name: str
    triggered_at: datetime
    conditions_met: bool
    condition_results: List[dict]
    actions_executed: List[dict]
    duration_ms: int
    error: Optional[str] = None


class ConditionResult(BaseSchema):
    condition_id: str
    condition_type: str
    sensor_type: Optional[str] = None
    current_value: Optional[float] = None
    threshold_value: Optional[float] = None
    result: bool
    evaluated_at: datetime


class ActionResult(BaseSchema):
    action_id: str
    action_type: str
    success: bool
    output: Optional[Any] = None
    error: Optional[str] = None
    executed_at: datetime
    duration_ms: int


class AutomationEngineConfig(BaseSchema):
    enabled: bool = True
    evaluation_interval_seconds: int = 1
    max_concurrent_executions: int = 10
    default_cooldown_seconds: int = 60
    safety_interlock_enabled: bool = True
    emergency_stop_enabled: bool = True


DEFAULT_AUTOMATION_CONFIG = AutomationEngineConfig()