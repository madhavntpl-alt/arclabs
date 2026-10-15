"""
Events API endpoints
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()


class EventLog(BaseModel):
    id: str
    event_type: str
    severity: str
    device_id: str
    message: str
    metadata: Optional[dict] = None
    timestamp: datetime
    correlation_id: Optional[str] = None


class PaginatedEvents(BaseModel):
    events: List[EventLog]
    total: int
    limit: int
    offset: int
    has_more: bool


class EventStats(BaseModel):
    by_type: dict
    by_severity: dict
    by_device: dict
    total: int
    time_range: dict


# Mock events data
mock_events = [
    EventLog(
        id="evt_1",
        event_type="threshold_exceeded",
        severity="warning",
        device_id="device_1",
        message="Water level below minimum: 8.5 cm",
        metadata={"sensor": "water_level", "value": 8.5, "threshold": 10},
        timestamp=datetime.now(),
    ),
    EventLog(
        id="evt_2",
        event_type="automation_triggered",
        severity="info",
        device_id="device_1",
        message="Automation rule 'Low Water Pump' executed",
        metadata={"rule_id": "rule_1", "rule_name": "Low Water Pump"},
        timestamp=datetime.now(),
    ),
    EventLog(
        id="evt_3",
        event_type="command_sent",
        severity="info",
        device_id="device_1",
        message="Pump ON command sent for 60s",
        metadata={"command_id": "cmd_123", "command_type": "pump_on", "params": {"duration": 60}},
        timestamp=datetime.now(),
    ),
]


@router.get("/")
async def get_events(
    event_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    device_id: Optional[str] = Query(None),
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    sort: str = Query("-timestamp"),
    search: Optional[str] = Query(None),
):
    events = mock_events
    
    if event_type:
        events = [e for e in events if e.event_type == event_type]
    if severity:
        events = [e for e in events if e.severity == severity]
    if device_id:
        events = [e for e in events if e.device_id == device_id]
    if search:
        events = [e for e in events if search.lower() in e.message.lower()]
    
    # Sort
    reverse = sort.startswith("-")
    sort_field = sort.lstrip("-")
    events.sort(key=lambda e: getattr(e, sort_field, ""), reverse=reverse)
    
    return PaginatedEvents(
        events=events[offset:offset+limit],
        total=len(events),
        limit=limit,
        offset=offset,
        has_more=len(events) > offset + limit
    )


@router.get("/stats")
async def get_event_stats():
    events = mock_events
    return EventStats(
        by_type={e.event_type: events.count(e) for e in events},
        by_severity={e.severity: events.count(e) for e in events},
        by_device={e.device_id: events.count(e) for e in events},
        total=len(events),
        time_range={"start": "2024-01-14T00:00:00Z", "end": datetime.now().isoformat()}
    )