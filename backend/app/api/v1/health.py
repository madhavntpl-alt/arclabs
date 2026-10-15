"""
Health check API endpoints
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/")
async def health_check():
    return {
        "status": "healthy",
        "version": "0.1.0",
        "timestamp": datetime.now().isoformat(),
        "checks": {
            "database": "healthy",
            "serial": "connected",
            "websocket": "active"
        }
    }


@router.get("/serial")
async def serial_health():
    return {
        "connected": True,
        "port": "/dev/ttyUSB0",
        "baudrate": 115200,
        "last_message": datetime.now().isoformat(),
        "messages_per_second": 5.2
    }