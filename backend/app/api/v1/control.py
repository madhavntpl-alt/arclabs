"""
Control API endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal, Optional

router = APIRouter()


class PumpControlRequest(BaseModel):
    action: Literal["on", "off", "toggle"]
    duration_seconds: Optional[int] = Field(None, ge=1, le=3600)


class RelayControlRequest(BaseModel):
    relay: int = Field(..., ge=1, le=4)
    state: bool


@router.post("/pump")
async def control_pump(request: PumpControlRequest):
    """Control water pump"""
    if request.action == "on" and request.duration_seconds is None:
        raise HTTPException(status_code=400, detail="duration_seconds required when action is 'on'")
    
    # In real implementation, send command via serial
    return {
        "success": True,
        "command_id": "cmd_abc123",
        "action": request.action,
        "duration_seconds": request.duration_seconds,
        "timestamp": "2024-01-15T10:30:00Z"
    }


@router.post("/relay")
async def control_relay(request: RelayControlRequest):
    """Control relay"""
    return {
        "success": True,
        "command_id": "cmd_def456",
        "relay": request.relay,
        "state": request.state,
        "timestamp": "2024-01-15T10:30:00Z"
    }


@router.post("/emergency_stop")
async def emergency_stop():
    """Emergency stop all actuators"""
    return {
        "success": True,
        "message": "Emergency stop activated",
        "timestamp": "2024-01-15T10:30:00Z"
    }