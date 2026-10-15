# ARC LABS Monitoring Platform - API Reference

## 📖 Overview

REST API for the ARC LABS environmental monitoring platform. Built with FastAPI, automatically generates OpenAPI documentation.

### Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8000` |
| Staging | `https://api-staging.arc-labs.com` |
| Production | `https://api.arc-labs.com` |

### Documentation

- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`
- **OpenAPI JSON**: `/openapi.json`

---

## 🔐 Authentication

Currently uses API key authentication (planned for v1.1). For now, all endpoints are public in development.

```bash
# Future: API Key
Authorization: Bearer ak_live_xxxxxxxxxxxx

# Future: JWT
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📡 Endpoints

### Health Checks

#### GET `/health`

System health check.

**Response:**
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

#### GET `/health/serial`

Serial connection health.

**Response:**
```json
{
  "connected": true,
  "port": "/dev/ttyUSB0",
  "baudrate": 115200,
  "last_message": "2024-01-15T10:30:00Z",
  "messages_per_second": 5.2
}
```

---

### Sensors

#### GET `/api/v1/sensors`

Get current readings for all sensors.

**Response:**
```json
{
  "sensors": [
    {
      "sensor_type": "water_level",
      "value": 45.2,
      "unit": "cm",
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "normal",
      "thresholds": {
        "min": 10,
        "max": 200
      }
    },
    {
      "sensor_type": "temperature",
      "value": 23.5,
      "unit": "°C",
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "normal",
      "thresholds": {
        "min": 0,
        "max": 50
      }
    },
    {
      "sensor_type": "humidity",
      "value": 65,
      "unit": "%",
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "normal",
      "thresholds": {
        "min": 20,
        "max": 80
      }
    },
    {
      "sensor_type": "gas",
      "value": 450,
      "unit": "ppm",
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "normal",
      "thresholds": {
        "max": 1000
      }
    },
    {
      "sensor_type": "battery",
      "value": 3.85,
      "unit": "V",
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "normal",
      "thresholds": {
        "min": 3.3,
        "max": 4.2
      }
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

#### GET `/api/v1/sensors/{sensor_type}`

Get current reading for specific sensor.

**Path Parameters:**
- `sensor_type`: `water_level` | `temperature` | `humidity` | `gas` | `battery`

**Response:**
```json
{
  "sensor_type": "water_level",
  "value": 45.2,
  "unit": "cm",
  "timestamp": "2024-01-15T10:30:00Z",
  "status": "normal"
}
```

#### GET `/api/v1/sensors/history`

Get historical sensor data.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sensor_type` | string | required | Sensor type |
| `start` | datetime | 24h ago | Start time (ISO 8601) |
| `end` | datetime | now | End time (ISO 8601) |
| `interval` | string | `1m` | Aggregation interval (`1m`, `5m`, `15m`, `1h`, `1d`) |
| `limit` | integer | `1000` | Max data points |

**Example:**
```bash
curl "http://localhost:8000/api/v1/sensors/history?sensor_type=temperature&start=2024-01-14T00:00:00Z&end=2024-01-15T00:00:00Z&interval=15m"
```

**Response:**
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
    },
    {
      "timestamp": "2024-01-14T00:15:00Z",
      "min": 21.0,
      "max": 23.1,
      "avg": 22.0,
      "count": 15
    }
  ]
}
```

---

### Devices

#### GET `/api/v1/devices`

Get all device statuses.

**Response:**
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

#### GET `/api/v1/devices/{device_id}`

Get specific device details.

**Response:**
```json
{
  "id": "catalyst-mk1-001",
  "name": "Catalyst Mk1 #1",
  "type": "catalyst_mk1",
  "status": "online",
  "last_seen": "2024-01-15T10:30:00Z",
  "firmware_version": "1.0.0",
  "hardware_version": "1.0",
  "sensors": [...],
  "actuators": [...],
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

---

### Control

#### POST `/api/v1/control/pump`

Control water pump.

**Request:**
```json
{
  "action": "on",  // "on" | "off" | "toggle"
  "duration_seconds": 30  // optional, for "on" only
}
```

**Response:**
```json
{
  "success": true,
  "command_id": "cmd_abc123",
  "action": "on",
  "duration_seconds": 30,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### POST `/api/v1/control/relay`

Control relay (valve or other).

**Request:**
```json
{
  "relay": 1,  // 1 = pump, 2 = valve
  "state": true  // true = on, false = off
}
```

**Response:**
```json
{
  "success": true,
  "command_id": "cmd_def456",
  "relay": 1,
  "state": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### POST `/api/v1/control/emergency_stop`

Emergency stop all actuators.

**Request:** (empty body)

**Response:**
```json
{
  "success": true,
  "message": "Emergency stop activated",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### Configuration

#### GET `/api/v1/config/thresholds`

Get current threshold configuration.

**Response:**
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

#### POST `/api/v1/config/thresholds`

Update threshold configuration.

**Request:**
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

**Response:**
```json
{
  "success": true,
  "message": "Thresholds updated",
  "config": {...}
}
```

#### GET `/api/v1/config/calibration`

Get sensor calibration parameters.

**Response:**
```json
{
  "water_level": {
    "slope": 58.0,
    "offset": -2.5
  },
  "gas": {
    "r0": 10.0,
    "slope": -0.45,
    "intercept": 1.2
  },
  "temperature": {
    "offset": 0.0
  },
  "humidity": {
    "offset": 0.0
  },
  "battery": {
    "divider_ratio": 11.0,
    "adc_ref": 5.0,
    "offset": 0.0
  }
}
```

#### POST `/api/v1/config/calibration`

Update sensor calibration.

**Request:**
```json
{
  "water_level": {
    "slope": 58.5,
    "offset": -2.3
  }
}
```

---

### Automation Rules

#### GET `/api/v1/rules`

List all automation rules.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enabled` | boolean | - | Filter by enabled status |
| `limit` | integer | `50` | Max results |
| `offset` | integer | `0` | Pagination offset |

**Response:**
```json
{
  "rules": [
    {
      "id": "rule_001",
      "name": "Low Water Pump",
      "enabled": true,
      "priority": 10,
      "conditions": [
        {
          "sensor": "water_level",
          "operator": "<",
          "value": 20,
          "duration_seconds": 30
        }
      ],
      "actions": [
        {
          "type": "pump_on",
          "params": { "duration_seconds": 60 }
        }
      ],
      "cooldown_seconds": 300,
      "last_triggered": "2024-01-15T09:00:00Z",
      "trigger_count": 5
    }
  ],
  "total": 1
}
```

#### POST `/api/v1/rules`

Create new automation rule.

**Request:**
```json
{
  "name": "High Temp Fan",
  "enabled": true,
  "priority": 20,
  "conditions": [
    {
      "sensor": "temperature",
      "operator": ">",
      "value": 35,
      "duration_seconds": 60
    }
  ],
  "actions": [
    {
      "type": "relay_set",
      "params": { "relay": 2, "state": true }
    }
  ],
  "cooldown_seconds": 600
}
```

#### GET `/api/v1/rules/{rule_id}`

Get specific rule.

#### PUT `/api/v1/rules/{rule_id}`

Update rule.

#### DELETE `/api/v1/rules/{rule_id}`

Delete rule.

#### POST `/api/v1/rules/{rule_id}/test`

Test rule evaluation (dry run).

**Response:**
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

---

### Events

#### GET `/api/v1/events`

Query event log with filters.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `event_type` | string | - | Filter by event type |
| `severity` | string | - | Filter by severity |
| `device_id` | string | - | Filter by device |
| `start` | datetime | 24h ago | Start time |
| `end` | datetime | now | End time |
| `limit` | integer | `100` | Max results |
| `offset` | integer | `0` | Pagination offset |
| `sort` | string | `-timestamp` | Sort field (prefix `-` for desc) |

**Event Types:**
- `sensor_reading` - Periodic sensor data
- `threshold_exceeded` - Threshold breach
- `threshold_cleared` - Back to normal
- `automation_triggered` - Rule executed
- `command_sent` - Control command sent
- `command_ack` - Command acknowledged
- `device_connected` - Device online
- `device_disconnected` - Device offline
- `error` - System error
- `calibration` - Calibration performed

**Severities:** `info`, `warning`, `critical`, `emergency`

**Response:**
```json
{
  "events": [
    {
      "id": "evt_abc123",
      "event_type": "threshold_exceeded",
      "severity": "warning",
      "device_id": "catalyst-mk1-001",
      "message": "Water level below minimum: 8.5 cm",
      "metadata": {
        "sensor": "water_level",
        "value": 8.5,
        "threshold": 10
      },
      "timestamp": "2024-01-15T09:30:00Z"
    }
  ],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

#### GET `/api/v1/events/stats`

Get event statistics.

**Response:**
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

---

### WebSocket

#### WS `/ws/live`

Real-time sensor data stream.

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/live');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log(message);
};
```

**Message Types:**

##### Sensor Reading
```json
{
  "type": "sensor_reading",
  "payload": {
    "sensor_type": "water_level",
    "value": 45.2,
    "unit": "cm",
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "normal"
  }
}
```

##### Device Status
```json
{
  "type": "device_status",
  "payload": {
    "device_id": "catalyst-mk1-001",
    "status": "online",
    "uptime_seconds": 3600,
    "free_heap": 1234
  }
}
```

##### Alert
```json
{
  "type": "alert",
  "payload": {
    "id": "alert_xyz789",
    "severity": "warning",
    "message": "Water level low: 8.5 cm",
    "sensor": "water_level",
    "value": 8.5,
    "threshold": 10,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

##### Event
```json
{
  "type": "event",
  "payload": {
    "id": "evt_abc123",
    "event_type": "threshold_exceeded",
    "severity": "warning",
    "message": "Water level below minimum",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

##### Command Acknowledgment
```json
{
  "type": "command_ack",
  "payload": {
    "command_id": "cmd_abc123",
    "success": true,
    "message": "Pump activated for 30s"
  }
}
```

##### Heartbeat
```json
{
  "type": "heartbeat",
  "payload": {
    "timestamp": "2024-01-15T10:30:00Z",
    "server_time": "2024-01-15T10:30:00.001Z"
  }
}
```

**Client → Server Messages:**

##### Ping
```json
{
  "type": "ping",
  "payload": {}
}
```

##### Subscribe/Unsubscribe
```json
{
  "type": "subscribe",
  "payload": {
    "topics": ["sensor_readings", "alerts", "events"]
  }
}
```

---

## 📊 Data Models

### SensorReading

```typescript
interface SensorReading {
  sensor_type: 'water_level' | 'temperature' | 'humidity' | 'gas' | 'battery';
  value: number;
  unit: string;
  timestamp: string;  // ISO 8601
  status: 'normal' | 'warning' | 'critical';
  thresholds?: {
    min?: number;
    max?: number;
  };
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
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  message: string;
  sensor?: string;
  value?: number;
  threshold?: number;
  timestamp: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
}
```

### AutomationRule

```typescript
interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: Condition[];
  actions: Action[];
  cooldown_seconds: number;
  last_triggered?: string;
  trigger_count: number;
}

interface Condition {
  sensor: string;
  operator: '<' | '<=' | '>' | '>=' | '==' | '!=' | 'between' | 'outside';
  value: number;
  value_max?: number;  // for 'between'/'outside'
  duration_seconds: number;
}

interface Action {
  type: 'pump_on' | 'pump_off' | 'relay_set' | 'notify' | 'log';
  params: Record<string, any>;
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
  metadata?: Record<string, any>;
  timestamp: string;
}
```

### ThresholdConfig

```typescript
interface ThresholdConfig {
  water_level_min_cm: number;
  water_level_max_cm: number;
  temp_min_c: number;
  temp_max_c: number;
  humidity_min_pct: number;
  humidity_max_pct: number;
  gas_threshold_ppm: number;
  battery_min_v: number;
  battery_max_v: number;
}
```

### CalibrationConfig

```typescript
interface CalibrationConfig {
  water_level: { slope: number; offset: number };
  gas: { r0: number; slope: number; intercept: number };
  temperature: { offset: number };
  humidity: { offset: number };
  battery: { divider_ratio: number; adc_ref: number; offset: number };
}
```

---

## ❌ Error Responses

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
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `422` | Validation Error |
| `429` | Rate Limited |
| `500` | Internal Server Error |
| `503` | Service Unavailable |

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request body validation failed |
| `SENSOR_NOT_FOUND` | Sensor type not found |
| `DEVICE_NOT_FOUND` | Device not found |
| `RULE_NOT_FOUND` | Automation rule not found |
| `SERIAL_DISCONNECTED` | Serial connection lost |
| `COMMAND_FAILED` | Command execution failed |
| `CALIBRATION_INVALID` | Invalid calibration parameters |
| `THRESHOLD_INVALID` | Invalid threshold values |

---

## 🔄 Rate Limiting

- **Default**: 100 requests per 60 seconds per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Exceeded**: Returns `429 Too Many Requests` with `Retry-After` header

---

## 📝 Versioning

- **Current**: v1
- **URL Pattern**: `/api/v1/...`
- **Breaking Changes**: New version (v2) with new URL path
- **Deprecation**: 6-month notice before removal

---

## 🧪 Testing

### Example Requests

```bash
# Health check
curl http://localhost:8000/health

# All sensors
curl http://localhost:8000/api/v1/sensors

# Temperature history
curl "http://localhost:8000/api/v1/sensors/history?sensor_type=temperature&interval=1h&limit=24"

# Trigger pump
curl -X POST http://localhost:8000/api/v1/control/pump \
  -H "Content-Type: application/json" \
  -d '{"action": "on", "duration_seconds": 30}'

# Create automation rule
curl -X POST http://localhost:8000/api/v1/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Rule",
    "enabled": true,
    "priority": 10,
    "conditions": [{"sensor": "temperature", "operator": ">", "value": 30, "duration_seconds": 60}],
    "actions": [{"type": "notify", "params": {"message": "High temperature!", "severity": "warning"}}],
    "cooldown_seconds": 300
  }'
```

---

*Auto-generated from OpenAPI spec. Last updated: 2024-01-15*