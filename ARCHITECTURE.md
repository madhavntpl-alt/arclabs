# ARC LABS Monitoring Platform - Architecture

## 🏗 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARC LABS MONITORING PLATFORM                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    Serial/USB     ┌──────────────┐    HTTPS/WSS    ┌──────────────┐
│  │   FIRMWARE   │ ◄────────────────► │   BACKEND    │ ◄─────────────► │  FRONTEND    │
│  │  (Arduino)   │   JSON Lines      │  (FastAPI)   │   REST + WS     │   (React)    │
│  └──────────────┘                   └──────┬───────┘                 └──────────────┘
│                                            │                                    │
│                                            ▼                                    │
│                                   ┌──────────────────┐                          │
│                                   │    DATABASE      │                          │
│                                   │   (SQLite/PG)    │                          │
│                                   └──────────────────┘                          │
│                                            │                                    │
│                                            ▼                                    │
│                                   ┌──────────────────┐                          │
│                                   │   METRICS        │                          │
│                                   │  (Prometheus)    │                          │
│                                   └──────────────────┘                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📦 Component Architecture

### Frontend (React + TypeScript)

```
frontend/src/
├── components/          # Reusable UI components
│   ├── ui/             # Primitives (Button, Card, Modal, etc.)
│   ├── layout/         # Page layout (Header, Sidebar, DashboardLayout)
│   ├── sensors/        # Sensor-specific cards
│   ├── graphs/         # Chart components (Recharts)
│   ├── alerts/         # Alert display & configuration
│   ├── control/        # Pump/relay control panels
│   ├── events/         # Event log & filters
│   └── connection/     # Connection status indicators
├── pages/              # Route-level components
├── hooks/              # Custom React hooks
│   ├── useSensorData.ts      # React Query + WebSocket
│   ├── useWebSocket.ts       # WS connection manager
│   ├── useSerial.ts          # Serial bridge status
│   ├── useTheme.ts           # Dark/light mode
│   └── useOfflineQueue.ts    # IndexedDB offline queue
├── store/              # Zustand state management
│   ├── sensorStore.ts        # Real-time sensor data
│   ├── alertStore.ts         # Active alerts
│   ├── deviceStore.ts        # Device status & config
│   └── uiStore.ts            # Theme, sidebar, modals
├── services/           # API & WebSocket clients
├── types/              # TypeScript interfaces
├── utils/              # Formatters, validators, constants
└── routes.tsx          # React Router v6 configuration
```

**Key Patterns:**
- **React Query** for server state (caching, deduping, background refetch)
- **Zustand** for client state (UI, real-time sensor values)
- **WebSocket** for live data push
- **Tailwind CSS** for styling with design tokens
- **Motion/React** for animations

### Backend (FastAPI + Python)

```
backend/app/
├── api/
│   ├── v1/             # API version 1 routes
│   │   ├── sensors.py      # Sensor readings & history
│   │   ├── devices.py      # Device management
│   │   ├── control.py      # Actuator control
│   │   ├── config.py       # Thresholds & calibration
│   │   ├── rules.py        # Automation rules CRUD
│   │   ├── events.py       # Event log queries
│   │   └── health.py       # Health checks
│   ├── websocket.py    # WebSocket endpoint
│   └── deps.py         # FastAPI dependencies
├── core/
│   ├── config.py       # Pydantic Settings (env vars)
│   ├── security.py     # Rate limiting, CORS, CSP
│   ├── database.py     # SQLAlchemy async engine
│   ├── logging.py      # Structlog configuration
│   └── metrics.py      # Prometheus metrics
├── models/             # Pydantic models (domain entities)
├── schemas/            # OpenAPI schema customization
├── services/           # Business logic
│   ├── serial_manager.py     # Serial port management
│   ├── protocol.py           # JSON Lines parsing
│   ├── data_processor.py     # Validation, transformation
│   ├── alert_engine.py       # Threshold evaluation
│   ├── automation_engine.py  # Rule evaluation
│   ├── event_store.py        # SQLite persistence
│   ├── websocket_manager.py  # WS connection management
│   └── simulator.py          # Mock serial for testing
├── websocket/          # WebSocket internals
│   ├── connection.py   # WS connection wrapper
│   ├── manager.py      # Connection manager
│   └── messages.py     # Outbound message types
├── repositories/       # Data access layer
│   ├── sensor_repo.py
│   ├── event_repo.py
│   ├── rule_repo.py
│   └── base.py
└── main.py             # FastAPI app factory
```

**Key Patterns:**
- **Dependency Injection** via FastAPI `Depends()`
- **Repository Pattern** for data access
- **Service Layer** for business logic
- **Pydantic v2** for validation & serialization
- **SQLAlchemy 2.0** async ORM
- **Structlog** for structured logging

### Firmware (Arduino C++)

```
firmware/src/
├── main.cpp            # Entry point: setup() + loop()
├── config/
│   ├── pins.h          # Pin definitions
│   ├── thresholds.h    # Default thresholds
│   └── constants.h     # Timing, buffer sizes
├── sensors/
│   ├── SensorBase.h    # Common interface
│   ├── WaterLevelSensor.h/.cpp
│   ├── GasSensor.h/.cpp
│   ├── TempHumiditySensor.h/.cpp
│   └── BatteryMonitor.h/.cpp
├── actuators/
│   ├── ActuatorBase.h
│   ├── Relay.h/.cpp
│   └── Pump.h/.cpp
├── comm/
│   ├── SerialProtocol.h/.cpp  # JSON Lines encoding/decoding
│   ├── RFIDReader.h/.cpp
│   └── MessageBuffer.h        # Ring buffer
├── control/
│   ├── AutomationEngine.h/.cpp   # Rule evaluation on device
│   ├── SafetyInterlocks.h/.cpp   # Hardware watchdog, E-stop
│   └── StateMachine.h/.cpp
├── monitoring/
│   ├── DataLogger.h/.cpp     # SD card logging
│   ├── HealthMonitor.h/.cpp  # Uptime, free RAM, errors
│   └── Diagnostics.h/.cpp
└── utils/
    ├── CRC.h/.cpp            # Checksum for serial
    ├── RingBuffer.h/.cpp
    └── TimeUtils.h/.cpp
```

**Key Patterns:**
- **Polymorphism** via base classes for sensors/actuators
- **Ring Buffer** for serial message handling
- **State Machine** for device operation modes
- **Safety Interlocks** as highest priority
- **JSON Lines** protocol for communication

### Shared Types

```
shared/src/
├── types/              # TypeScript interfaces
├── constants/          # Shared constants (sensor types, units)
├── protocol/           # Serial protocol definitions
└── validation/         # Zod (frontend) + Pydantic (backend)
```

---

## 🔄 Data Flow

### Sensor Reading Flow

```
1. Firmware reads sensors (10Hz)
         │
         ▼
2. Firmware encodes as JSON Lines
   {"type":"sensor_reading","sensor":"water_level","value":45.2,"unit":"cm","ts":1234567890}
         │
         ▼
3. SerialManager reads from /dev/ttyUSB0
         │
         ▼
4. Protocol parses JSON Lines, validates checksum
         │
         ▼
5. DataProcessor validates, transforms, applies calibration
         │
         ▼
6. AlertEngine evaluates thresholds
         │
         ├──► If threshold exceeded: Create Alert, store Event
         │
         ▼
7. EventStore persists to SQLite
         │
         ▼
8. WebSocketManager broadcasts to connected clients
         │
         ▼
9. Frontend receives via WebSocket
         │
         ├──► Zustand store updates (real-time)
         │
         ▼
10. React Query cache updates (historical)
         │
         ▼
11. UI re-renders with new data
```

### Control Command Flow

```
1. User clicks "Pump ON" in frontend
         │
         ▼
2. Frontend calls POST /api/v1/control/pump
         │
         ▼
3. Backend validates request, creates Command record
         │
         ▼
4. SerialManager sends JSON Lines command
   {"type":"command","command":"pump_on","params":{"duration":30}}
         │
         ▼
5. Firmware receives, parses, validates
         │
         ▼
6. SafetyInterlocks checks (E-stop, limits)
         │
         ▼
7. Actuator executes (relay ON)
         │
         ▼
8. Firmware sends acknowledgment
   {"type":"command_ack","command_id":"cmd_123","success":true}
         │
         ▼
9. Backend receives ACK, updates command status
         │
         ▼
10. Frontend receives ACK via WebSocket/polling
         │
         ▼
11. UI updates to show pump running
```

### Automation Rule Evaluation

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTOMATION ENGINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Every 1 second (configurable):                             │
│                                                              │
│  1. Get latest sensor readings from SensorStore             │
│                                                              │
│  2. For each enabled rule (priority order):                 │
│     ├─ Check cooldown (last_triggered + cooldown < now)    │
│     │                                                         │
│     ├─ Evaluate ALL conditions (AND logic):                 │
│     │   ├─ Get sensor value                                 │
│     │   ├─ Apply operator (>, <, between, etc.)            │
│     │   ├─ Check duration (condition sustained for X sec)  │
│     │   └─ Result: true/false                               │
│     │                                                         │
│     └─ If ALL conditions true:                              │
│        ├─ Execute actions in order                          │
│        ├─ Update last_triggered = now                       │
│        ├─ Increment trigger_count                           │
│        ├─ Log automation_triggered event                    │
│        └─ Send commands via SerialManager                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡 Security Model

### Threat Model

| Asset | Threat | Mitigation |
|-------|--------|------------|
| Sensor Data | Eavesdropping | HTTPS/WSS in production |
| Control Commands | Unauthorized execution | API keys (planned), rate limiting |
| Device Config | Tampering | Input validation, audit log |
| Firmware | Malicious update | Signed firmware (future) |
| Database | Injection | SQLAlchemy ORM, parameterized queries |

### Current Security Measures

1. **Input Validation**: Pydantic models on all API endpoints
2. **Rate Limiting**: 100 req/min per IP (configurable)
3. **CORS**: Restricted to known origins
4. **CSP Headers**: Content Security Policy
5. **Non-root Containers**: Docker runs as non-root user
6. **Secrets Management**: Environment variables, not in code

### Planned Enhancements

- [ ] JWT authentication with roles (admin, operator, viewer)
- [ ] API key management
- [ ] Signed firmware updates
- [ ] Audit logging for all control actions
- [ ] mTLS for device communication

---

## 📊 Data Model

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Device    │       │  Sensor     │       │   Event     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │       │ id (PK)     │
│ name        │  │    │ device_id(FK)           │ device_id(FK)│
│ type        │  │    │ sensor_type │       │ event_type  │
│ status      │  │    │ value       │       │ severity    │
│ firmware_v  │  │    │ unit        │       │ message     │
│ hardware_v  │  │    │ timestamp   │       │ metadata    │
│ config      │  │    │ status      │       │ timestamp   │
│ created_at  │  │    └─────────────┘       └─────────────┘
└─────────────┘  │
                 │    ┌─────────────┐       ┌─────────────┐
                 └───►│  Threshold  │       │   Alert     │
                      ├─────────────┤       ├─────────────┤
                      │ id (PK)     │       │ id (PK)     │
                      │ sensor_type │──┐    │ rule_id(FK) │
                      │ min_value   │  │    │ severity    │
                      │ max_value   │  │    │ message     │
                      │ severity    │  │    │ acknowledged│
                      └─────────────┘  │    │ created_at  │
                                       │    └─────────────┘
                      ┌─────────────┐  │
                      │ Automation  │  │
                      │   Rule      │──┘
                      ├─────────────┤
                      │ id (PK)     │
                      │ name        │
                      │ enabled     │
                      │ priority    │
                      │ conditions  │
                      │ actions     │
                      │ cooldown    │
                      └─────────────┘
```

### SQLite Schema (Current)

```sql
-- Devices
CREATE TABLE devices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    firmware_version TEXT,
    hardware_version TEXT,
    config_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sensor Readings (time-series, partitioned by day)
CREATE TABLE sensor_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    sensor_type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);
CREATE INDEX idx_sensor_readings_device_time ON sensor_readings(device_id, timestamp);

-- Events
CREATE TABLE events (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata_json TEXT,
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);
CREATE INDEX idx_events_device_time ON events(device_id, timestamp);
CREATE INDEX idx_events_type_severity ON events(event_type, severity);

-- Alerts
CREATE TABLE alerts (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    rule_id TEXT,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    sensor_type TEXT,
    value REAL,
    threshold REAL,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP,
    acknowledged_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Automation Rules
CREATE TABLE automation_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 10,
    conditions_json TEXT NOT NULL,
    actions_json TEXT NOT NULL,
    cooldown_seconds INTEGER DEFAULT 60,
    last_triggered TIMESTAMP,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### PostgreSQL Schema (Production)

- Same tables with `UUID` primary keys
- TimescaleDB hypertable for `sensor_readings`
- Partitioned `events` by month
- Connection pooling via PgBouncer

---

## 🔌 Communication Protocols

### Serial Protocol (JSON Lines)

**Firmware → Backend:**
```json
{"type":"sensor_reading","sensor":"water_level","value":45.2,"unit":"cm","timestamp":1699900000}
{"type":"sensor_reading","sensor":"temperature","value":23.5,"unit":"°C","timestamp":1699900000}
{"type":"sensor_reading","sensor":"humidity","value":65,"unit":"%","timestamp":1699900000}
{"type":"sensor_reading","sensor":"gas","value":450,"unit":"ppm","timestamp":1699900000}
{"type":"sensor_reading","sensor":"battery","value":3.85,"unit":"V","timestamp":1699900000}
{"type":"event","event_type":"threshold_exceeded","severity":"warning","message":"Water level low","timestamp":1699900000}
{"type":"device_status","uptime":3600,"free_heap":1234,"firmware_version":"1.0.0"}
{"type":"command_ack","command_id":"cmd_123","success":true,"message":"Pump activated"}
```

**Backend → Firmware:**
```json
{"type":"command","command":"pump_on","params":{"duration":30}}
{"type":"command","command":"pump_off","params":{}}
{"type":"command","command":"relay_set","params":{"relay":1,"state":true}}
{"type":"command","command":"calibrate","params":{"sensor":"water_level","value":0}}
{"type":"command","command":"reset","params":{}}
{"type":"command","command":"get_status","params":{}}
```

**Checksum (Optional):**
```json
{"type":"sensor_reading","sensor":"water_level","value":45.2,"unit":"cm","timestamp":1699900000,"checksum":"a1b2c3d4"}
```

### WebSocket Protocol

See [API.md](API.md#websocket) for full message specification.

---

## 🚀 Deployment Architecture

### Development

```
Local Machine
├── Frontend (Vite Dev Server)    :5173
├── Backend (Uvicorn + Reload)    :8000
├── Database (SQLite file)        :./data/arc_labs.db
├── Mock Serial (Python script)   :virtual port
└── Prometheus (optional)         :9090
```

### Production (Docker Swarm / Kubernetes)

```
┌────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER (nginx/ALB)               │
│                     Port 80/443                             │
└──────────────────────────┬─────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Frontend     │  │  Frontend     │  │  Frontend     │
│  (Static)     │  │  (Static)     │  │  (Static)     │
│  via CDN      │  │  via CDN      │  │  via CDN      │
└───────────────┘  └───────────────┘  └───────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Backend      │  │  Backend      │  │  Backend      │
│  (FastAPI)    │  │  (FastAPI)    │  │  (FastAPI)    │
│  :8000        │  │  :8000        │  │  :8000        │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌─────────────┐           ┌─────────────┐
       │ PostgreSQL  │           │   Redis     │
       │ (Primary)   │           │  (Cache)    │
       └─────────────┘           └─────────────┘
              │
              ▼
       ┌─────────────┐
       │ PostgreSQL  │
       │ (Replica)   │
       └─────────────┘
```

### Infrastructure Requirements

| Component | Development | Staging | Production |
|-----------|-------------|---------|------------|
| Frontend | Vite Dev | Vercel | Vercel/CDN |
| Backend | Uvicorn (1) | Docker (2) | K8s (3+) |
| Database | SQLite | PostgreSQL | PostgreSQL + Replica |
| Cache | None | Redis | Redis Cluster |
| Metrics | Prometheus | Prometheus | Prometheus + Grafana |
| Logs | stdout | Loki | Loki/ELK |
| Serial | Direct/USB | USB over IP | USB over IP |

---

## 📈 Scalability Considerations

### Horizontal Scaling

- **Backend**: Stateless, scale horizontally behind load balancer
- **WebSocket**: Sticky sessions or Redis pub/sub for multi-instance
- **Database**: Read replicas for sensor history queries
- **Frontend**: Static files served via CDN

### Performance Targets

| Metric | Target |
|--------|--------|
| Sensor data latency | < 500ms (serial → frontend) |
| API response (p95) | < 200ms |
| WebSocket message throughput | 100 msg/sec per instance |
| Database write throughput | 1000 writes/sec |
| Concurrent WebSocket connections | 1000 per instance |

### Bottlenecks & Mitigations

| Bottleneck | Mitigation |
|------------|------------|
| Serial port (single) | One backend instance per device |
| SQLite writes | Batch inserts, WAL mode |
| WebSocket fan-out | Redis pub/sub for multi-instance |
| Large history queries | TimescaleDB, pre-aggregated views |

---

## 🔧 Configuration Management

### Configuration Layers (Priority Order)

1. **Defaults** (code)
2. **Config files** (`.env`, `config.yaml`)
3. **Environment variables** (highest)
4. **Database** (runtime overrides via API)

### Feature Flags

Controlled via environment variables:
- `FEATURE_DARK_MODE`
- `FEATURE_OFFLINE_QUEUE`
- `FEATURE_PWA`
- `FEATURE_AUTOMATION_RULES`
- `FEATURE_CALIBRATION`

---

## 📝 Architecture Decision Records

See [docs/adr/](docs/adr/) for detailed ADRs:

| ADR | Title | Status |
|-----|-------|--------|
| 001 | Frontend Framework: React + Vite | Accepted |
| 002 | Styling: Tailwind CSS | Accepted |
| 003 | State Management: React Query + Zustand | Accepted |
| 004 | Backend Framework: FastAPI | Accepted |
| 005 | Serial Protocol: JSON Lines | Accepted |
| 006 | Real-time Transport: WebSocket | Accepted |
| 007 | Local Database: SQLite | Accepted |
| 008 | Time-series Storage: PostgreSQL + TimescaleDB | Accepted |
| 009 | Authentication: JWT + API Keys | Proposed |
| 010 | Deployment Target: Docker + Vercel | Accepted |
| 011 | Hardware Simulation: Mock Serial Service | Accepted |
| 012 | Safety Interlocks: Firmware + Backend | Accepted |

---

## 🔮 Future Architecture Evolution

### Phase 2 (Multi-Device)
- Device registry service
- MQTT bridge for wireless sensors
- Edge computing on gateway

### Phase 3 (Cloud)
- Multi-tenant architecture
- Device provisioning API
- OTA firmware updates
- Advanced analytics & ML

### Phase 4 (Enterprise)
- RBAC & SSO (OIDC/SAML)
- Audit compliance
- High availability (multi-region)
- Disaster recovery

---

*Last updated: 2024-01-15*