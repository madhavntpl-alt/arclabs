# Data Model

## Overview
This document describes the data model for the ARC LABS Monitoring Platform, including entity relationships, database schema, and data flow patterns.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ARC LABS DATA MODEL                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────┐       ┌──────────────────┐       ┌─────────────────────┐      │
│  │   Device    │       │  SensorReading   │       │       Event         │      │
│  ├─────────────┤       ├──────────────────┤       ├─────────────────────┤      │
│  │ id (PK)     │◄──────┤ id (PK)          │       │ id (PK)             │      │
│  │ name        │       │ device_id (FK)   │       │ device_id (FK)      │      │
│  │ type        │       │ sensor_type      │       │ event_type          │      │
│  │ status      │       │ value            │       │ severity            │      │
│  │ firmware_v  │       │ unit             │       │ message             │      │
│  │ hardware_v  │       │ timestamp        │       │ metadata            │      │
│  │ config      │       │ status           │       │ timestamp           │      │
│  └──────┬──────┘       │ thresholds       │       │ correlation_id      │      │
│         │              └────────┬─────────┘       └─────────────────────┘      │
│         │                       │                                                │
│         │              ┌────────┴────────┐       ┌─────────────────────┐      │
│         │                       │       └──────────►│      Alert          │      │
│         │              ┌────────▼────────┐       ├─────────────────────┤      │
│         │              │  AutomationRule │       │ id (PK)             │      │
│         │              ├─────────────────┤       │ device_id (FK)      │      │
│         │              │ id (PK)         │       │ rule_id (FK)        │      │
│         │              │ name            │       │ severity            │      │
│         │              │ conditions      │       │ status              │      │
│         │              │ actions         │       │ message             │      │
│         │              │ cooldown        │       │ sensor_type         │      │
│         │              │ cooldown_s      │       │ value               │      │
│         │              │ enabled         │       │ threshold           │      │
│         │              └────────┬────────┘       └─────────────────────┘      │
│         │                       │                                            │
│         │              ┌────────┴────────┐       ┌─────────────────────┐      │
│         │                       │       ◄───────┤  ThresholdConfig    │      │
│         │                       │       ┌───────►│                    │      │
│         │              ┌────────▼────────┐  │    │ water_level_min    │      │
│         │              │  SensorReading  │  │    │ water_level_max    │      │
│         │              ├─────────────────┤  │    │ temp_min           │      │
│         │              │ sensor_type     │  │    │ temp_max           │      │
│         │              │ value           │  │    │ humidity_min       │      │
│         │              │ unit            │  │    │ humidity_max       │      │
│         │              │ timestamp       │  │    │ gas_threshold      │      │
│         │              │ value_raw       │  │    │ battery_min        │      │
│         │              └─────────────────┘  │    │ battery_max        │      │
│         │                                   │    └────────────────────┘      │
│         │                       ┌───────────┴────────┐                       │
│         │                       │   Calibration      │                       │
│         │                       ├────────────────────┤                       │
│         │                       │ sensor_type        │                       │
│         │                       │ slope              │                       │
│         │                       │ offset             │                       │
│         │                       │ r0                 │                       │
│         │                       │ intercept          │                       │
│         │                       │ divider_ratio      │                       │
│         │                       │ adc_ref            │                       │
│         │                       └────────────────────┘                       │
│         │                                                                    │
│         │                       ┌─────────────────────┐                     │
│         └──────────────────────►│    DeviceConfig     │                     │
│                                 ├─────────────────────┤                     │
│                                 │ serial_port         │                     │
│                                 │ baudrate            │                     │
│                                 │ sensors[]           │                     │
│                                 │ actuators[]         │                     │
│                                 │ thresholds{}        │                     │
│                                 │ automation_enabled  │                     │
│                                 └─────────────────────┘                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Core Entities

### Device
```sql
CREATE TABLE devices (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    type            TEXT NOT NULL,          -- 'catalyst_mk1', 'catalyst_mk2', 'generic'
    status          TEXT NOT NULL,          -- 'online', 'offline', 'error', 'updating'
    firmware_version TEXT,
    hardware_version TEXT,
    config_json     JSONB,                  -- DeviceConfig
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### SensorReading (TimescaleDB Hypertable)
```sql
CREATE TABLE sensor_readings (
    time        TIMESTAMPTZ       NOT NULL,
    device_id   TEXT              NOT NULL,
    sensor_type TEXT              NOT NULL,  -- 'water_level', 'temperature', 'humidity', 'gas', 'battery'
    value       DOUBLE PRECISION  NOT NULL,
    unit        TEXT              NOT NULL,
    status      TEXT              NOT NULL,  -- 'normal', 'warning', 'critical'
    thresholds  JSONB,                      -- {min: 10, max: 200}
    device_id FK REFERENCES devices(id)
);

-- Hypertable configuration
SELECT create_hypertable('sensor_readings', 'time', 
    chunk_time_interval => INTERVAL '1 day');
```

### Event (TimescaleDB Hypertable)
```sql
CREATE TABLE events (
    id           TEXT PRIMARY KEY,
    time         TIMESTAMPTZ       NOT NULL,
    device_id    TEXT              NOT NULL,
    event_type   TEXT              NOT NULL,  -- 'sensor_reading', 'threshold_exceeded', 'automation_triggered', etc.
    severity     TEXT              NOT NULL,  -- 'info', 'warning', 'critical', 'emergency'
    message      TEXT              NOT NULL,
    metadata     JSONB,
    correlation_id TEXT,
    device_id FK REFERENCES devices(id)
);

SELECT create_hypertable('events', 'time', 
    chunk_time_interval => INTERVAL '1 day');
```

### Alert
```sql
CREATE TABLE alerts (
    id              TEXT PRIMARY KEY,
    device_id       TEXT NOT NULL,
    rule_id         TEXT,                          -- FK to automation_rules
    severity        TEXT NOT NULL,                 -- 'info', 'warning', 'critical', 'emergency'
    status          TEXT DEFAULT 'active',         -- 'active', 'acknowledged', 'resolved', 'suppressed'
    message         TEXT NOT NULL,
    sensor_type     TEXT,                          -- 'water_level', 'temperature', etc.
    value           DOUBLE PRECISION,              -- Current value when alert triggered
    threshold       DOUBLE PRECISION,              -- Threshold that was exceeded
    unit            TEXT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by TEXT,
    resolved_at     TIMESTAMPTZ,
    resolved_by     TEXT,
    device_id FK REFERENCES devices(id),
    rule_id FK REFERENCES automation_rules(id)
);
```

### AutomationRule
```sql
CREATE TABLE automation_rules (
    id                  TEXT PRIMARY KEY,
    name                TEXT NOT NULL,
    description         TEXT,
    enabled             BOOLEAN DEFAULT TRUE,
    priority            INTEGER DEFAULT 10,        -- Lower = higher priority
    conditions_json     JSONB NOT NULL,            -- Array of Condition objects
    actions_json        JSONB NOT NULL,            -- Array of Action objects
    logic               TEXT DEFAULT 'AND',        -- 'AND' or 'OR'
    cooldown_seconds    INTEGER DEFAULT 60,
    max_executions_per_day INTEGER,               -- Optional daily limit
    execution_count     INTEGER DEFAULT 0,
    last_triggered      TIMESTAMPTZ,
    last_success        TIMESTAMPTZ,
    last_error          TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    created_by          TEXT,
    tags                TEXT[]
);
```

### Condition (embedded in AutomationRule.conditions_json)
```json
{
  "id": "cond_1",
  "type": "sensor",              -- "sensor", "time", "state", "expression"
  "sensor_type": "water_level",  // For sensor type
  "operator": "<",               // "<", "<=", ">", ">=", "==", "!=", "between", "outside"
  "value": 20,                   // Threshold value
  "value_max": 30,               // For "between"/"outside"
  "duration_seconds": 30,        // Must hold for this long
  // For time type:
  "time_start": "08:00",
  "time_end": "18:00",
  "days_of_week": [1,2,3,4,5],   // 0=Sunday
  // For state type:
  "device_id": "device_1",
  "actuator_type": "pump",
  "state": true,
  // For expression type:
  "expression": "sensors.water_level < 20 && sensors.temperature > 25"
}
```

### Action (embedded in AutomationRule.actions_json)
```json
{
  "id": "act_1",
  "type": "pump_on",              // "pump_on", "pump_off", "actuator_set", "actuator_toggle", "notify", "log", "webhook", "set_threshold", "enable_rule", "disable_rule"
  "params": {
    "duration_seconds": 60,       // For pump_on
    "actuator_type": "pump",      // For actuator_set/toggle
    "state": true,                // For actuator_set
    "message": "High temperature!", // For notify
    "severity": "warning",        // For notify
    "channels": ["email", "push"], // For notify
    "log_message": "Auto fan on", // For log
    "log_level": "info",          // For log
    "url": "https://...",         // For webhook
    "method": "POST",             // For webhook
    "headers": {},                // For webhook
    "body": {},                   // For webhook
    "sensor_type": "temperature", // For set_threshold
    "min_value": 18,              // For set_threshold
    "max_value": 25,              // For set_threshold
    "rule_id": "rule_123"         // For enable/disable_rule
  },
  "delay_seconds": 0,             // Optional delay before execution
  "condition": "sensors.humidity > 80"  // Optional conditional execution
}
```

### ThresholdConfig
```sql
CREATE TABLE thresholds (
    id                      TEXT PRIMARY KEY DEFAULT 'default',
    water_level_min_cm      DOUBLE PRECISION,
    water_level_max_cm      DOUBLE PRECISION,
    temp_min_c              DOUBLE PRECISION,
    temp_max_c              DOUBLE PRECISION,
    humidity_min_pct        DOUBLE PRECISION,
    humidity_max_pct        DOUBLE PRECISION,
    gas_threshold_ppm       DOUBLE PRECISION,
    battery_min_v           DOUBLE PRECISION,
    battery_max_v           DOUBLE PRECISION,
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_by              TEXT
);
```

### CalibrationConfig
```sql
CREATE TABLE calibration (
    id                  TEXT PRIMARY KEY,
    sensor_type         TEXT NOT NULL,           -- 'water_level', 'gas', 'temperature', 'humidity', 'battery'
    slope               DOUBLE PRECISION,
    offset              DOUBLE PRECISION,
    r0                  DOUBLE PRECISION,        // Gas sensor R0
    intercept           DOUBLE PRECISION,        // Gas sensor intercept
    divider_ratio       DOUBLE PRECISION,        // Battery divider ratio
    adc_ref             DOUBLE PRECISION,        // ADC reference voltage
    last_calibrated     TIMESTAMPTZ,
    calibrated_by       TEXT
);
```

### DeviceConfig (embedded in Device.config_json)
```json
{
  "serial_port": "/dev/ttyUSB0",
  "baudrate": 115200,
  "sensors": ["water_level", "temperature", "humidity", "gas", "battery"],
  "actuators": ["pump", "valve"],
  "thresholds": {
    "water_level": {"min": 10, "max": 200},
    "temperature": {"min": 0, "max": 50},
    "humidity": {"min": 20, "max": 80},
    "gas": {"max": 1000},
    "battery": {"min": 3.3, "max": 4.2}
  },
  "automation_enabled": true,
  "firmware_update_url": "https://firmware.arc-labs.com/latest"
}
```

### DeviceMetrics
```json
{
  "uptime_seconds": 3600,
  "free_heap": 1234,
  "messages_received": 18000,
  "messages_sent": 150,
  "errors": 0,
  "wifi_rssi": -45,
  "cpu_temperature": 45.5
}
```

## Serial Protocol Messages

### Firmware → Backend
```json
// Sensor Reading
{"type":"sensor_reading","sensor":"water_level","value":45.2,"unit":"cm","timestamp":1699900000}

// Device Status
{"type":"device_status","firmware_version":"1.0.0","hardware_version":"1.0","uptime_seconds":3600,"free_heap":1234,"sensors_active":["water_level","temperature"],"actuators_state":{"pump":false,"valve":false}}

// Event
{"type":"event","event_type":"threshold_exceeded","severity":"warning","message":"Water level low","timestamp":1699900000}

// Command Acknowledgment
{"type":"command_ack","command_id":"cmd_123","success":true,"message":"Pump activated"}

// Heartbeat
{"type":"heartbeat","uptime_seconds":3600,"free_heap":1234}
```

### Backend → Firmware (Commands)
```json
// Pump Control
{"type":"command","command_id":"cmd_123","command":"pump_on","params":{"duration":30}}

// Relay Control
{"type":"command","command_id":"cmd_124","command":"relay_set","params":{"relay":1,"state":true}}

// Calibration
{"type":"command","command_id":"cmd_125","command":"calibrate","params":{"sensor":"water_level","value":0}}

// Reset
{"type":"command","command_id":"cmd_126","command":"reset","params":{}}
```

## Serialization Formats

### Database (PostgreSQL/TimescaleDB)
- Uses native PostgreSQL types
- JSONB for flexible schema fields
- TIMESTAMPTZ for all timestamps
- UUID or TEXT for IDs

### API (JSON)
- camelCase for field names
- ISO 8601 for timestamps
- Numbers as numbers (not strings)
- Enums as strings

### Serial Protocol (Firmware ↔ Backend)
- JSON Lines (newline-delimited JSON)
- CRC32 checksum optional
- Sequence numbers for ordering

### WebSocket (Frontend ↔ Backend)
- Standard JSON over WebSocket
- Binary frames not used
- Text frames only

## Data Flow Patterns

### Sensor Data Flow
```
Firmware (10Hz) 
  → Serial (JSON Lines)
  → Backend SerialManager 
  → Protocol Parser 
  → DataProcessor (calibration, validation)
  → AlertEngine (threshold check)
  → EventStore (persistence)
  → WebSocketManager (broadcast)
  → Frontend (React Query cache update)
```

### Command Flow
```
Frontend (User Action)
  → REST API (POST /control/pump)
  → Backend Validation
  → SerialManager.sendCommand()
  → Firmware (JSON Lines)
  → Actuator Action
  → Firmware ACK
  → Backend CommandAck
  → Frontend (WebSocket command_ack)
```

### Automation Flow
```
Scheduler (1s interval)
  → AutomationEngine.evaluateAll()
  → For each rule:
    → Evaluate conditions
    → Check cooldown
    → Check max executions/day
    → If all met:
      → Execute actions
      → Update rule.last_triggered, execution_count
      → Log AutomationExecution
      → Send commands via SerialManager
```

## Data Retention Policies

| Data Type | Raw Retention | Aggregated Retention | Storage |
|-----------|---------------|---------------------|---------|
| Sensor Readings | 90 days | 5 years (hourly), 10 years (daily) | TimescaleDB |
| Events | 1 year | 5 years | TimescaleDB |
| Alerts | 2 years (active), 90 days (resolved) | 5 years | PostgreSQL |
| Commands | 30 days | 1 year | PostgreSQL |
| Automation Executions | 1 year | 5 years | PostgreSQL |

## Migration Strategy

### SQLite → PostgreSQL/TimescaleDB
1. Enable dual-write in backend
2. Run pgloader for historical data
3. Verify data integrity
4. Switch reads to PostgreSQL
5. Stop SQLite writes

### Schema Migration Tool
- **Alembic** for PostgreSQL schema migrations
- Version-controlled migration scripts
- Automated in CI/CD pipeline

## Backup & Recovery

### Backup Strategy
- **TimescaleDB**: WAL-G continuous archiving to S3
- **PostgreSQL**: pg_dump daily, WAL archiving
- **Config/Secrets**: GitOps (in Git), secrets in 1Password
- **Docker Images**: GHCR with immutable tags

### Recovery Procedures
| Component | RTO | RPO |
|-----------|-----|-----|
| Backend | 15 min | 0 |
| Database | 1 hour | 5 min |
| Frontend | 5 min | 0 |

### Point-in-Time Recovery
```bash
# Restore to specific timestamp
wal-g backup-fetch /var/lib/postgresql/data LATEST
wal-g wal-fetch /var/lib/postgresql/data 2024-01-15T10:30:00Z
```