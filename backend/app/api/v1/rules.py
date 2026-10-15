"""
Automation Rules API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

router = APIRouter()


class AutomationCondition(BaseModel):
    sensor: str
    operator: Literal["<", "<=", ">", ">=", "==", "!=", "between", "outside"]
    value: float
    value_max: Optional[float] = None
    duration_seconds: int = Field(default=0, ge=0)


class AutomationAction(BaseModel):
    type: Literal["pump_on", "pump_off", "relay_set", "notify", "log"]
    params: dict


class AutomationRule(BaseModel):
    id: str
    name: str
    enabled: bool = True
    priority: int = Field(default=10, ge=1, le=100)
    conditions: List[AutomationCondition]
    actions: List[AutomationAction]
    logic: Literal["AND", "OR"] = "AND"
    cooldown_seconds: int = Field(default=60, ge=0, le=86400)
    max_executions_per_day: Optional[int] = Field(None, ge=1)
    execution_count: int = 0
    last_triggered: Optional[datetime] = None
    last_success: Optional[datetime] = None
    last_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    tags: List[str] = []


class CreateAutomationRule(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    enabled: bool = True
    priority: int = Field(default=10, ge=1, le=100)
    conditions: List[AutomationCondition] = Field(..., min_length=1)
    actions: List[AutomationAction] = Field(..., min_length=1)
    logic: Literal["AND", "OR"] = "AND"
    cooldown_seconds: int = Field(default=60, ge=0, le=86400)
    max_executions_per_day: Optional[int] = Field(None, ge=1)
    created_by: Optional[str] = None
    tags: List[str] = []


class RuleTestResult(BaseModel):
    would_trigger: bool
    condition_results: List[dict]


# In-memory storage for demo
rules_db = {
    "rule_1": AutomationRule(
        id="rule_1",
        name="Low Water Pump",
        enabled=True,
        priority=10,
        conditions=[
            AutomationCondition(sensor="water_level", operator="<", value=20, duration_seconds=30)
        ],
        actions=[
            AutomationAction(type="pump_on", params={"duration_seconds": 60})
        ],
        logic="AND",
        cooldown_seconds=300,
        execution_count=5,
        last_triggered=datetime.now(),
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )
}


@router.get("/")
async def list_rules(
    enabled: Optional[bool] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    rules = list(rules_db.values())
    if enabled is not None:
        rules = [r for r in rules if r.enabled == enabled]
    return {
        "rules": rules[offset:offset+limit],
        "total": len(rules),
        "limit": limit,
        "offset": offset
    }


@router.post("/")
async def create_rule(rule: CreateAutomationRule):
    import uuid
    rule_id = f"rule_{uuid.uuid4().hex[:8]}"
    new_rule = AutomationRule(
        id=rule_id,
        **rule.dict(),
        execution_count=0,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )
    rules_db[rule_id] = new_rule
    return new_rule


@router.get("/{rule_id}")
async def get_rule(rule_id: str):
    if rule_id not in rules_db:
        raise HTTPException(status_code=404, detail="Rule not found")
    return rules_db[rule_id]


@router.put("/{rule_id}")
async def update_rule(rule_id: str, rule: CreateAutomationRule):
    if rule_id not in rules_db:
        raise HTTPException(status_code=404, detail="Rule not found")
    existing = rules_db[rule_id]
    updated = AutomationRule(
        id=rule_id,
        **rule.dict(),
        execution_count=existing.execution_count,
        last_triggered=existing.last_triggered,
        last_success=existing.last_success,
        last_error=existing.last_error,
        created_at=existing.created_at,
        updated_at=datetime.now(),
    )
    rules_db[rule_id] = updated
    return updated


@router.delete("/{rule_id}")
async def delete_rule(rule_id: str):
    if rule_id not in rules_db:
        raise HTTPException(status_code=404, detail="Rule not found")
    del rules_db[rule_id]
    return {"success": True, "message": "Rule deleted"}


@router.post("/{rule_id}/test")
async def test_rule(rule_id: str):
    if rule_id not in rules_db:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    rule = rules_db[rule_id]
    # Mock test result
    return RuleTestResult(
        would_trigger=False,
        condition_results=[
            {
                "sensor": "temperature",
                "current_value": 23.5,
                "operator": ">",
                "threshold": 35,
                "result": False
            }
        ]
    )