# ARC LABS Monitoring Platform - Configuration Reference

## 📋 Environment Variables

### Application

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | "ARC LABS Monitoring" | Application display name |
| `APP_ENV` | `development` | Environment: `development`, `staging`, `production` |
| `APP_DEBUG` | `true` | Enable debug mode |
| `APP_URL` | `http://localhost:5173` | Frontend URL |
| `API_URL` | `http://localhost:8000` | Backend API URL |
| `WS_URL` | `ws://localhost:8000/ws/live` | WebSocket URL |

### Frontend (Vite)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_APP_NAME` | "ARC LABS Monitoring" | App name for frontend |
| `VITE_API_URL` | `http://localhost:8000` | API base URL |
| `VITE_WS_URL` | `ws://localhost:8000/ws/live` | WebSocket URL |
| `VITE_APP_ENV` | `development` | Frontend environment |

### Backend (FastAPI)

#### Database

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./data/arc_labs.db` | SQLAlchemy async database URL |

**Production PostgreSQL Example:**
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/arc_labs
```

#### Security

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | **Required** | JWT signing key (min 32 chars) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token TTL |

#### CORS

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGINS` | `["http://localhost:5173", "http://localhost:3000"]` | Allowed origins (JSON array) |
| `CORS_ALLOW_CREDENTIALS` | `true` | Allow cookies/credentials |

#### Rate Limiting

| Variable | Default | Description |
|----------|---------|-------------|
| `RATE_LIMIT_REQUESTS` | `100` | Requests per window |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Window size in seconds |

#### Serial Communication

| Variable | Default | Description |
|----------|---------|-------------|
| `SERIAL_PORT` | `/dev/ttyUSB0` | Serial device path |
| `SERIAL_BAUDRATE` | `115200` | Baud rate |
| `SERIAL_TIMEOUT` | `1.0` | Read timeout (seconds) |
| `SERIAL_MOCK` | `false` | Use mock serial data |

#### Sensor Thresholds (Defaults)

| Variable | Default | Unit | Description |
|----------|---------|------|-------------|
| `WATER_LEVEL_MIN_CM` | `10` | cm | Low water alert threshold |
| `WATER_LEVEL_MAX_CM` | `200` | cm | High water alert threshold |
| `TEMP_MIN_C` | `0` | °C | Low temperature alert |
| `TEMP_MAX_C` | `50` | °C | High temperature alert |
| `HUMIDITY_MIN_PCT` | `20` | % | Low humidity alert |
| `HUMIDITY_MAX_PCT` | `80` | % | High humidity alert |
| `GAS_THRESHOLD_PPM` | `1000` | ppm | Gas concentration alert |
| `BATTERY_MIN_V` | `3.3` | V | Low battery alert |
| `BATTERY_MAX_V` | `4.2` | V | High battery (charging) |

#### Automation

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTOMATION_ENABLED` | `true` | Enable automation engine |
| `AUTOMATION_COOLDOWN_SECONDS` | `60` | Min time between rule executions |
| `SAFETY_INTERLOCK_ENABLED` | `true` | Enable hardware safety interlocks |

#### Logging

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `INFO` | Log level: `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `LOG_FORMAT` | `json` | Log format: `json`, `console` |

#### Metrics

| Variable | Default | Description |
|----------|---------|-------------|
| `METRICS_ENABLED` | `true` | Enable Prometheus metrics |
| `METRICS_PORT` | `9090` | Metrics server port |

### Hardware / Firmware

| Variable | Default | Description |
|----------|---------|-------------|
| `PLATFORMIO_ENV` | `uno` | PlatformIO environment |
| `ARDUINO_BOARD` | `uno` | Arduino board type |
| `ARDUINO_PORT` | `/dev/ttyUSB0` | Upload port |
| `ARDUINO_BAUDRATE` | `115200` | Serial baud rate |

#### Pin Definitions

| Variable | Default | Description |
|----------|---------|-------------|
| `PIN_WATER_LEVEL` | `A0` | Water level sensor pin |
| `PIN_GAS_SENSOR` | `A1` | Gas sensor pin |
| `PIN_DHT11` | `2` | DHT11 data pin |
| `PIN_BATTERY_VOLTAGE` | `A2` | Battery voltage pin |
| `PIN_RELAY_PUMP` | `3` | Pump relay pin |
| `PIN_RELAY_VALVE` | `4` | Valve relay pin |
| `PIN_RFID_SS` | `10` | RFID SPI SS |
| `PIN_RFID_RST` | `9` | RFID reset pin |
| `PIN_LED_STATUS` | `13` | Status LED pin |
| `PIN_BUZZER` | `5` | Buzzer pin |

### Deployment (Production)

#### Vercel (Frontend)

| Variable | Description |
|----------|-------------|
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_TOKEN` | Vercel access token |

#### Docker

| Variable | Default | Description |
|----------|---------|-------------|
| `DOCKER_REGISTRY` | `ghcr.io` | Container registry |
| `DOCKER_IMAGE_NAME` | `arc-labs/backend` | Backend image name |
| `DOCKER_IMAGE_TAG` | `latest` | Image tag |

#### Server

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_HOST` | `0.0.0.0` | Bind address |
| `SERVER_PORT` | `8000` | Server port |
| `WORKERS` | `4` | Uvicorn workers |

#### PostgreSQL (Production)

| Variable | Description |
|----------|-------------|
| `POSTGRES_HOST` | Database host |
| `POSTGRES_PORT` | Database port (5432) |
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |

#### Redis (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection URL |

#### Monitoring

| Variable | Description |
|----------|-------------|
| `SENTRY_DSN` | Sentry DSN for error tracking |
| `PROMETHEUS_URL` | Prometheus server URL |

### Feature Flags

| Variable | Default | Description |
|----------|---------|-------------|
| `FEATURE_DARK_MODE` | `true` | Enable dark/light theme toggle |
| `FEATURE_OFFLINE_QUEUE` | `true` | Enable offline operation queue |
| `FEATURE_PWA` | `true` | Enable Progressive Web App |
| `FEATURE_AUTOMATION_RULES` | `true` | Enable automation rule engine |
| `FEATURE_CALIBRATION` | `true` | Enable sensor calibration UI |

---

## ⚙️ Sensor Calibration

### Water Level Sensor (Ultrasonic)

```python
# Calibration formula: distance_cm = (raw_voltage * SLOPE) + OFFSET
# Typical values for JSN-SR04T:
WATER_LEVEL_SLOPE = 58.0      # cm per volt
WATER_LEVEL_OFFSET = -2.5     # cm offset
```

**Calibration Procedure:**
1. Place sensor at known distance from water (e.g., 50 cm)
2. Record raw ADC value
3. Repeat at 3+ distances
4. Calculate linear regression for SLOPE and OFFSET
5. Update via API: `POST /api/v1/config/thresholds`

### Gas Sensor (MQ-2)

```python
# MQ-2 requires burn-in time (24-48 hours) for stable readings
# Calibration: Rs/R0 ratio where R0 is resistance in clean air
GAS_R0 = 10.0          # Calibrated in clean air (kΩ)
GAS_SLOPE = -0.45      # Log-log slope for LPG
GAS_INTERCEPT = 1.2    # Log-log intercept
```

**Calibration Procedure:**
1. Power sensor for 24+ hours (burn-in)
2. Place in clean air, record R0
3. Expose to known gas concentration
4. Calculate SLOPE and INTERCEPT
5. Update via API

### Temperature/Humidity (DHT11/DHT22)

```python
# DHT11: ±2°C, ±5% RH accuracy
# DHT22: ±0.5°C, ±2% RH accuracy
# No calibration typically needed
TEMP_OFFSET = 0.0      # °C correction
HUMIDITY_OFFSET = 0.0  # % RH correction
```

### Battery Voltage

```python
# Voltage divider: R1=100kΩ, R2=10kΩ
# V_battery = V_adc * (R1 + R2) / R2
BATTERY_DIVIDER_RATIO = 11.0  # (100k + 10k) / 10k
BATTERY_ADC_REF = 5.0         # ADC reference voltage
BATTERY_OFFSET = 0.0          # Voltage correction
```

---

## 🔧 Threshold Configuration

### API Endpoint

```bash
# Get current thresholds
curl -X GET http://localhost:8000/api/v1/config/thresholds

# Update thresholds
curl -X POST http://localhost:8000/api/v1/config/thresholds \
  -H "Content-Type: application/json" \
  -d '{
    "water_level_min_cm": 15,
    "water_level_max_cm": 180,
    "temp_min_c": 5,
    "temp_max_c": 40,
    "humidity_min_pct": 30,
    "humidity_max_pct": 70,
    "gas_threshold_ppm": 800,
    "battery_min_v": 3.5,
    "battery_max_v": 4.1
  }'
```

### Threshold Schema

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

### Severity Levels

| Level | Condition | Action |
|-------|-----------|--------|
| `info` | Within normal range | Log only |
| `warning` | Approaching threshold | Notify, log |
| `critical` | Threshold exceeded | Alert, trigger automation, log |
| `emergency` | Critical + safety risk | Immediate action, E-stop |

---

## 🤖 Automation Rules

### Rule Structure

```json
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
  "cooldown_seconds": 300
}
```

### Operators

| Operator | Description |
|----------|-------------|
| `<` | Less than |
| `<=` | Less than or equal |
| `>` | Greater than |
| `>=` | Greater than or equal |
| `==` | Equal |
| `!=` | Not equal |
| `between` | Value in range [min, max] |
| `outside` | Value outside range [min, max] |

### Action Types

| Type | Parameters | Description |
|------|------------|-------------|
| `pump_on` | `duration_seconds` | Turn pump on for duration |
| `pump_off` | - | Turn pump off |
| `relay_set` | `relay: 1|2`, `state: true|false` | Set relay state |
| `notify` | `message`, `severity` | Send notification |
| `log` | `message`, `level` | Write to event log |

---

## 🐳 Docker Configuration

### docker-compose.yml (Development)

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://backend:8000
      - VITE_WS_URL=ws://backend:8000/ws/live

  backend:
    build: ./backend
    ports:
      - "8000:8000"
      - "9090:9090"
    volumes:
      - ./backend:/app
      - ./data:/app/data
    environment:
      - DATABASE_URL=sqlite+aiosqlite:///./data/arc_labs.db
      - SERIAL_PORT=/dev/ttyUSB0
      - SERIAL_MOCK=true
    devices:
      - "/dev/ttyUSB0:/dev/ttyUSB0"

  mock-serial:
    build: ./backend
    command: python scripts/dev_serial.py
    depends_on:
      - backend
```

### docker-compose.prod.yml (Production)

```yaml
services:
  backend:
    image: ghcr.io/arc-labs/backend:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/arc_labs
      - SECRET_KEY=${SECRET_KEY}
      - CORS_ORIGINS=["https://app.arc-labs.com"]
    depends_on:
      - db
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=arc_labs
      - POSTGRES_USER=arc_labs
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - backend
      - frontend

  frontend:
    image: ghcr.io/arc-labs/frontend:latest
    # Served via nginx

volumes:
  postgres_data:
```

---

## 🔐 Security Configuration

### JWT Tokens

```python
# Access token payload
{
  "sub": "user_id",
  "type": "access",
  "exp": 1699900000,
  "iat": 1699898200
}

# Refresh token payload
{
  "sub": "user_id",
  "type": "refresh",
  "exp": 1700500000,
  "iat": 1699898200
}
```

### API Key (Future)

```bash
# Generate API key
API_KEY=ak_live_$(openssl rand -hex 32)

# Use in requests
Authorization: Bearer ak_live_...
```

### HTTPS (Production)

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

---

## 📊 Monitoring Configuration

### Prometheus Metrics

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'arc-labs-backend'
    static_configs:
      - targets: ['backend:9090']
```

### Key Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `sensor_readings_total` | Counter | Total sensor readings received |
| `sensor_reading_value` | Gauge | Current sensor value |
| `alerts_active` | Gauge | Active alerts count |
| `automation_executions_total` | Counter | Automation rule executions |
| `serial_connection_status` | Gauge | Serial connection (1=connected) |
| `http_requests_total` | Counter | HTTP requests by endpoint/status |
| `http_request_duration_seconds` | Histogram | Request latency |

---

## 🔄 Configuration Management

### Reload Without Restart

```bash
# Backend: SIGHUP to reload config
docker-compose kill -s HUP backend

# Or via API (future)
curl -X POST http://localhost:8000/admin/config/reload
```

### Configuration Validation

```bash
# Validate all config
pnpm config:validate

# Or backend only
cd backend && poetry run python -m app.core.config
```

---

*Last updated: 2024-01-15*