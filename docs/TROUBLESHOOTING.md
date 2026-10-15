# ARC LABS Monitoring Platform - Troubleshooting Guide

## 🚨 Quick Diagnostic

Run the health check script to identify common issues:

```bash
# Check all services
./scripts/health-check.sh

# Or manually:
curl -s http://localhost:8000/health | jq .
curl -s http://localhost:5173 | head -20
```

---

## 🔴 Frontend Issues

### Dashboard Not Loading

**Symptoms:** Blank page, white screen, loading spinner stuck

| Cause | Solution |
|-------|----------|
| Backend not running | `pnpm dev:backend` or check `docker-compose ps` |
| Wrong API URL in `.env` | Verify `VITE_API_URL=http://localhost:8000` |
| CORS error | Check backend `CORS_ORIGINS` includes `http://localhost:5173` |
| Port 5173 in use | `lsof -i :5173` and kill process, or change port in `vite.config.ts` |
| Node version mismatch | Use Node 20+ (`nvm use 20`) |
| Dependencies out of sync | `cd frontend && rm -rf node_modules pnpm-lock.yaml && pnpm install` |

**Debug Steps:**
```bash
# Check browser console for errors (F12)
# Check network tab for failed requests
# Check Vite dev server logs
cd frontend && pnpm dev
```

### WebSocket Connection Failed

**Symptoms:** "Connection lost" banner, no live data updates

| Cause | Solution |
|-------|----------|
| Backend WebSocket not running | Check backend logs: `docker-compose logs backend` |
| Wrong WS URL | Verify `VITE_WS_URL=ws://localhost:8000/ws/live` |
| Proxy/WebSocket upgrade failed | Check nginx/Apache config for WebSocket support |
| Firewall blocking port 8000 | `sudo ufw allow 8000` or check cloud security groups |

**Debug:**
```bash
# Test WebSocket manually
wscat -c ws://localhost:8000/ws/live

# Check backend WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  http://localhost:8000/ws/live
```

### Charts Not Rendering

**Symptoms:** Empty chart areas, "No data" messages

| Cause | Solution |
|-------|----------|
| No sensor data | Check backend `/api/v1/sensors` returns data |
| Recharts version conflict | `cd frontend && pnpm ls recharts` - ensure single version |
| Data format mismatch | Check sensor data matches `SensorReading` interface |
| Timezone issues | Ensure timestamps are ISO 8601 with timezone |

---

## 🔵 Backend Issues

### FastAPI Won't Start

**Symptoms:** `docker-compose up backend` fails, port 8000 not responding

| Cause | Solution |
|-------|----------|
| Port 8000 in use | `lsof -i :8000` and kill process, or change `SERVER_PORT` |
| Database locked | `rm backend/data/arc_labs.db` and restart |
| Missing dependencies | `cd backend && poetry install` |
| Python version | Use Python 3.11+ (`pyenv local 3.11`) |
| Import errors | Check `poetry run python -m app.main` for traceback |

**Debug:**
```bash
# Run directly to see full traceback
cd backend
poetry run python -m app.main

# Check database
ls -la backend/data/
sqlite3 backend/data/arc_labs.db ".tables"

# Check config
poetry run python -c "from app.core.config import settings; print(settings)"
```

### Serial Connection Issues

**Symptoms:** "Serial disconnected" in health check, no sensor data

| Cause | Solution |
|-------|----------|
| Wrong serial port | Check `ls /dev/ttyUSB*` (Linux) or Device Manager (Windows) |
| Port permissions | `sudo usermod -a -G dialout $USER` (Linux), re-login |
| Baud rate mismatch | Ensure firmware and backend both use 115200 |
| Device not plugged in | Check `dmesg | grep tty` (Linux) |
| Another process using port | `lsof /dev/ttyUSB0` and kill |
| USB cable power-only | Use data-capable USB cable |

**Debug:**
```bash
# Test serial directly
screen /dev/ttyUSB0 115200
# or
picocom -b 115200 /dev/ttyUSB0

# Check backend serial logs
docker-compose logs backend | grep -i serial

# Use mock serial for testing
SERIAL_MOCK=true pnpm dev:backend
```

### Database Errors

**Symptoms:** SQLAlchemy errors, migration failures, locked database

| Cause | Solution |
|-------|----------|
| SQLite locked | Ensure single backend instance, check for zombie processes |
| Migration failed | `cd backend && poetry run python scripts/migrate.py` |
| Schema mismatch | Delete `data/arc_labs.db` and re-run migrations |
| Permission denied | `chmod 666 data/arc_labs.db` and `chmod 777 data/` |

**Debug:**
```bash
# Check database integrity
sqlite3 backend/data/arc_labs.db "PRAGMA integrity_check;"

# View tables
sqlite3 backend/data/arc_labs.db ".schema"

# Manual migration
cd backend
poetry run alembic upgrade head
```

### High Memory/CPU Usage

**Symptoms:** Backend container OOM killed, slow responses

| Cause | Solution |
|-------|----------|
| Memory leak in WebSocket connections | Check `ConnectionManager` cleanup on disconnect |
| Large query results | Add pagination to `/api/v1/events` and `/api/v1/sensors/history` |
| Debug logging enabled | Set `LOG_LEVEL=WARNING` in production |
| Too many workers | Reduce `WORKERS` to 2-4 based on CPU cores |

**Debug:**
```bash
# Check memory usage
docker stats backend

# Profile with py-spy
pipx install py-spy
py-spy top --pid $(pgrep -f uvicorn)

# Check for connection leaks
curl http://localhost:8000/metrics | grep websocket
```

---

## 🟢 Firmware Issues

### Firmware Won't Compile

**Symptoms:** `pio run` fails with errors

| Cause | Solution |
|-------|----------|
| Missing libraries | `pio lib install "ArduinoJson@^6.21.0" "DHT sensor library@^1.4.0"` |
| PlatformIO version | Update: `pio upgrade` |
| Board definition | Ensure `platformio.ini` has `board = uno` |
| C++ standard | Check `build_flags = -std=gnu++17` in platformio.ini |

**Debug:**
```bash
# Clean build
cd firmware
pio run --target clean
pio run

# Verbose output
pio run -v

# Check installed libraries
pio lib list
```

### Firmware Won't Upload

**Symptoms:** `pio run --target upload` fails

| Cause | Solution |
|-------|----------|
| Wrong port | `pio device list` to find correct port |
| Bootloader issue | Hold reset button during upload start |
| Driver issue (CH340) | Install CH340 driver: `brew install ch340g-ch34g-ch34x-mac-os-x-driver` |
| Permission denied | `sudo usermod -a -G dialout $USER` (Linux) |

**Debug:**
```bash
# List ports
pio device list

# Upload with specific port
pio run --target upload --upload-port /dev/ttyUSB0

# Monitor after upload
pio device monitor --baud 115200
```

### Firmware Runs But No Data

**Symptoms:** Uploads successfully, but no sensor readings in backend

| Cause | Solution |
|-------|----------|
| Sensors not wired correctly | Verify wiring against `docs/wiring.md` |
| Sensor initialization failed | Check serial monitor for error messages |
| JSON formatting error | Validate JSON Lines format in serial monitor |
| Watchdog reset | Check `free_heap` in device status, increase stack |

**Debug:**
```bash
# Monitor serial output
pio device monitor --baud 115200

# Expected output:
# {"type":"sensor_reading","sensor":"water_level","value":45.2,"unit":"cm","timestamp":1234567890}
# {"type":"sensor_reading","sensor":"temperature","value":23.5,"unit":"°C","timestamp":1234567890}
# ...

# Check JSON validity
pio device monitor --baud 115200 | jq .
```

---

## 🐳 Docker Issues

### Containers Won't Start

**Symptoms:** `docker-compose up` fails, containers exit immediately

| Cause | Solution |
|-------|----------|
| Port conflicts | Check `docker-compose ps` and host ports |
| Volume permissions | `sudo chown -R 1000:1000 data/` |
| Missing .env file | `cp .env.example .env` |
| Docker daemon not running | `sudo systemctl start docker` |
| Out of disk space | `docker system prune -a` |

**Debug:**
```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend

# Inspect container
docker-compose exec backend sh
docker-compose exec frontend sh

# Check network
docker network ls
docker network inspect monitoring_default
```

### Database Not Persisting

**Symptoms:** Data lost on container restart

| Cause | Solution |
|-------|----------|
| Volume not mounted | Check `docker-compose.yml` volumes section |
| Wrong path | Ensure `./data:/app/data` matches backend `DATABASE_URL` |
| Permission issue | `chmod 777 data/` on host |

**Fix:**
```yaml
# docker-compose.yml
services:
  backend:
    volumes:
      - ./data:/app/data  # Ensure this exists
```

### Frontend Build Fails in Docker

**Symptoms:** `docker-compose build frontend` fails

| Cause | Solution |
|-------|----------|
| Missing build args | Pass `VITE_API_URL` as build arg |
| Node version | Use `node:20-alpine` base image |
| Memory limit | Increase Docker memory allocation |

**Debug:**
```bash
# Build with no cache
docker-compose build --no-cache frontend

# Run build interactively
docker run --rm -it -v $(pwd)/frontend:/app node:20-alpine sh
cd /app && pnpm install && pnpm build
```

---

## 🌐 Network Issues

### CORS Errors

**Symptoms:** Browser console shows "CORS policy" errors

**Solutions:**
```python
# backend/app/core/security.py
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://app.arc-labs.com"
]
```

### WebSocket Through Proxy

**Symptoms:** WebSocket works locally but not through nginx/Cloudflare

**nginx Config:**
```nginx
location /ws/live {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

**Cloudflare:** Enable "WebSockets" in Network settings.

---

## 🔧 Recovery Procedures

### Full System Reset

```bash
# Stop everything
docker-compose down -v
pnpm clean

# Reset database
rm -rf backend/data/arc_labs.db

# Reinstall dependencies
pnpm install
cd frontend && pnpm install
cd ../backend && poetry install
cd ../shared && pnpm install

# Restart
pnpm docker:dev
```

### Database Recovery

```bash
# Backup current
cp backend/data/arc_labs.db backend/data/arc_labs.db.backup

# Restore from backup
cp backend/data/arc_labs.db.backup backend/data/arc_labs.db

# Or recreate from scratch
rm backend/data/arc_labs.db
cd backend && poetry run python scripts/migrate.py && poetry run python scripts/seed.py
```

### Firmware Recovery

```bash
# Reflash with known good version
cd firmware
git stash  # if local changes
pio run --target upload

# Or use Arduino IDE to burn bootloader + firmware
```

---

## 📞 Getting Help

### Log Collection

```bash
# Collect all logs
./scripts/collect-logs.sh

# Or manually:
docker-compose logs --no-color > logs.txt 2>&1
cd frontend && pnpm test 2>&1 | tee -a logs.txt
cd ../backend && poetry run pytest 2>&1 | tee -a logs.txt
```

### Information to Include

When reporting issues, include:

1. **Environment**: OS, Docker version, Node/Python versions
2. **Steps to reproduce**: Minimal reproduction steps
3. **Expected vs actual behavior**
4. **Logs**: Relevant log snippets (remove secrets!)
5. **Configuration**: Sanitized `.env` file
6. **Hardware**: Sensor types, wiring photos if relevant

### Support Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, community help
- **Discord**: Real-time chat (invite in repo description)

---

## 📋 Common Error Codes

| Code | Component | Meaning | Action |
|------|-----------|---------|--------|
| `SERIAL_PORT_NOT_FOUND` | Backend | Port doesn't exist | Check `/dev/ttyUSB*` or COM ports |
| `SERIAL_PERMISSION_DENIED` | Backend | No permission | Add user to `dialout` group |
| `SENSOR_TIMEOUT` | Backend | No data from sensor | Check wiring, sensor power |
| `JSON_PARSE_ERROR` | Backend | Invalid JSON from firmware | Check firmware serial output |
| `THRESHOLD_VALIDATION_ERROR` | API | Invalid threshold values | Ensure min < max, positive values |
| `RULE_CONDITION_INVALID` | API | Bad condition syntax | Check operator and value types |
| `WEBSOCKET_DISCONNECTED` | Frontend | WS connection lost | Check backend, network, proxy |
| `DATABASE_LOCKED` | Backend | SQLite locked | Single backend instance only |
| `MIGRATION_FAILED` | Backend | Schema migration error | Check alembic logs, reset DB |

---

## 📞 Getting Help

### Log Collection

```bash
# Collect all logs
./scripts/collect-logs.sh

# Or manually:
docker-compose logs --no-color > logs.txt 2>&1
cd frontend && pnpm test 2>&1 | tee -a logs.txt
cd ../backend && poetry run pytest 2>&1 | tee -a logs.txt
```

### Information to Include

When reporting issues, include:

1. **Environment**: OS, Docker version, Node/Python versions
2. **Steps to reproduce**: Minimal reproduction steps
3. **Expected vs actual behavior**
4. **Logs**: Relevant log snippets (remove secrets!)
5. **Configuration**: Sanitized `.env` file
6. **Hardware**: Sensor types, wiring photos if relevant

### Support Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, community help
- **Discord**: Real-time chat (invite in repo description)

---

*Last updated: 2024-01-15*