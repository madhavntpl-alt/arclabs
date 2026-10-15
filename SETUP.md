# ARC LABS Monitoring Platform - Setup Guide

## 🖥 Hardware Requirements

### Catalyst Mk1 Controller Board

| Component | Specification | Notes |
|-----------|---------------|-------|
| Microcontroller | ATmega328P (Arduino Uno compatible) | 16 MHz, 32KB Flash, 2KB RAM |
| USB Interface | CH340G / CP2102 | USB-to-Serial converter |
| Power Input | 7-12V DC (barrel jack) or 5V USB | Regulated 5V output for sensors |
| Sensor Ports | 4x 3-pin (GND, VCC, SIG) | 5V logic level |
| Actuator Ports | 2x Relay modules (5V coil) | Opto-isolated |
| RFID Reader | RC522 module (SPI) | Optional |
| Status Indicators | Power LED, Status LED (D13), Buzzer (D5) | |

### Sensors (Required)

| Sensor | Model | Interface | Pins | Range |
|--------|-------|-----------|------|-------|
| Water Level | Ultrasonic (JSN-SR04T) or Pressure | Analog (0-5V) | A0 | 0-300 cm |
| Gas (Air Quality) | MQ-2 | Analog (0-5V) | A1 | 200-10000 ppm |
| Temperature/Humidity | DHT11 or DHT22 | Digital (1-Wire) | D2 | -40-80°C, 0-100% RH |
| Battery Voltage | Voltage Divider | Analog (0-5V) | A2 | 0-5V (measures up to 25V) |

### Actuators (Required)

| Actuator | Model | Interface | Pin | Rating |
|----------|-------|-----------|-----|--------|
| Pump Relay | 5V Relay Module | Digital | D3 | 10A/250VAC |
| Valve Relay | 5V Relay Module | Digital | D4 | 10A/250VAC |

### Optional Components

| Component | Model | Interface | Pins | Purpose |
|-----------|-------|-----------|------|---------|
| RFID Reader | RC522 | SPI | D10 (SS), D9 (RST), D11 (MOSI), D12 (MISO), D13 (SCK) | User authentication |
| SD Card Module | Standard | SPI | Shared with RFID | Data logging |
| Additional Relays | 5V Relay Module | Digital | D6, D7 | Extra actuators |

## 🔧 Software Requirements

### Development Machine

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | 20.x LTS | `nvm install 20` or [nodejs.org](https://nodejs.org/) |
| pnpm | 8.x | `npm install -g pnpm` |
| Python | 3.11+ | `pyenv install 3.11` or [python.org](https://python.org/) |
| Poetry | 1.7+ | `pipx install poetry` |
| Docker | 24+ | [docker.com](https://docker.com/) |
| Docker Compose | 2.20+ | Included with Docker Desktop |
| PlatformIO | 6.1+ | `pipx install platformio` or VS Code extension |
| Git | 2.40+ | [git-scm.com](https://git-scm.com/) |
| VS Code | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |

### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "ms-azuretools.vscode-docker",
    "platformio.platformio-ide",
    "github.vscode-github-actions",
    "ms-vscode.test-adapter-converter"
  ]
}
```

## 🛠 Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/arc-labs/monitoring.git
cd monitoring
```

### 2. Install Root Dependencies

```bash
pnpm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

**Required changes for local development:**
```bash
# .env
SERIAL_PORT=/dev/ttyUSB0        # Linux/Mac: check with `ls /dev/tty*`
# SERIAL_PORT=COM3              # Windows: check Device Manager
SERIAL_BAUDRATE=115200
SERIAL_MOCK=true                # Set to false when hardware connected
DATABASE_URL=sqlite+aiosqlite:///./data/arc_labs.db
```

### 4. Install Frontend Dependencies

```bash
cd frontend
pnpm install
cd ..
```

### 5. Install Backend Dependencies

```bash
cd backend
poetry install
cd ..
```

### 6. Install Shared Package Dependencies

```bash
cd shared
pnpm install
cd ..
```

### 7. Verify Firmware Compilation

```bash
cd firmware
pio run
cd ..
```

### 8. Start Development Services

```bash
# Option A: Docker (recommended)
pnpm docker:dev

# Option B: Manual (3 terminals)
# Terminal 1: Backend
pnpm dev:backend

# Terminal 2: Frontend
pnpm dev:frontend

# Terminal 3: Mock Serial (if no hardware)
cd backend && poetry run python scripts/dev_serial.py
```

### 9. Verify Installation

Open http://localhost:5173 - you should see the ARC LABS dashboard.

Check API health: http://localhost:8000/health

## 🔌 Hardware Connection

### Wiring Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CATALYST Mk1 BOARD                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Sensor 1│  │ Sensor 2│  │ Sensor 3│  │ Sensor 4│        │
│  │ (A0)    │  │ (A1)    │  │ (D2)    │  │ (A2)    │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│  ┌────▼────┐  ┌────▼────┐  ┌────▼────┐  ┌────▼────┐        │
│  │Water    │  │Gas      │  │DHT11    │  │Battery  │        │
│  │Level    │  │MQ-2     │  │Temp/Hum │  │Voltage  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                              │
│  ┌─────────┐  ┌─────────┐                                   │
│  │ Relay 1 │  │ Relay 2 │                                   │
│  │ (D3)    │  │ (D4)    │                                   │
│  └────┬────┘  └────┬────┘                                   │
│       │            │                                        │
│  ┌────▼────┐  ┌────▼────┐                                   │
│  │ Pump    │  │ Valve   │                                   │
│  └─────────┘  └─────────┘                                   │
│                                                              │
│  ┌─────────────────────────────────────────────┐           │
│  │           RFID RC522 (Optional)             │           │
│  │  SS:D10  RST:D9  MOSI:D11  MISO:D12  SCK:D13│           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Sensor Wiring

#### Water Level (JSN-SR04T Ultrasonic)
```
Sensor VCC  → 5V
Sensor GND  → GND
Sensor SIG  → A0
```

#### Gas Sensor (MQ-2)
```
Sensor VCC  → 5V
Sensor GND  → GND
Sensor AOUT → A1
Sensor DOUT → (not used)
```

#### Temperature/Humidity (DHT11)
```
Sensor VCC  → 5V
Sensor GND  → GND
Sensor DATA → D2
(Add 4.7kΩ pull-up resistor between DATA and VCC)
```

#### Battery Voltage Monitor
```
Voltage Divider: 100kΩ (top) + 10kΩ (bottom)
Battery + → 100kΩ → A2 → 10kΩ → GND
Measures up to 25V (5V * (100k+10k)/10k)
```

### Actuator Wiring

#### Pump Relay
```
Relay VCC  → 5V
Relay GND  → GND
Relay IN   → D3
Relay COM  → Pump Power +
Relay NO   → Power Supply +
Pump -     → Power Supply -
```

#### Valve Relay (same pattern)
```
Relay VCC  → 5V
Relay GND  → GND
Relay IN   → D4
Relay COM  → Valve Power +
Relay NO   → Power Supply +
Valve -    → Power Supply -
```

## 🚀 First Run Checklist

- [ ] Repository cloned
- [ ] `pnpm install` completed without errors
- [ ] `.env` configured with correct serial port
- [ ] Frontend dependencies installed (`cd frontend && pnpm install`)
- [ ] Backend dependencies installed (`cd backend && poetry install`)
- [ ] Shared package installed (`cd shared && pnpm install`)
- [ ] Firmware compiles (`cd firmware && pio run`)
- [ ] Docker services start (`pnpm docker:dev`)
- [ ] Frontend accessible at http://localhost:5173
- [ ] Backend API accessible at http://localhost:8000/docs
- [ ] WebSocket connects (check browser console)
- [ ] Mock serial data appears in dashboard (if `SERIAL_MOCK=true`)

## 🔧 Hardware Flashing

### Upload Firmware to Arduino

```bash
cd firmware
# Auto-detect port
pio run --target upload

# Or specify port explicitly
pio run --target upload --upload-port /dev/ttyUSB0

# Monitor serial output
pio device monitor --baud 115200
```

### Verify Firmware Communication

1. Open backend logs: `docker-compose logs -f backend`
2. Look for: `Serial connected on /dev/ttyUSB0`
3. Check dashboard for live sensor readings

## 🐛 Common Setup Issues

### Port Permission Denied (Linux)

```bash
sudo usermod -a -G dialout $USER
# Log out and back in
```

### Python Poetry Not Found

```bash
pipx install poetry
pipx ensurepath
# Restart terminal
```

### pnpm Not Found

```bash
npm install -g pnpm
# Or use corepack (Node 16.9+)
corepack enable
corepack prepare pnpm@latest --activate
```

### Docker Compose Fails

```bash
# Check Docker daemon
docker info

# Reset Docker
docker system prune -a
```

### Frontend Build Fails

```bash
cd frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Backend Database Errors

```bash
cd backend
rm data/arc_labs.db
poetry run python scripts/migrate.py
poetry run python scripts/seed.py
```

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/arc-labs/monitoring/issues)
- **Discussions**: [GitHub Discussions](https://github.com/arc-labs/monitoring/discussions)

---

*Last updated: 2024-01-15*