# ARC LABS Monitoring Platform

> **Environmental monitoring and automation platform for hydroponic/aquaponic systems**

[![CI](https://github.com/arc-labs/monitoring/workflows/CI/badge.svg)](https://github.com/arc-labs/monitoring/actions/workflows/ci.yml)
[![CD Frontend](https://github.com/arc-labs/monitoring/workflows/CD%20Frontend/badge.svg)](https://github.com/arc-labs/monitoring/actions/workflows/cd-frontend.yml)
[![CD Backend](https://github.com/arc-labs/monitoring/workflows/CD%20Backend/badge.svg)](https://github.com/arc-labs/monitoring/actions/workflows/cd-backend.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌱 Overview

ARC LABS Monitoring Platform is a full-stack environmental monitoring system designed for hydroponic, aquaponic, and controlled environment agriculture. It provides real-time sensor monitoring, automated control, alerting, and historical data analysis.

### Key Features

- **Real-time Monitoring**: Water level, temperature, humidity, gas (MQ-2), battery voltage
- **Automated Control**: Pump/valve automation with safety interlocks
- **Alert System**: Configurable thresholds with multi-level severity
- **Event Logging**: Complete audit trail of sensor readings and system events
- **Web Dashboard**: Responsive React dashboard with live charts
- **REST API**: FastAPI backend with OpenAPI documentation
- **WebSocket**: Real-time data streaming to frontend
- **Firmware**: Arduino/PlatformIO firmware for Catalyst Mk1 hardware
- **Offline Support**: PWA with IndexedDB queue for unreliable connections

## 🏗 Architecture

```
┌─────────────┐     Serial (JSON Lines)      ┌─────────────┐
│  Firmware   │ ─────────────────────────────► │   Backend   │
│  (Arduino)  │ ◄───────────────────────────── │  (FastAPI)  │
└─────────────┘      Control Commands          └──────┬──────┘
                                                      │
                        ┌─────────────────────────────┼─────────────┐
                        │                             │             │
                        ▼                             ▼             ▼
                 ┌─────────────┐              ┌─────────────┐ ┌───────────┐
                 │  Frontend   │              │  Database   │ │  Metrics  │
                 │  (React)    │              │  (SQLite)   │ │ (Prometheus)│
                 └─────────────┘              └─────────────┘ └───────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │  WebSocket  │
                 │  (Live Data)│
                 └─────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Query, Zustand, Recharts |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite/PostgreSQL, Uvicorn |
| Firmware | Arduino C++, PlatformIO, JSON Lines protocol |
| Shared | TypeScript types, Zod schemas, Pydantic models |
| Testing | Vitest, Playwright, pytest |
| CI/CD | GitHub Actions, Docker, Vercel |
| DevOps | pnpm workspaces, Husky, ESLint, Prettier |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and pnpm 8+
- Python 3.11+ and Poetry
- Docker & Docker Compose (optional)
- Arduino IDE / PlatformIO (for firmware)

### Local Development

```bash
# Clone and install dependencies
git clone https://github.com/arc-labs/monitoring.git
cd monitoring
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start all services (frontend + backend + database)
pnpm docker:dev

# Or start individually:
# Terminal 1: Backend
pnpm dev:backend

# Terminal 2: Frontend
pnpm dev:frontend
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend Dashboard | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |
| WebSocket | ws://localhost:8000/ws/live |
| Prometheus Metrics | http://localhost:9090 |

## 📦 Project Structure

```
arc-labs-monitoring/
├── .github/workflows/        # CI/CD pipelines
├── .husky/                   # Git hooks
├── docker-compose.yml        # Local development stack
├── docker-compose.prod.yml   # Production stack
├── pnpm-workspace.yaml       # pnpm workspace config
├── package.json              # Root scripts & devDependencies
├── tsconfig.base.json        # Base TypeScript config
├── .eslintrc.js              # ESLint config
├── .prettierrc               # Prettier config
├── .env.example              # Environment variables template
├── README.md                 # This file
├── SETUP.md                  # Hardware & software setup guide
├── CONFIG.md                 # Configuration reference
├── API.md                    # API documentation
├── TROUBLESHOOTING.md        # Common issues & solutions
├── ARCHITECTURE.md           # Architecture decisions & diagrams
├── CHANGELOG.md              # Version history
├── LICENSE                   # MIT License
├── frontend/                 # React + Vite + TypeScript + Tailwind
├── backend/                  # FastAPI + Python
├── shared/                   # Shared types (TS + Python)
├── firmware/                 # Arduino/PlatformIO firmware
├── docs/                     # Documentation & ADRs
├── scripts/                  # Automation scripts
└── .vscode/                  # VS Code workspace settings
```

## 🔧 Development Commands

```bash
# Install all dependencies
pnpm install

# Run all tests
pnpm test

# Run frontend tests only
pnpm test:frontend

# Run backend tests only
pnpm test:backend

# Run firmware tests
pnpm test:firmware

# Run E2E tests
pnpm test:e2e

# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type-check all packages
pnpm typecheck

# Format code
pnpm format

# Build all packages
pnpm build

# Build firmware
pnpm build:firmware

# Database migrations
pnpm db:migrate

# Seed test data
pnpm db:seed

# Backup database
pnpm db:backup
```

## 🐳 Docker Deployment

### Development

```bash
# Start development stack
docker-compose up --build

# Stop and remove volumes
docker-compose down -v
```

### Production

```bash
# Build and start production stack
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production stack
docker-compose -f docker-compose.prod.yml down
```

## 📡 API Reference

See [API.md](API.md) for complete API documentation.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/sensors` | Current sensor readings |
| GET | `/api/v1/sensors/history` | Historical sensor data |
| GET | `/api/v1/devices` | Device status |
| POST | `/api/v1/control/pump` | Control pump |
| POST | `/api/v1/control/relay` | Control relay |
| GET | `/api/v1/config/thresholds` | Get threshold config |
| POST | `/api/v1/config/thresholds` | Update threshold config |
| GET | `/api/v1/rules` | List automation rules |
| POST | `/api/v1/rules` | Create automation rule |
| GET | `/api/v1/events` | Query event log |
| GET | `/api/v1/health` | Health check |
| WS | `/ws/live` | Real-time sensor stream |

## 🔌 Hardware Integration

### Catalyst Mk1 Pinout

| Component | Pin | Description |
|-----------|-----|-------------|
| Water Level Sensor | A0 | Analog input |
| Gas Sensor (MQ-2) | A1 | Analog input |
| DHT11 Temp/Humidity | D2 | Digital input |
| Battery Monitor | A2 | Analog input |
| Pump Relay | D3 | Digital output |
| Valve Relay | D4 | Digital output |
| RFID SS | D10 | SPI SS |
| RFID RST | D9 | Reset |
| Status LED | D13 | Digital output |
| Buzzer | D5 | PWM output |

### Serial Protocol

The firmware communicates via JSON Lines over serial at 115200 baud:

```json
{"type": "sensor_reading", "sensor": "water_level", "value": 45.2, "unit": "cm", "timestamp": 1699900000}
{"type": "sensor_reading", "sensor": "temperature", "value": 23.5, "unit": "°C", "timestamp": 1699900000}
{"type": "sensor_reading", "sensor": "humidity", "value": 65, "unit": "%", "timestamp": 1699900000}
{"type": "sensor_reading", "sensor": "gas", "value": 450, "unit": "ppm", "timestamp": 1699900000}
{"type": "sensor_reading", "sensor": "battery", "value": 3.85, "unit": "V", "timestamp": 1699900000}
{"type": "event", "event_type": "threshold_exceeded", "severity": "warning", "message": "Water level low", "timestamp": 1699900000}
```

Commands from backend to firmware:

```json
{"type": "command", "command": "pump_on", "params": {"duration": 30}}
{"type": "command", "command": "relay_set", "params": {"relay": 1, "state": true}}
{"type": "command", "command": "calibrate", "params": {"sensor": "water_level", "value": 0}}
```

## 🧪 Testing

```bash
# Frontend unit tests
cd frontend && pnpm test

# Frontend E2E tests
cd frontend && pnpm test:e2e

# Backend unit tests
cd backend && poetry run pytest tests/unit -v

# Backend integration tests
cd backend && poetry run pytest tests/integration -v

# Firmware tests
cd firmware && pio test
```

## 📚 Documentation

- [Setup Guide](SETUP.md) - Hardware & software installation
- [Configuration](CONFIG.md) - Environment variables & thresholds
- [API Reference](API.md) - Complete API documentation
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues & solutions
- [Architecture](ARCHITECTURE.md) - System design & ADRs
- [ADR Index](docs/adr/README.md) - Architecture Decision Records

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new sensor type
fix: resolve water level calibration bug
docs: update API documentation
style: format code with prettier
refactor: restructure sensor service
test: add unit tests for alert engine
chore: update dependencies
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Catalyst Mk1 Hardware](https://github.com/arc-labs/catalyst-mk1) - Reference hardware design
- [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [PlatformIO](https://platformio.org/) - Embedded development platform