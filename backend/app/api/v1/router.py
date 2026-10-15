"""
API v1 Router - Main router including all v1 endpoints
"""

from fastapi import APIRouter

from app.api.v1 import sensors, devices, control, config, rules, events, health

api_router = APIRouter()

api_router.include_router(sensors.router, prefix="/sensors", tags=["sensors"])
api_router.include_router(devices.router, prefix="/devices", tags=["devices"])
api_router.include_router(control.router, prefix="/control", tags=["control"])
api_router.include_router(config.router, prefix="/config", tags=["config"])
api_router.include_router(rules.router, prefix="/rules", tags=["rules"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(health.router, prefix="/health", tags=["health"])