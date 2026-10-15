# API Contract

## Overview
This document describes the complete API contract for the ARC LABS Monitoring Platform REST API and WebSocket interface.

## Base Information
- **Base URL**: `https://api.arc-labs.com/api/v1`
- **Protocol**: HTTPS
- **Format**: JSON
- **Authentication**: Bearer token (JWT) or API Key
- **Rate Limiting**: 100 requests/minute per IP

## Versioning
- **Current Version**: v1
- **URL Pattern**: `/api/v1/...`
- **Deprecation Policy**: 6 months notice before removal

## Authentication

### JWT Token
```
Authorization: Bearer <jwt_token>
```

### API Key
```
Authorization: Bearer ak_live_<key>
```

## Error Responses

### Standard Error Format
```json
{
  "detail": "Error description",
  "error_code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/sensors"
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Common Error Codes
| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Request body validation failed |
| SENSOR_NOT_FOUND | Sensor type not found |
| DEVICE_NOT_FOUND | Device not found |
| RULE_NOT_FOUND | Automation rule not found |
| SERIAL_DISCONNECTED | Serial connection lost |
| COMMAND_FAILED | Command execution failed |
| CALIBRATION_INVALID | Invalid calibration parameters |
| THRESHOLD_INVALID | Invalid threshold values |

## Rate Limiting
- **Default**: 100 requests per 60 seconds per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Exceeded**: Returns 429 with `Retry-After` header

## Pagination
```
GET /api/v1/events?limit=50&offset=0&sort=-timestamp
```
| Parameter | Type | Default | Max |
|-----------|------|---------|-----|
| limit | integer | 100 | 1000 |
| offset | integer | 0 | - |
| sort | string | -timestamp | - |

## WebSocket API

### Connection
```
WS wss://api.arc-labs.com/ws/live?token=<jwt_token>
```

### Client Messages
```json
{"type": "ping", "payload": {}}
{"type": "subscribe", "payload": {"topics": ["sensor_readings", "alerts", "events"]}}
{"type": "unsubscribe", "payload": {"topics": ["events"]}}
```

### Server Messages
```json
{"type": "sensor_reading", "payload": {"sensor_type": "water_level", "value": 45.2, "unit": "cm", "timestamp": "2024-01-15T10:30:00Z", "status": "normal"}}
{"type": "alert", "payload": {"id": "alert_1", "severity": "warning", "message": "Water level low", "sensor": "water_level", "value": 8.5, "threshold": 10, "timestamp": "2024-01-15T10:30:00Z"}}
{"type": "event", "payload": {"id": "evt_1", "event_type": "threshold_exceeded", "severity": "warning", "message": "Water level low", "timestamp": "2024-01-15T10:30:00Z"}}
{"type": "command_ack", "payload": {"command_id": "cmd_123", "success": true, "message": "Pump activated for 30s"}}
{"type": "heartbeat", "payload": {"timestamp": "2024-01-15T10:30:00Z", "server_time": "2024-01-15T10:30:00.001Z"}}
```

## REST Endpoints

### Health Checks

#### GET /health
System health check.

**Response 200**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": "healthy",
    "serial": "connected",
    "websocket": "active"
  }
}
```

#### GET /health/serial
Serial connection health.

**Response 200**
```json
{
  "connected": true,
  "port": "/dev/ttyUSB0",
  "baudrate": 115200,
  "last_message": "2024-01-15T10:30:00Z",
  "messages_per_second": 5.2
}
```

### Sensors

#### GET /api/v1/sensors
Get current readings for all sensors.

**Response 200**
```json
{
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
    "connected": true,
    "uptime_seconds": 3600,
    "firmware_version": "1.0.0",
    "free_heap": 1234
  }
}
```

#### GET /api/v1/sensors/{sensor_type}
Get current reading for specific sensor.

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| sensor_type | string | water_level, temperature, humidity, gas, battery |

**Response 200**
```json
{
  "sensor_type": "water_level",
  "value": 45.2,
  "unit": "cm",
  "timestamp": "2024-01-15T10:30:00Z",
  "status": "normal"
}
```

**Response 404**
```json
{"detail": "Sensor not found", "error_code": "SENSOR_NOT_FOUND"}
```

#### GET /api/v1/sensors/history
Get historical sensor data.

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| sensor_type | string | required | Sensor type |
| start | string | 24h ago | ISO 8601 start time |
| end | string | now | ISO 8601 end time |
| interval | string | 1m | Aggregation interval (1m, 5m, 15m, 1h, 1d) |
| limit | integer | 1000 | Max data points |

**Response 200**
```json
{
  "sensor_type": "temperature",
  "unit": "°C",
  "interval": "15m",
  "data": [
    {
      "timestamp": "2024-01-14T00:00:00Z",
      "min": 20.1,
      "max": 22.3,
      "avg": 21.2,
      "count": 15
    }
  ]
}
```

### Devices

#### GET /api/v1/devices
List all devices.

**Response 200**
```json
{
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
```

#### GET /api/v1/devices/{device_id}
Get specific device details.

**Response 200**
```json
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
  "config": {...},
  "metrics": {
    "uptime_seconds": 3600,
    "free_heap": 1234,
    "messages_received": 18000,
    "messages_sent": 150,
    "errors": 0
  }
}
```

### Control

#### POST /api/v1/control/pump
Control water pump.

**Request Body**
```json
{
  "action": "on",
  "duration_seconds": 30
}
```

**Response 200**
```json
{
  "success": true,
  "command_id": "cmd_abc123",
  "action": "on",
  "duration_seconds": 30,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### POST /api/v1/control/relay
Control relay.

**Request Body**
```json
{
  "relay": 1,
  "state": true
}
```

**Response 200**
```json
{
  "success": true,
  "command_id": "cmd_def456",
  "relay": 1,
  "state": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### POST /api/v1/control/emergency_stop
Emergency stop all actuators.

**Request Body**: `{}`

**Response 200**
```json
{
  "success": true,
  "message": "Emergency stop activated",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Configuration

#### GET /api/v1/config/thresholds
Get threshold configuration.

**Response 200**
```json
{
  "water_level_min_cm": 10,
  "water_level_max_cm": 200,
  "temp_min_c": 0,
  "temp_max_c": 50,
  "humidity_min_pct": 20,
  "humidity_max_pct": 80,
  "gas_threshold_ppm": 1000,
  "battery_min_v": 3.3,
  "battery_max_v": 4.2
}
```

#### POST /api/v1/config/thresholds
Update threshold configuration.

**Request Body**
```json
{
  "water_level_min_cm": 15,
  "water_level_max_cm": 180,
  "temp_min_c": 5,
  "temp_max_c": 40,
  "humidity_min_pct": 30,
  "humidity_max_pct": 70,
  "gas_threshold_ppm": 800,
  "battery_min_v": 3.5,
  "battery_max_v": 4.1
}
```

#### GET /api/v1/config/calibration
Get calibration parameters.

**Response 200**
```json
{
  "water_level": {"slope": 58.0, "offset": -2.5},
  "gas": {"r0": 10.0, "slope": -0.45, "intercept": 1.2},
  "temperature": {"offset": 0.0},
  "humidity": {"offset": 0.0},
  "battery": {"divider_ratio": 11.0, "adc_ref": 5.0, "offset": 0.0}
}
```

#### POST /api/v1/config/calibration
Update calibration.

**Request Body**
```json
{
  "water_level": {"slope": 58.5, "offset": -2.3}
}
```

### Automation Rules

#### GET /api/v1/rules
List automation rules.

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| enabled | boolean | - | Filter by enabled status |
| limit | integer | 50 | Max results |
| offset | integer | 0 | Pagination offset |

**Response 200**
```json
{
  "rules": [
    {
      "id": "rule_001",
      "name": "Low Water Pump",
      "enabled": true,
      "priority": 10,
      "conditions": [
        {"sensor": "water_level", "operator": "<", "value": 20, "duration_seconds": 30}
      ],
      "actions": [
        {"type": "pump_on", "params": {"duration_seconds": 60}}
      ],
      "logic": "AND",
      "cooldown_seconds": 300,
      "last_triggered": "2024-01-15T09:00:00Z",
      "trigger_count": 5
    }
  ],
  "total": 1
}
```

#### POST /api/v1/rules
Create automation rule.

**Request Body**
```json
{
  "name": "High Temp Fan",
  "enabled": true,
  "priority": 20,
  "conditions": [
    {"sensor": "temperature", "operator": ">", "value": 35, "duration_seconds": 60}
  ],
  "actions": [
    {"type": "relay_set", "params": {"relay": 2, "state": true}}
  ],
  "logic": "AND",
  "cooldown_seconds": 600
}
```

#### GET /api/v1/rules/{rule_id}
Get specific rule.

#### PUT /api/v1/rules/{rule_id}
Update rule.

#### DELETE /api/v1/rules/{rule_id}
Delete rule.

#### POST /api/v1/rules/{rule_id}/test
Test rule evaluation (dry run).

**Response 200**
```json
{
  "would_trigger": false,
  "condition_results": [
    {
      "sensor": "temperature",
      "current_value": 23.5,
      "operator": ">",
      "threshold": 35,
      "result": false
    }
  ]
}
```

### Events

#### GET /api/v1/events
Query event log.

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| event_type | string | - | Filter by event type |
| severity | string | - | Filter by severity |
| device_id | string | - | Filter by device |
| start | string | 24h ago | Start time (ISO 8601) |
| end | string | now | End time (ISO 8601) |
| limit | integer | 100 | Max results |
| offset | integer | 0 | Pagination offset |
| sort | string | -timestamp | Sort field (prefix - for desc) |
| search | string | - | Full-text search |

**Response 200**
```json
{
  "events": [
    {
      "id": "evt_abc123",
      "event_type": "threshold_exceeded",
      "severity": "warning",
      "device_id": "catalyst-mk1-001",
      "message": "Water level below minimum: 8.5 cm",
      "metadata": {"sensor": "water_level", "value": 8.5, "threshold": 10},
      "timestamp": "2024-01-15T09:30:00Z"
    }
  ],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

#### GET /api/v1/events/stats
Get event statistics.

**Response 200**
```json
{
  "by_type": {
    "sensor_reading": 10000,
    "threshold_exceeded": 25,
    "automation_triggered": 10
  },
  "by_severity": {
    "info": 10000,
    "warning": 20,
    "critical": 5,
    "emergency": 0
  },
  "last_24h": 10035
}
```

### WebSocket (Real-time)

#### WS /ws/live
Real-time sensor data and events.

**Connection**
```
WS wss://api.arc-labs.com/ws/live?token=<jwt_token>
```

**Client → Server**
```json
{"type": "ping", "payload": {}}
{"type": "subscribe", "payload": {"topics": ["sensor_readings", "alerts", "events"]}}
{"type": "unsubscribe", "payload": {"topics": ["events"]}}
```

**Server → Client**
```json
{"type": "sensor_reading", "payload": {"sensor_type": "water_level", "value": 45.2, "unit": "cm", "timestamp": "2024-01-15T10:30:00Z", "status": "normal"}}
{"type": "alert", "payload": {"id": "alert_1", "severity": "warning", "message": "Water level low", "sensor": "water_level", "value": 8.5, "threshold": 10, "timestamp": "2024-01-15T10:30:00Z"}}
{"type": "event", "payload": {"id": "evt_1", "event_type": "threshold_exceeded", "severity": "warning", "message": "Water level below minimum", "timestamp": "2024-01-15T10:30:00Z"}}
{"type": "command_ack", "payload": {"command_id": "cmd_123", "success": true, "message": "Pump activated for 30s"}}
{"type": "heartbeat", "payload": {"timestamp": "2024-01-15T10:30:00Z", "server_time": "2024-01-15T10:30:00.001Z"}}
```

## Data Models

### SensorReading
```typescript
interface SensorReading {
  sensor_type: 'water_level' | 'temperature' | 'humidity' | 'gas' | 'battery';
  value: number;
  unit: string;
  timestamp: string; // ISO 8601
  status: 'normal' | 'warning' | 'critical';
  thresholds?: { min?: number; max?: number };
  device_id?: string;
}
```

### DeviceStatus
```typescript
interface DeviceStatus {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error';
  last_seen: string;
  firmware_version: string;
  hardware_version: string;
  sensors: string[];
  actuators: string[];
  config: DeviceConfig;
  metrics?: DeviceMetrics;
}
```

### Alert
```typescript
interface Alert {
  id: string;
  device_id: string;
  rule_id?: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  message: string;
  sensor_type?: string;
  value?: number;
  threshold?: number;
  unit?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolved_by?: string;
}
```

### AutomationRule
```typescript
interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  logic: 'AND' | 'OR';
  cooldown_seconds: number;
  max_executions_per_day?: number;
  execution_count: number;
  last_triggered?: string;
  last_success?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  tags?: string[];
}
```

### EventLog
```typescript
interface EventLog {
  id: string;
  event_type: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  device_id: string;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  correlation_id?: string;
}
```

## WebSocket Message Types

### Client → Server
```typescript
interface WSClientMessage {
  type: 'ping' | 'subscribe' | 'unsubscribe';
  payload?: {
    topics?: ('sensor_readings' | 'alerts' | 'events' | 'device_status')[];
  };
}
```

### Server → Client
```typescript
type WSServerMessage = 
  | { type: 'sensor_reading'; payload: SensorReading }
  | { type: 'device_status'; payload: { device_id: string; status: string; uptime_seconds: number; free_heap: number } }
  | { type: 'alert'; payload: { id: string; severity: string; message: string; sensor?: string; value?: number; threshold?: number; timestamp: string } }
  | { type: 'event'; payload: EventLog }
  | { type: 'command_ack'; payload: { command_id: string; success: boolean; message: string } }
  | { type: 'heartbeat'; payload: { timestamp: string; server_time: string } };
```

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2024-01-15 | Initial API specification |