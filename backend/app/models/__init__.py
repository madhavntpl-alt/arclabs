"""
Models package - Domain entities
"""

from app.models.base import BaseSchema
from app.models.sensor import *
from app.models.device import *
from app.models.alert import *
from app.models.event import *
from app.models.automation import *

__all__ = [
    "BaseSchema",
    # Sensor
    "SensorType",
    "SensorStatus",
    "SensorThresholds",
    "SensorReading",
    "SensorHistoryPoint",
    "SensorHistory",
    "SensorCalibration",
    "SensorConfig",
    # Device
    "DeviceStatus",
    "DeviceType",
    "ActuatorType",
    "ActuatorStatus",
    "DeviceMetrics",
    "DeviceConfig",
    "Device",
    "DeviceSummary",
    "DeviceRegistration",
    # Alert
    "AlertSeverity",
    "AlertStatus",
    "SensorType as AlertSensorType",
    "Alert",
    "ThresholdConfig",
    "SensorThreshold",
    "ThresholdEvaluationResult",
    "AlertRule",
    "AlertNotification",
    # Event
    "EventType",
    "AlertSeverity as EventSeverity",
    "EventLog",
    "EventQuery",
    "PaginatedEvents",
    "EventStats",
    # Automation
    "AutomationOperator",
    "AutomationConditionType",
    "AutomationCondition",
    "AutomationActionType",
    "AutomationActionParams",
    "AutomationAction",
    "AutomationLogic",
    "AutomationRule",
    "CreateAutomationRule",
    "AutomationExecution",
    "ConditionResult",
    "ActionResult",
    "AutomationEngineConfig",
    "DEFAULT_AUTOMATION_CONFIG",
]