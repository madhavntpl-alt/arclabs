# ARC LABS Monitoring Platform Monorepo Initialization Plan

## Objective
Initialize a complete monorepo for ARC LABS monitoring platform with three packages:
- **frontend**: React + Vite + TypeScript + Tailwind CSS
- **backend**: FastAPI + Pydantic + SQLAlchemy
- **firmware**: Arduino/PlatformIO (C++)
- **shared**: Shared types package (TypeScript + Python)

With full tooling: ESLint, Prettier, TypeScript strict, Vitest, pytest, Playwright, Husky, GitHub Actions CI, pnpm workspaces.

---

## Phase 1: Foundation & Configuration (Parallel Steps)

### Step 1.1: Root Configuration Files
**Dependencies**: None
**Parallel**: Yes (can run with 1.2, 1.3)
**Model Tier**: Default

**Context Brief**: Create root-level configuration files for the monorepo including package.json, pnpm-workspace.yaml, tsconfig.base.json, ESLint, Prettier, .gitignore, .env.example

**Files to Create**:
- `package.json` - Root scripts, shared devDependencies
- `pnpm-workspace.yaml` - pnpm workspace config
- `tsconfig.base.json` - Base TypeScript config (strict mode)
- `.eslintrc.js` - ESLint config
- `.prettierrc` - Prettier config
- `.gitignore` - Root gitignore
- `.env.example` - All required env vars documented
- `README.md` - Project overview, quick start, architecture
- `SETUP.md` - Hardware + software setup guide
- `CONFIG.md` - Environment variables, thresholds, calibration
- `API.md` - OpenAPI reference placeholder
- `TROUBLESHOOTING.md` - Common issues, logs, recovery
- `ARCHITECTURE.md` - ADR summary, system diagram
- `CHANGELOG.md` - Keep a changelog
- `LICENSE` - MIT license

**Verification**:
```bash
pnpm install  # Should install without errors
pnpm lint     # Should run lint across workspace
```

---

### Step 1.2: GitHub Actions & Husky Setup
**Dependencies**: None
**Parallel**: Yes (can run with 1.1, 1.3)
**Model Tier**: Default

**Context Brief**: Create CI/CD workflows and git hooks

**Files to Create**:
- `.github/workflows/ci.yml` - CI: lint, typecheck, test, build
- `.github/workflows/cd-frontend.yml` - Deploy frontend to Vercel
- `.github/workflows/cd-backend.yml` - Build/push backend Docker image
- `.github/workflows/dependabot.yml` - Auto-updates
- `.husky/pre-commit` - Lint + format + typecheck staged files
- `.husky/commit-msg` - Conventional commits validation

**Verification**:
```bash
# Husky should be installed and hooks executable
ls -la .husky/
```

---

### Step 1.3: Docker Configuration
**Dependencies**: None
**Parallel**: Yes (can run with 1.1, 1.2)
**Model Tier**: Default

**Context Brief**: Create Docker Compose files for local development and production

**Files to Create**:
- `docker-compose.yml` - Local dev: frontend + backend + mock serial + SQLite
- `docker-compose.prod.yml` - Production stack (backend + db + reverse proxy)
- `backend/Dockerfile` - Backend container
- `backend/.dockerignore` - Docker ignore patterns

**Verification**:
```bash
docker-compose config  # Should validate without errors
```

---

## Phase 2: Shared Types Package

### Step 2.1: Shared Package Structure & Types
**Dependencies**: Step 1.1 (root config)
**Parallel**: No
**Model Tier**: Default

**Context Brief**: Create shared types package with TypeScript and Python definitions

**Files to Create**:
- `shared/package.json` - Package config
- `shared/pyproject.toml` - Python package config
- `shared/src/types/sensor.ts` - Sensor types
- `shared/src/types/device.ts` - Device types
- `shared/src/types/alert.ts` - Alert types
- `shared/src/types/event.ts` - Event types
- `shared/src/types/automation.ts` - Automation types
- `shared/src/types/index.ts` - Barrel export
- `shared/src/constants/sensor-types.ts` - Sensor type constants
- `shared/src/constants/units.ts` - Unit constants
- `shared/src/constants/default-thresholds.ts` - Default thresholds
- `shared/src/constants/index.ts` - Barrel export
- `shared/src/protocol/serial-protocol.ts` - Serial protocol types
- `shared/src/protocol/message-types.ts` - Message type definitions
- `shared/src/protocol/index.ts` - Barrel export
- `shared/src/validation/zod-schemas.ts` - Frontend Zod validation
- `shared/src/validation/pydantic-models.py` - Backend Pydantic validation
- `shared/tests/types.test.ts` - Type tests
- `shared/.gitignore`

**Verification**:
```bash
cd shared && pnpm install && pnpm typecheck
```

---

## Phase 3: Frontend Package (React + Vite + TypeScript + Tailwind)

### Step 3.1: Frontend Package Config & Build Setup
**Dependencies**: Step 1.1, Step 2.1
**Parallel**: No
**Model Tier**: Default

**Context Brief**: Create frontend package configuration and build setup

**Files to Create**:
- `frontend/package.json` - Package config with React, Vite, Tailwind, React Query, Zustand, Recharts
- `frontend/tsconfig.json` - Extends tsconfig.base.json
- `frontend/vite.config.ts` - Vite + React + Tailwind + path aliases
- `frontend/tailwind.config.js` - Tailwind + design tokens
- `frontend/postcss.config.js` - PostCSS config
- `frontend/index.html` - HTML entry
- `frontend/public/favicon.ico` - Favicon
- `frontend/public/manifest.json` - PWA manifest
- `frontend/.gitignore`

**Verification**:
```bash
cd frontend && pnpm install && pnpm build
```

---

### Step 3.2: Frontend Core - Entry, Styles, Routing, Providers
**Dependencies**: Step 3.1
**Parallel**: No
**Model Tier**: Default

**Context Brief**: Create core frontend files: entry point, app root, styles, routing

**Files to Create**:
- `frontend/src/main.tsx` - Entry point
- `frontend/src/App.tsx` - Root component + providers
- `frontend/src/vite-env.d.ts` - Vite env types
- `frontend/src/routes.tsx` - React Router v6 routes
- `frontend/src/styles/globals.css` - Tailwind imports + CSS variables
- `frontend/src/styles/design-tokens.css` - Design tokens (from design-system skill)
- `frontend/src/styles/animations.css` - Motion keyframes

**Verification**:
```bash
cd frontend && pnpm dev  # Should start dev server
```

---

### Step 3.3: Frontend UI Primitives & Layout Components
**Dependencies**: Step 3.2
**Parallel**: Yes (can run with 3.4)
**Model Tier**: Default

**Context Brief**: Create reusable UI primitive components and layout components

**Files to Create**:
- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Card.tsx`
- `frontend/src/components/ui/Badge.tsx`
- `frontend/src/components/ui/Modal.tsx`
- `frontend/src/components/ui/Tooltip.tsx`
- `frontend/src/components/ui/Select.tsx`
- `frontend/src/components/ui/Slider.tsx`
- `frontend/src/components/ui/Toggle.tsx`
- `frontend/src/components/ui/index.ts` - Barrel export
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/layout/Footer.tsx`
- `frontend/src/components/layout/DashboardLayout.tsx`
- `frontend/src/components/layout/index.ts` - Barrel export

**Verification**:
```bash
cd frontend && pnpm test:ui  # Unit tests for UI components
```

---

### Step 3.4: Frontend Sensor, Graph, Alert, Control, Event Components
**Dependencies**: Step 3.2
**Parallel**: Yes (can run with 3.3)
**Model Tier**: Default

**Context Brief**: Create domain-specific components for sensors, graphs, alerts, control, events, connection

**Files to Create**:
- `frontend/src/components/sensors/SensorCard.tsx`
- `frontend/src/components/sensors/WaterLevelCard.tsx`
- `frontend/src/components/sensors/TempHumidityCard.tsx`
- `frontend/src/components/sensors/GasCard.tsx`
- `frontend/src/components/sensors/BatteryCard.tsx`
- `frontend/src/components/sensors/index.ts`
- `frontend/src/components/graphs/SensorGraph.tsx`
- `frontend/src/components/graphs/TimeRangeSelector.tsx`
- `frontend/src/components/graphs/index.ts`
- `frontend/src/components/alerts/AlertPanel.tsx`
- `frontend/src/components/alerts/AlertItem.tsx`
- `frontend/src/components/alerts/ThresholdConfigModal.tsx`
- `frontend/src/components/alerts/index.ts`
- `frontend/src/components/control/ControlPanel.tsx`
- `frontend/src/components/control/PumpOverride.tsx`
- `frontend/src/components/control/AutomationRules.tsx`
- `frontend/src/components/control/RuleBuilder.tsx`
- `frontend/src/components/control/index.ts`
- `frontend/src/components/events/EventLog.tsx`
- `frontend/src/components/events/EventFilters.tsx`
- `frontend/src/components/events/index.ts`
- `frontend/src/components/connection/ConnectionStatus.tsx`
- `frontend/src/components/connection/ReconnectingIndicator.tsx`
- `frontend/src/components/connection/index.ts`
- `frontend/src/components/index.ts` - Main barrel export

**Verification**:
```bash
cd frontend && pnpm test:components
```

---

### Step 3.5: Frontend Pages
**Dependencies**: Step 3.3, Step 3.4
**Parallel**: No
**Model Tier**: Default

**Context Brief**: Create page components for each route

**Files to Create**:
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/Alerts.tsx`
- `frontend/src/pages/Control.tsx`
- `frontend/src/pages/Events.tsx`
- `frontend/src/pages/Settings.tsx`
- `frontend/src/pages/Calibration.tsx`

**Verification**:
```bash
cd frontend && pnpm build  # Should build without errors
```

---

### Step 3.6: Frontend Hooks, Store, Services, Types, Utils
**Dependencies**: Step 3.2, Step 2.1
**Parallel**: No
**Model Tier**: Default

**Context Brief**: Create custom hooks, Zustand stores, API services, types, and utilities

**Files to Create**:
- `frontend/src/hooks/useSensorData.ts`
- `frontend/src/hooks/useWebSocket.ts`
- `frontend/src/hooks/useSerial.ts`
- `frontend/src/hooks/useTheme.ts`
- `frontend/src/hooks/useOfflineQueue.ts`
- `frontend/src/hooks/index.ts`
- `frontend/src/store/sensorStore.ts`
- `frontend/src/store/alertStore.ts`
- `frontend/src/store/deviceStore.ts`
- `frontend/src/store/uiStore.ts`
- `frontend/src/store/index.ts`
- `frontend/src/services/api.ts`
- `frontend/src/services/websocket.ts`
- `frontend/src/services/offline.ts`
- `frontend/src/types/sensor.ts`
- `frontend/src/types/device.ts`
- `frontend/src/types/alert.ts`
- `frontend/src/types/event.ts`
- `frontend/src/types/automation.ts`
- `frontend/src/types/index.ts`
- `frontend/src/utils/formatters.ts`
- `frontend/src/utils/validators.ts`
- `frontend/src/utils/constants.ts`
- `frontend/src/utils/cn.ts`
- `frontend/src/utils/index.ts`

**Verification**:
```bash
cd frontend && pnpm test && pnpm typecheck
```

---

### Step 3.7: Frontend Tests (Vitest + Playwright)
**Dependencies**: Step 3.3, 3.4, 3.5, 3.6
**Parallel**: No
**Model Tier**: Default

**Context Brief**: Create test files for components, hooks, store, utils, and E2E tests

**Files to Create**:
- `frontend/tests/setup.ts` - Vitest setup
- `frontend/tests/components/sensors/*.test.tsx`
- `frontend/tests/components/graphs/*.test.tsx`
- `frontend/tests/components/alerts/*.test.tsx`
- `frontend/tests/components/control/*.test.tsx`
- `frontend/tests/components/events/*.test.tsx`
- `frontend/tests/hooks/*.test.ts`
- `frontend/tests/store/*.test.ts`
- `frontend/tests/utils/*.test.ts`
- `frontend/tests/integration/*.test.tsx`
- `frontend/playwright/tests/dashboard.spec.ts`
- `frontend/playwright/tests/alerts.spec.ts`
- `frontend/playwright/tests/control.spec.ts`
- `frontend/playwright/tests/events.spec.ts`
- `frontend/playwright/tests/responsive.spec.ts`
- `frontend/playwright/fixtures/test-data.ts`
- `frontend/playwright/playwright.config.ts`

**Verification**:
```bash
cd frontend && pnpm test && pnpm test:e2e
```

---

## Phase 4: Backend Package (FastAPI + Python)

### Step 4.1: Backend Package Config & Core Setup
**Dependencies**: Step 1.1, Step 2.1
**Parallel**: No
**Model Tier**: Default

**Context Brief**: Create backend package configuration and core FastAPI setup

**Files to Create**:
- `backend/pyproject.toml` - Poetry/PDM config
- `backend/Dockerfile` - Already in 1.3 but ensure it's complete
- `backend/.dockerignore` - Already in 1.3
- `backend/alembic.ini` - For future PostgreSQL migrations
- `backend/app/__init__.py`
- `backend/app/main.py` - FastAPI app factory
- `backend/app/core/__init__.py`
- `backend/app/core/config.py` - Pydantic Settings
- `backend/app/core/security.py` - Rate limiting, CORS, CSP
- `backend/app/core/database.py` - SQLAlchemy async engine + session
- `backend/app/core/logging.py` - Structlog configuration
- `backend/app/core/metrics.py` - Prometheus metrics
- `backend/app/api/__init__.py`
- `backend/app/api/deps.py` - FastAPI dependencies
- `backend/.gitignore`

**Verification**:
```bash
cd backend && poetry install && poetry run python -m app.main
```

---

### Step 4.2: Backend Models & Schemas
**Dependencies**: Step 4.1
**Parallel**: Yes (can run with 4.3)
**Model Tier**: Default

**Context Brief**: Create Pydantic models for all domain entities

**Files to Create**:
- `backend/app/models/__init__.py`
- `backend/app/models/base.py` - BaseModel with common config
- `backend/app/models/sensor.py` - SensorReading, SensorType, SensorHistory
- `backend/app/models/device.py` - DeviceStatus, DeviceConfig
- `backend/app/models/alert.py` - Alert, ThresholdConfig, Severity
- `backend/app/models/event.py` - EventLog, EventType, EventQuery
- `backend/app/models/automation.py` - AutomationRule, Condition, Action
- `backend/app/schemas/__init__.py`
- `backend/app/schemas/openapi.py` - OpenAPI customization

**Verification**:
```bash
cd backend && poetry run python -c "from app.models import *; print('Models OK')"
```

---

### Step 4.3: Backend API Routes (v1)
**Dependencies**: Step 4.1
**Parallel**: Yes (can run with 4.2)
**Model Tier**: Default

**Context Brief**: Create all API v1 route modules

**Files to Create**:
- `backend/app/api/v1/__init__.py`
- `backend/app/api/v1/router.py` - APIRouter with all v1 routes
- `backend/app/api/v1/sensors.py` - GET /sensors, /sensors/history
- `backend/app/api/v1/devices.py` - GET /devices, GET /devices/{id}
- `backend/app/api/v1/control.py` - POST /control/pump, /control/relay
- `backend/app/api/v1/config.py` - GET/POST /config/thresholds
- `backend/app/api/v1/rules.py` - CRUD /rules
- `backend/app/api/v1/events.py` - GET /events (paginated, filtered)
- `backend/app/api/v1/health.py` - GET /health, /health/serial

**Verification**:
```bash
cd backend && poetry run python -c "from app.api.v1.router import router; print('Routes OK')"
```

---

### Step 4.4: Backend WebSocket & Real-time
**Dependencies**: Step 4.1
**Parallel**: No
**Model Tier**: Default

**Context Brief**: Create WebSocket endpoint and connection management

**Files to Create**:
- `backend/app/api/websocket.py` - WS /ws/live endpoint
- `backend/app/websocket/__init__.py`
- `backend/app/websocket/connection.py` - WebSocketConnection wrapper
- `backend/app/websocket/manager.py` - ConnectionManager
- `backend/app/websocket/messages.py` - Outbound message types

**Verification**:
```bash
cd backend && poetry run python -c "from app.websocket.manager import ConnectionManager; print('WS OK')"
```

---

### Step 4.5: Backend Services (Serial, Protocol, Data Processing, Alerts, Automation, Events)
**Dependencies**: Step 4.1, Step 4.2
**Parallel**: No
**Model Tier**: Strongest (complex business logic)

**Context Brief**: Create core backend services for serial communication, data processing, alerting, automation

**Files to Create**:
- `backend/app/services/__init__.py`
- `backend/app/services/serial_manager.py` - SerialManager: connect, parse, reconnect
- `backend/app/services/protocol.py` - JSON Lines parser, checksum, framing
- `backend/app/services/data_processor.py` - Validation, transformation, aggregation
- `backend/app/services/alert_engine.py` - Threshold evaluation, alert lifecycle
- `backend/app/app/services/automation_engine.py` - Rule evaluation, execution, cooldown
- `backend/app/services/event_store.py` - SQLite persistence, query, rotation
- `backend/app/services/websocket_manager.py` - Connection manager, broadcast, heartbeat
- `backend/app/services/simulator.py` - Mock serial data for CI/testing

**Verification**:
```bash
cd backend && poetry run pytest tests/unit/ -v
```

---

### Step 4.6: Backend Repositories
**Dependencies**: Step 4.1, Step 4.2
**Parallel**: Yes (can run with 4.5)
**Model Tier**: Default

**Context Brief**: Create repository layer for data access

**Files to Create**:
- `backend/app/repositories/__init__.py`
- `backend/app/repositories/base.py` - BaseRepository with common CRUD
- `backend/app/repositories/sensor_repo.py`
- `backend/app/repositories/event_repo.py`
- `backend/app/repositories/rule_repo.py`

**Verification**:
```bash
cd backend && poetry run python -c "from app.repositories import *; print('Repos OK')"
```

---

### Step 4.7: Backend Tests (pytest)
**Dependencies**: Step 4.2, 4.3, 4.4, 4.5, 4.6
**Parallel**: No
**Model Tier**: Default

**Context Brief**: Create unit and integration tests for backend

**Files to Create**:
- `backend/tests/conftest.py` - Pytest fixtures
- `backend/tests/unit/test_serial_manager.py`
- `backend/tests/unit/test_protocol.py`
- `backend/tests/unit/test_alert_engine.py`
- `backend/tests/unit/test_automation_engine.py`
- `backend/tests/unit/test_data_processor.py`
- `backend/tests/unit/test_event_store.py`
- `backend/tests/integration/test_api_sensors.py`
- `backend/tests/integration/test_api_control.py`
- `backend/tests/integration/test_websocket.py`
- `backend/tests/integration/test_serial_integration.py`
- `backend/tests/hardware/test_catalyst_mk1.py` - Marked with @pytest.mark.hardware
- `backend/tests/hardware/conftest.py`
- `backend/tests/fixtures/sample_readings.jsonl`
- `backend/tests/fixtures/test_config.yaml`
- `backend/scripts/migrate.py` - Alembic wrapper
- `backend/scripts/seed.py` - Seed test data
- `backend/scripts/dev_serial.py` - Run simulator
- `backend/scripts/backup.py` - SQLite backup

**Verification**:
```bash
cd backend && poetry run pytest tests/ -v --cov=app
```

---

## Phase 5: Firmware Package (Arduino/PlatformIO)

### Step 5.1: Firmware PlatformIO Config & Core Structure
**Dependencies**: Step 1.1
**Parallel**: No
**Model Tier**: Default

**Context Brief**: Create PlatformIO configuration and core firmware structure

**Files to Create**:
- `firmware/platformio.ini` - PlatformIO config (Arduino Uno, libs)
- `firmware/src/main.cpp` - Entry point: setup() + loop()
- `firmware/src/config/pins.h` - Pin definitions
- `firmware/src/config/thresholds.h` - Default thresholds
- `firmware/src/config/constants.h` - Timing, buffer sizes
- `firmware/src/sensors/SensorBase.h` - Common interface
- `firmware/src/actuators/ActuatorBase.h` - Common interface
- `firmware/src/utils/CRC.h/.cpp` - Checksum for serial
- `firmware/src/utils/RingBuffer.h/.cpp` - Ring buffer
- `firmware/src/utils/TimeUtils.h/.cpp` - Time utilities
- `firmware/.gitignore`

**Verification**:
```bash
cd firmware && pio run  # Should compile
```

---

### Step 5.2: Firmware Sensor Implementations
**Dependencies**: Step 5.1
**Parallel**: Yes (can run with 5.3, 5.4)
**Model Tier**: Default

**Context Brief**: Create sensor driver implementations

**Files to Create**:
- `firmware/src/sensors/WaterLevelSensor.h/.cpp`
- `firmware/src/sensors/GasSensor.h/.cpp` - MQ-2
- `firmware/src/sensors/TempHumiditySensor.h/.cpp` - DHT11
- `firmware/src/sensors/BatteryMonitor.h/.cpp`

**Verification**:
```bash
cd firmware && pio run
```

---

### Step 5.3: Firmware Actuator Implementations
**Dependencies**: Step 5.1
**Parallel**: Yes (can run with 5.2, 5.4)
**Model Tier**: Default

**Context Brief**: Create actuator driver implementations

**Files to Create**:
- `firmware/src/actuators/Relay.h/.cpp`
- `firmware/src/actuators/Pump.h/.cpp`

**Verification**:
```bash
cd firmware && pio run
```

---

### Step 5.4: Firmware Communication & Protocol
**Dependencies**: Step 5.1
**Parallel**: Yes (can run with 5.2, 5.3)
**Model Tier**: Default

**Context Brief**: Create serial communication and protocol handling

**Files to Create**:
- `firmware/src/comm/SerialProtocol.h/.cpp` - JSON Lines encoding/decoding
- `firmware/src/comm/RFIDReader.h/.cpp` - RFID handling
- `firmware/src/comm/MessageBuffer.h` - Ring buffer for incoming

**Verification**:
```bash
cd firmware && pio run
```

---

### Step 5.5: Firmware Control, Safety, Monitoring
**Dependencies**: Step 5.1, Step 5.2, 5.3, 5.4
**Parallel**: No
**Model Tier**: Strongest (safety-critical)

**Context Brief**: Create automation engine, safety interlocks, state machine, monitoring

**Files to Create**:
- `firmware/src/control/AutomationEngine.h/.cpp` - Rule evaluation on device
- `firmware/src/control/SafetyInterlocks.h/.cpp` - Hardware watchdog, E-stop
- `firmware/src/control/StateMachine.h/.cpp`
- `firmware/src/monitoring/DataLogger.h/.cpp` - SD card logging (optional)
- `firmware/src/monitoring/HealthMonitor.h/.cpp` - Uptime, free RAM, errors
- `firmware/src/monitoring/Diagnostics.h/.cpp`

**Verification**:
```bash
cd firmware && pio run && pio test
```

---

### Step 5.6: Firmware Tests & Documentation
**Dependencies**: Step 5.5
**Parallel**: No
**Model Tier**: Default

**Context Brief**: Create firmware tests and documentation

**Files to Create**:
- `firmware/test/test_serial_protocol.cpp`
- `firmware/test/test_sensors.cpp`
- `firmware/test/test_actuators.cpp`
- `firmware/test/test_safety.cpp`
- `firmware/docs/pinout.md` - Pin assignments
- `firmware/docs/protocol.md` - Serial protocol spec
- `firmware/docs/wiring.md` - Wiring diagrams

**Verification**:
```bash
cd firmware && pio test
```

---

## Phase 6: Documentation & ADRs

### Step 6.1: ADR Documents
**Dependencies**: Step 1.1
**Parallel**: Yes (can run with 6.2)
**Model Tier**: Default

**Context Brief**: Create Architecture Decision Records

**Files to Create**:
- `docs/adr/001-frontend-framework.md`
- `docs/adr/002-styling-approach.md`
- `docs/adr/003-state-management.md`
- `docs/adr/004-backend-framework.md`
- `docs/adr/005-serial-protocol.md`
- `docs/adr/006-realtime-transport.md`
- `docs/adr/007-local-database.md`
- `docs/adr/008-timeseries-storage.md`
- `docs/adr/009-authentication.md`
- `docs/adr/010-deployment-target.md`
- `docs/adr/011-hardware-simulation.md`
- `docs/adr/012-safety-interlocks.md`
- `docs/adr/README.md` - ADR index

**Verification**:
```bash
ls docs/adr/ | wc -l  # Should be 13 files (12 ADRs + README)
```

---

### Step 6.2: Additional Documentation
**Dependencies**: Step 1.1
**Parallel**: Yes (can run with 6.1)
**Model Tier**: Default

**Context Brief**: Create additional project documentation

**Files to Create**:
- `docs/hardware-interface.md`
- `docs/api-contract.md`
- `docs/data-model.md`
- `docs/deployment/vercel.md`
- `docs/deployment/systemd.md`
- `docs/deployment/docker.md`
- `docs/deployment/rollback.md`
- `docs/architecture/system-overview.md`
- `docs/architecture/data-flow.md`
- `docs/architecture/security-model.md`

**Verification**:
```bash
ls docs/**/*.md | wc -l  # Should have all doc files
```

---

## Phase 7: Root Scripts & VS Code Config

### Step 7.1: Root Automation Scripts
**Dependencies**: Step 1.1
**Parallel**: Yes (can run with 7.2)
**Model Tier**: Default

**Context Brief**: Create root-level automation scripts

**Files to Create**:
- `scripts/dev.sh` - Start all dev services
- `scripts/build.sh` - Build all packages
- `scripts/test.sh` - Run all tests
- `scripts/lint.sh` - Lint all packages
- `scripts/deploy-frontend.sh`
- `scripts/deploy-backend.sh`
- `scripts/backup.sh`

**Verification**:
```bash
chmod +x scripts/*.sh && ./scripts/build.sh
```

---

### Step 7.2: VS Code Workspace Settings
**Dependencies**: Step 1.1
**Parallel**: Yes (can run with 7.1)
**Model Tier**: Default

**Context Brief**: Create VS Code workspace configuration

**Files to Create**:
- `.vscode/settings.json`
- `.vscode/launch.json` - Debug configs
- `.vscode/extensions.json` - Recommended extensions
- `.vscode/tasks.json` - Build/test tasks

**Verification**:
```bash
ls .vscode/
```

---

## Summary

**Total Steps**: 25 steps across 7 phases
**Parallel Groups**:
- Phase 1: Steps 1.1, 1.2, 1.3 (3-way parallel)
- Phase 3: Steps 3.3, 3.4 (2-way parallel)
- Phase 4: Steps 4.2, 4.3 (2-way parallel), Step 4.6 (with 4.5)
- Phase 5: Steps 5.2, 5.3, 5.4 (3-way parallel)
- Phase 6: Steps 6.1, 6.2 (2-way parallel)
- Phase 7: Steps 7.1, 7.2 (2-way parallel)

**Estimated Duration**: 4 weeks (as specified)
**Critical Path**: 1.1 → 2.1 → 3.1 → 3.2 → 3.3/3.4 → 3.5 → 3.6 → 3.7 (Frontend) AND 1.1 → 2.1 → 4.1 → 4.2/4.3 → 4.4 → 4.5 → 4.7 (Backend) AND 1.1 → 5.1 → 5.2/5.3/5.4 → 5.5 → 5.6 (Firmware)

---

## Gate 1: Plan Approval
Review this plan and confirm before implementation begins.

## Gate 2: Pre-Commit Verification
After all steps complete, verify:
- `pnpm install` works at root
- `pnpm build` works at root
- `pnpm test` works at root
- `pnpm lint` works at root
- All packages have valid package.json/pyproject.toml
- Docker compose validates
- GitHub Actions workflows are syntactically correct