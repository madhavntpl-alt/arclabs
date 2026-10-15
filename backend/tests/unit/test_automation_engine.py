"""
Unit tests for Automation Engine
"""

import pytest
from unittest.mock import MagicMock
from datetime import datetime, timedelta
from app.services.automation_engine import AutomationEngine
from app.models.automation import (
    AutomationRule, AutomationCondition, AutomationAction,
    AutomationConditionType, AutomationOperator, AutomationActionType,
    AutomationLogic, AutomationEngineConfig
)
from app.models.sensor import SensorType
from app.models.device import ActuatorType


class TestAutomationEngine:
    @pytest.fixture
    def automation_engine(self):
        return AutomationEngine()

    @pytest.fixture
    def sample_rule(self):
        return AutomationRule(
            id="rule_1",
            name="Test Rule",
            enabled=True,
            priority=10,
            conditions=[
                AutomationCondition(
                    id="cond_1",
                    type="sensor",
                    sensor_type=SensorType.WATER_LEVEL,
                    operator="<",
                    value=20,
                    duration_seconds=30,
                )
            ],
            actions=[
                AutomationAction(
                    id="act_1",
                    type="pump_on",
                    params={"duration_seconds": 60},
                )
            ],
            logic="AND",
            cooldown_seconds=60,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

    def test_add_rule(self, automation_engine, sample_rule):
        automation_engine.add_rule(sample_rule)
        assert sample_rule.id in automation_engine.rules

    def test_remove_rule(self, automation_engine, sample_rule):
        automation_engine.add_rule(sample_rule)
        automation_engine.remove_rule(sample_rule.id)
        assert sample_rule.id not in automation_engine.rules

    def test_evaluate_sensor_condition(self, automation_engine):
        condition = AutomationCondition(
            id="cond_1",
            type="sensor",
            sensor_type="temperature",
            operator=">",
            value=30,
        )
        
        sensor_values = {"temperature": 35.0}
        result = automation_engine._evaluate_condition(
            condition,
            sensor_values,
            {},
            {}
        )
        assert result.result is True

    def test_evaluate_sensor_condition_false(self, automation_engine):
        condition = AutomationCondition(
            id="cond_1",
            type="sensor",
            sensor_type="temperature",
            operator=">",
            value=30,
        )
        
        sensor_values = {"temperature": 25.0}
        result = automation_engine._evaluate_condition(
            condition,
            sensor_values,
            {},
            {}
        )
        assert result.result is False

    def test_evaluate_operators(self, automation_engine):
        assert automation_engine._evaluate_operator(25, ">", 20, None) is True
        assert automation_engine._evaluate_operator(25, "<", 20, None) is False
        assert automation_engine._evaluate_operator(25, ">=", 25, None) is True
        assert automation_engine._evaluate_operator(25, "<=", 25, None) is True
        assert automation_engine._evaluate_operator(25, "==", 25, None) is True
        assert automation_engine._evaluate_operator(25, "!=", 25, None) is False
        assert automation_engine._evaluate_operator(25, "between", 20, 30) is True
        assert automation_engine._evaluate_operator(25, "between", 30, 40) is False
        assert automation_engine._evaluate_operator(25, "outside", 20, 30) is False
        assert automation_engine._evaluate_operator(25, "outside", 30, 40) is True

    def test_time_condition(self, automation_engine):
        from datetime import datetime, time
        
        # Current time within range
        condition = MagicMock()
        condition.type = "time"
        condition.time_start = "08:00"
        condition.time_end = "18:00"
        condition.days_of_week = None
        
        # This would need actual time to test properly
        # Mock the current time for testing