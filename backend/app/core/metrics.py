"""
Prometheus metrics configuration
"""

from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response
from app.core.config import settings


# Metrics
http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"],
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"],
)

sensor_readings_total = Counter(
    "sensor_readings_total",
    "Total sensor readings received",
    ["sensor_type", "device_id"],
)

sensor_reading_value = Gauge(
    "sensor_reading_value",
    "Current sensor reading value",
    ["sensor_type", "device_id"],
)

alerts_active = Gauge(
    "alerts_active",
    "Number of active alerts",
    ["severity", "device_id"],
)

automation_executions_total = Counter(
    "automation_executions_total",
    "Total automation rule executions",
    ["rule_id", "status"],
)

serial_connection_status = Gauge(
    "serial_connection_status",
    "Serial connection status (1=connected, 0=disconnected)",
    ["port"],
)

websocket_connections_active = Gauge(
    "websocket_connections_active",
    "Number of active WebSocket connections",
)

messages_per_second = Gauge(
    "messages_per_second",
    "Messages received per second",
)


def setup_metrics(app):
    @app.get("/metrics")
    async def metrics():
        if not settings.METRICS_ENABLED:
            return Response(content="Metrics disabled", status_code=404)
        return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)