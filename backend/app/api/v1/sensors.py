"""
Sensors API endpoints
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.api.deps import get_db
from app.core.config import settings

router = APIRouter()


@router.get("/")
async def get_sensors(
    db: AsyncSession = Depends(get_db),
):
    """Get current readings for all sensors"""
    # In a real implementation, this would query the database
    # For now, return mock data matching the frontend expectations
    return {
        "sensors": [
            {
                "sensor_type": "water_level",
                "value": 45.2,
                "unit": "cm",
                "timestamp": "2024-01-15T10:30:00Z",
                "status": "normal",
                "thresholds": {"min": 10, "max": 200}
            },
            {
                "sensor_type": "temperature",
                "value": 23.5,
                "unit": "°C",
                "timestamp": "2024-01-15T10:30:00Z",
                "status": "normal",
                "thresholds": {"min": 0, "max": 50}
            },
            {
                "sensor_type": "humidity",
                "value": 65,
                "unit": "%",
                "timestamp": "2024-01-15T10:30:00Z",
                "status": "normal",
                "thresholds": {"min": 20, "max": 80}
            },
            {
                "sensor_type": "gas",
                "value": 450,
                "unit": "ppm",
                "timestamp": "2024-01-15T10:30:00Z",
                "status": "normal",
                "thresholds": {"max": 1000}
            },
            {
                "sensor_type": "battery",
                "value": 3.85,
                "unit": "V",
                "timestamp": "2024-01-15T10:30:00Z",
                "status": "normal",
                "thresholds": {"min": 3.3, "max": 4.2}
            }
        ],
        "device_status": {
            "connected": True,
            "uptime_seconds": 3600,
            "firmware_version": "1.0.0",
            "free_heap": 1234
        }
    }


@router.get("/{sensor_type}")
async def get_sensor(
    sensor_type: str,
    db: AsyncSession = Depends(get_db),
):
    """Get current reading for specific sensor"""
    # Mock implementation
    sensors_data = {
        "water_level": {"sensor_type": "water_level", "value": 45.2, "unit": "cm", "status": "normal"},
        "temperature": {"sensor_type": "temperature", "value": 23.5, "unit": "°C", "status": "normal"},
        "humidity": {"sensor_type": "humidity", "value": 65, "unit": "%", "status": "normal"},
        "gas": {"sensor_type": "gas", "value": 450, "unit": "ppm", "status": "normal"},
        "battery": {"sensor_type": "battery", "value": 3.85, "unit": "V", "status": "normal"},
    }
    if sensor_type not in sensors_data:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return {**sensors_data[sensor_type], "timestamp": "2024-01-15T10:30:00Z"}


@router.get("/history")
async def get_sensor_history(
    sensor_type: str = Query(...),
    start: Optional[str] = Query(None),
    end: Optional[str] = Query(None),
    interval: str = Query("1m"),
    limit: int = Query(1000),
    db: AsyncSession = Depends(get_db),
):
    """Get historical sensor data"""
    # Mock implementation
    return {
        "sensor_type": sensor_type,
        "unit": "cm" if sensor_type == "water_level" else "°C" if sensor_type == "temperature" else "%" if sensor_type == "humidity" else "ppm" if sensor_type == "gas" else "V",
        "interval": interval,
        "data": [
            {"timestamp": "2024-01-14T00:00:00Z", "min": 20.1, "max": 22.3, "avg": 21.2, "count": 15},
            {"timestamp": "2024-01-14T00:15:00Z", "min": 21.0, "max": 23.1, "avg": 22.0, "count": 15},
        ]
    }

from fastapi import HTTPException
from typing import Optional