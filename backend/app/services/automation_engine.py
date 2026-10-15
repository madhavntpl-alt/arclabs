"""
Automation Engine - Rule evaluation, execution, cooldown
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from app.models.automation import (
    AutomationRule, AutomationCondition, AutomationAction, 
    AutomationExecution, ConditionResult, ActionResult,
    AutomationEngineConfig, DEFAULT_AUTOMATION_CONFIG,
    AutomationConditionType, AutomationOperator, AutomationActionType
)
from app.models.sensor import SensorType, SensorReading
from app.models.device import ActuatorType
from app.core.logging import get_logger

logger = get_logger(__name__)


class AutomationEngine:
    def __init__(self, config: AutomationEngineConfig = DEFAULT_AUTOMATION_CONFIG):
        self.config = config
        self.rules: Dict[str, AutomationRule] = {}
        self.execution_history: List[AutomationExecution] = []
        self.max_history = 1000
        self.condition_state: Dict[str, Dict] = {}  # Track condition duration
        self.running = False
        self.eval_task: Optional[Any] = None

    def add_rule(self, rule: AutomationRule):
        self.rules[rule.id] = rule

    def remove_rule(self, rule_id: str):
        if rule_id in self.rules:
            del self.rules[rule_id]

    def get_rule(self, rule_id: str) -> Optional[AutomationRule]:
        return self.rules.get(rule_id)

    def list_rules(self) -> List[AutomationRule]:
        return list(self.rules.values())

    async def start(self):
        self.running = True
        # In real implementation, start evaluation loop
        logger.info("Automation engine started")

    async def stop(self):
        self.running = False
        logger.info("Automation engine stopped")

    async def evaluate_all(self, sensor_values: Dict[SensorType, float], actuator_states: Dict[str, bool], device_statuses: Dict[str, str]) -> List[AutomationExecution]:
        """Evaluate all enabled rules"""
        executions = []
        
        # Sort rules by priority
        sorted_rules = sorted(
            [r for r in self.rules.values() if r.enabled],
            key=lambda r: r.priority
        )
        
        for rule in sorted_rules:
            execution = await self._evaluate_rule(
                rule, sensor_values, actuator_states, device_statuses
            )
            if execution:
                executions.append(execution)
        
        return executions

    async def _evaluate_rule(
        self,
        rule: AutomationRule,
        sensor_values: Dict[SensorType, float],
        actuator_states: Dict[str, bool],
        device_statuses: Dict[str, str]
    ) -> Optional[AutomationExecution]:
        """Evaluate a single rule"""
        start_time = datetime.now()
        
        # Check cooldown
        if rule.last_triggered:
            cooldown_end = rule.last_triggered + timedelta(seconds=rule.cooldown_seconds)
            if datetime.now() < cooldown_end:
                return None
        
        # Check max executions per day
        if rule.max_executions_per_day:
            today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            today_executions = [
                e for e in self.execution_history
                if e.rule_id == rule.id and e.triggered_at >= today_start
            ]
            if len(today_executions) >= rule.max_executions_per_day:
                return None

        # Evaluate conditions
        condition_results = []
        all_met = True
        
        for condition in rule.conditions:
            result = self._evaluate_condition(
                condition, sensor_values, actuator_states, device_statuses
            )
            condition_results.append(result)
            if not result.result:
                all_met = False
                if rule.logic == "AND":
                    break  # Short-circuit for AND logic

        # For OR logic, need at least one true
        if rule.logic == "OR":
            all_met = any(r.result for r in condition_results)

        execution = AutomationExecution(
            id=f"exec_{datetime.now().timestamp()}_{rule.id}",
            rule_id=rule.id,
            rule_name=rule.name,
            triggered_at=datetime.now(),
            conditions_met=all_met,
            condition_results=condition_results,
            actions_executed=[],
            duration_ms=0,
        )

        if all_met:
            # Execute actions
            execution.actions_executed = await self._execute_actions(rule.actions)
            rule.last_triggered = datetime.now()
            rule.execution_count += 1
            rule.last_success = datetime.now()
            execution.duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            
            self.execution_history.append(execution)
            if len(self.execution_history) > self.max_history:
                self.execution_history = self.execution_history[-self.max_history:]
            
            logger.info(f"Automation rule '{rule.name}' executed")
            return execution
        
        execution.duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        self.execution_history.append(execution)
        return execution

    def _evaluate_condition(
        self,
        condition: AutomationCondition,
        sensor_values: Dict[SensorType, float],
        actuator_states: Dict[str, bool],
        device_statuses: Dict[str, str]
    ) -> ConditionResult:
        """Evaluate a single condition"""
        evaluated_at = datetime.now()
        
        if condition.type == AutomationConditionType.SENSOR:
            return self._evaluate_sensor_condition(condition, sensor_values)
        elif condition.type == AutomationConditionType.TIME:
            return self._evaluate_time_condition(condition)
        elif condition.type == AutomationConditionType.STATE:
            return self._evaluate_state_condition(condition, actuator_states)
        elif condition.type == AutomationConditionType.EXPRESSION:
            return self._evaluate_expression_condition(condition, sensor_values, actuator_states, device_statuses)
        
        return ConditionResult(
            condition_id=condition.id,
            condition_type=condition.type,
            result=False,
            evaluated_at=datetime.now(),
        )

    def _evaluate_sensor_condition(self, condition: AutomationCondition, sensor_values: Dict[SensorType, float]) -> ConditionResult:
        if not condition.sensor_type or not condition.operator:
            return ConditionResult(condition_id=condition.id, condition_type="sensor", result=False, evaluated_at=datetime.now())
        
        current_value = sensor_values.get(condition.sensor_type)
        if current_value is None:
            return ConditionResult(
                condition_id=condition.id,
                condition_type="sensor",
                sensor_type=condition.sensor_type,
                result=False,
                evaluated_at=datetime.now(),
            )
        
        # Check duration if specified
        if condition.duration_seconds and condition.duration_seconds > 0:
            state_key = f"{condition.id}_{condition.sensor_type}"
            if state_key not in self.condition_state:
                self.condition_state[state_key] = {"start_time": None, "last_value": None}
            
            state = self.condition_state[state_key]
            result = self._evaluate_operator(current_value, condition.operator, condition.value, condition.value_max)
            
            if result:
                if state["start_time"] is None:
                    state["start_time"] = datetime.now()
                elif (datetime.now() - state["start_time"]).total_seconds() >= condition.duration_seconds:
                    return ConditionResult(
                        condition_id=condition.id,
                        condition_type="sensor",
                        sensor_type=condition.sensor_type,
                        current_value=current_value,
                        threshold_value=condition.value,
                        result=True,
                        evaluated_at=datetime.now(),
                    )
            else:
                state["start_time"] = None
            
            return ConditionResult(
                condition_id=condition.id,
                condition_type="sensor",
                sensor_type=condition.sensor_type,
                current_value=current_value,
                threshold_value=condition.value,
                result=False,
                evaluated_at=datetime.now(),
            )
        
        # No duration requirement
        result = self._evaluate_operator(current_value, condition.operator, condition.value, condition.value_max)
        return ConditionResult(
            condition_id=condition.id,
            condition_type="sensor",
            sensor_type=condition.sensor_type,
            current_value=current_value,
            threshold_value=condition.value,
            result=result,
            evaluated_at=datetime.now(),
        )

    def _evaluate_time_condition(self, condition: AutomationCondition) -> ConditionResult:
        now = datetime.now()
        current_time = now.time()
        current_day = now.weekday()  # 0 = Monday
        
        result = True
        
        if condition.time_start and condition.time_end:
            from datetime import time
            start = time.fromisoformat(condition.time_start)
            end = time.fromisoformat(condition.time_end)
            
            if start <= end:
                if not (start <= current_time <= end):
                    result = False
            else:
                # Overnight range
                if not (current_time >= start or current_time <= end):
                    result = False
        
        if condition.days_of_week and current_day not in condition.days_of_week:
            result = False
        
        return ConditionResult(
            condition_id=condition.id,
            condition_type="time",
            result=result,
            evaluated_at=datetime.now(),
        )

    def _evaluate_state_condition(self, condition: AutomationCondition, actuator_states: Dict[str, bool]) -> ConditionResult:
        if not condition.device_id or not condition.actuator_type:
            return ConditionResult(condition_id=condition.id, condition_type="state", result=False, evaluated_at=datetime.now())
        
        key = f"{condition.device_id}:{condition.actuator_type}"
        current_state = actuator_states.get(key)
        
        if current_state is None:
            return ConditionResult(condition_id=condition.id, condition_type="state", result=False, evaluated_at=datetime.now())
        
        result = condition.state is None or current_state == condition.state
        
        return ConditionResult(
            condition_id=condition.id,
            condition_type="state",
            result=result,
            evaluated_at=datetime.now(),
        )

    def _evaluate_expression_condition(
        self,
        condition: AutomationCondition,
        sensor_values: Dict[SensorType, float],
        actuator_states: Dict[str, bool],
        device_statuses: Dict[str, str]
    ) -> ConditionResult:
        if not condition.expression:
            return ConditionResult(condition_id=condition.id, condition_type="expression", result=False, evaluated_at=datetime.now())
        
        try:
            # WARNING: Using eval is dangerous in production!
            # In production, use a safe expression evaluator like expr-lang or similar
            vars_dict = {
                "sensors": {k.value: v for k, v in sensor_values.items()},
                "actuators": actuator_states,
                "devices": device_statuses,
                "now": datetime.now(),
            }
            
            # eslint-disable-next-line no-eval
            result = eval(f"({condition.expression})", {"__builtins__": {}}, vars_dict)
            
            return ConditionResult(
                condition_id=condition.id,
                condition_type="expression",
                result=bool(result),
                evaluated_at=datetime.now(),
            )
        except Exception as e:
            logger.error(f"Expression evaluation error: {e}")
            return ConditionResult(
                condition_id=condition.id,
                condition_type="expression",
                result=False,
                evaluated_at=datetime.now(),
            )

    def _evaluate_operator(
        self,
        value: float,
        operator: str,
        threshold: Optional[float],
        threshold_max: Optional[float]
    ) -> bool:
        if threshold is None:
            return False
        
        if operator == "<":
            return value < threshold
        elif operator == "<=":
            return value <= threshold
        elif operator == ">":
            return value > threshold
        elif operator == ">=":
            return value >= threshold
        elif operator == "==":
            return value == threshold
        elif operator == "!=":
            return value != threshold
        elif operator == "between":
            return threshold_max is not None and threshold <= value <= threshold_max
        elif operator == "outside":
            return threshold_max is not None and (value < threshold or value > threshold_max)
        return False

    async def _execute_actions(self, actions: List) -> List[ActionResult]:
        results = []
        for action in actions:
            start = datetime.now()
            try:
                # In real implementation, this would send commands via serial manager
                # For now, just simulate success
                result = ActionResult(
                    action_id=action.id,
                    action_type=action.type,
                    success=True,
                    output={"simulated": True},
                    executed_at=datetime.now(),
                    duration_ms=10,
                )
                logger.info(f"Action executed: {action.type}")
            except Exception as e:
                result = ActionResult(
                    action_id=action.id,
                    action_type=action.type,
                    success=False,
                    error=str(e),
                    executed_at=datetime.now(),
                    duration_ms=int((datetime.now() - start).total_seconds() * 1000),
                )
                logger.error(f"Action failed: {action.type} - {e}")
            
            results.append(result)
        return results

    def get_execution_history(self, rule_id: Optional[str] = None, limit: int = 100) -> List:
        history = self.execution_history
        if rule_id:
            history = [e for e in history if e.rule_id == rule_id]
        return history[-100:]