"""
Devices API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db

router = APIRouter()


@router.get("/")
async def get_devices(
    db: AsyncSession = Depends(get_db),
):
    """Get all devices"""
    return {
        "devices": [
            {
                "id": "catalyst-mk1-001",
                "name": "Catalyst Mk1 #1",
                "type": "catalyst_mk1",
                "status": "online",
                "last_seen": "2024-01-15T10:30:00Z",
                "firmware_version": "1.0.0",
                "hardware_version": "1.0",
                "sensors": ["water_level", "temperature", "humidity", "gas", "battery"],
                "actuators": ["pump", "valve"],
                "config": {
                    "serial_port": "/dev/ttyUSB0",
                    "baudrate": 115200
                }
            }
        ]
    }


@router.get("/{device_id}")
async def get_device(
    device_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get specific device details"""
    if device_id != "catalyst-mk1-001":
        raise HTTPException(status_code=404, detail="Device not found")
    
    return {
        "id": "catalyst-mk1-001",
        "name": "Catalyst Mk1 #1",
        "type": "catalyst_mk1",
        "status": "online",
        "last_seen": "2024-01-15T10:30:00Z",
        "firmware_version": "1.0.0",
        "hardware_version": "1.0",
        "sensors": ["water_level", "temperature", "humidity", "gas", "battery"],
        "actuators": ["pump", "valve"],
        "config": {
            "serial_port": "/dev/ttyUSB0",
            "baudrate": 115200
        },
        "metrics": {
            "uptime_seconds": 3600,
            "free_heap": 1234,
            "messages_received": 18000,
            "messages_sent": 150,
            "errors": 0
        }
    }