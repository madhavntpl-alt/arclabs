"""
OpenAPI schema customization
"""

from fastapi.openapi.utils import get_openapi
from fastapi import FastAPI


def custom_openapi(app: FastAPI):
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="ARC LABS Monitoring API",
        version="0.1.0",
        description="""
Environmental monitoring platform for hydroponic and aquaponic systems.

## Features

* Real-time sensor monitoring (water level, temperature, humidity, gas, battery)
* Automated control with safety interlocks
* Alert system with configurable thresholds
* Event logging and historical data
* WebSocket for real-time updates

## Authentication

Currently uses API key authentication (planned for v1.1).

## Rate Limiting

100 requests per 60 seconds per IP.

## WebSocket

Connect to `/ws/live` for real-time sensor data.
        """,
        routes=app.routes,
    )

    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "APIKey": {
            "type": "apiKey",
            "in": "header",
            "name": "Authorization",
            "description": "API Key authentication (format: Bearer <key>)"
        },
        "JWT": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT token authentication"
        }
    }

    # Add global security requirement (optional for now)
    openapi_schema["security"] = []

    # Custom tags
    openapi_schema["tags"] = [
        {"name": "sensors", "description": "Sensor readings and history"},
        {"name": "devices", "description": "Device management"},
        {"name": "control", "description": "Actuator control"},
        {"name": "config", "description": "Configuration management"},
        {"name": "rules", "description": "Automation rules"},
        {"name": "events", "description": "Event logging"},
        {"name": "health", "description": "Health checks"},
    ]

    app.openapi_schema = openapi_schema
    return app.openapi_schema