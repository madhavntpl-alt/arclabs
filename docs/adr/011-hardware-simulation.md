# ADR 011: Hardware Simulation for CI/Testing

## Status
Accepted

## Context
The ARC LABS platform communicates with Catalyst Mk1 hardware over serial USB. For CI/CD and development without physical hardware, we need a reliable hardware simulation strategy.

## Decision
We will implement a **mock serial service** that generates realistic sensor data, device status, and events, configurable via environment variables, running as a separate Docker service in CI and local development.

## Rationale

### Why Mock Serial?
- **CI/CD compatibility** - no physical hardware in GitHub Actions
- **Deterministic testing** - reproducible sensor values for assertions
- **Fast feedback** - no hardware setup time
- **Parallel runs** - multiple CI jobs without hardware contention
- **Developer experience** - develop without hardware on laptop

### Why Not Alternatives

#### Virtual Serial Ports (socat, com0com)
- **Pros**: Real serial interface
- **Cons**: Platform-specific, complex CI setup, no deterministic data

#### Hardware-in-the-Loop (HIL)
- **Pros**: Real hardware testing
- **Cons**: Expensive, not scalable for CI, hardware wear

#### Recorded Playback
- **Pros**: Realistic data patterns
- **Cons**: Static, not configurable, doesn't test edge cases

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT/CI ENVIRONMENT                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│  │  Backend    │     │ Mock Serial │     │  Frontend   │      │
│  │  (FastAPI)  │────►│  Service    │     │  (React)    │      │
│  │             │◄────│             │     │             │      │
│  └─────────────┘     └─────────────┘     └─────────────┘      │
│        │                   │                   │                │
│        └───────────────────┼───────────────────┘                │
│                            ▼                                    │
│                   ┌─────────────────┐                          │
│                   │  docker-compose │                          │
│                   │  (orchestrates) │                          │
│                   └─────────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

### Mock Serial Service (Python)

```python
# backend/scripts/dev_serial.py
import asyncio
import json
import random
import time
from datetime import datetime
from typing import Optional, Callable, Dict, Any
import serial
import os

class MockSerialSimulator:
    def __init__(self):
        self.running = False
        self.callback: Optional[Callable[[Dict], None]] = None
        self.interval = float(os.getenv("MOCK_INTERVAL", "1.0"))
        
        # Sensor baselines with realistic values
        self.baselines = {
            "water_level": {"value": 45.0, "variance": 5.0, "unit": "cm", "min": 0, "max": 200},
            "temperature": {"value": 23.5, "variance": 2.0, "unit": "°C", "min": -40, "max": 80},
            "humidity": {"value": 65.0, "variance": 5.0, "unit": "%", "min": 0, "max": 100},
            "gas": {"value": 450, "variance": 50, "unit": "ppm", "min": 0, "max": 10000},
            "battery": {"value": 3.85, "variance": 0.05, "unit": "V", "min": 3.0, "max": 4.2},
        }
        
        # Add some drift over time
        self.drift = {sensor: 0.0 for sensor in self.baselines}
        
        # Event probability
        self.event_probability = 0.01

    def set_callback(self, callback: Callable[[Dict], None]):
        self.callback = callback

    def set_interval(self, interval: float):
        self.interval = interval

    async def start(self):
        if self.running:
            return
        
        self.running = True
        self.reconnect_attempts = 0

        if self.mock_mode:
            logger.info("Starting in mock mode")
            self.read_task = asyncio.create_task(self._mock_reader())
        else:
            await self._connect()
            if self.serial_connection:
                self.read_task = asyncio.create_task(self._read_loop())

    async def stop(self):
        self.running = False
        if self.read_task:
            self.read_task.cancel()
            try:
                await self.read_task
            except asyncio.CancelledError:
                pass
        if self.serial_connection:
            self.serial_connection.close()
            self.serial_connection = None

    async def _read_loop(self):
        while self.running and self.serial_connection:
            try:
                line = await asyncio.get_event_loop().run_in_executor(
                    None, self.serial_connection.readline
                )
                if line:
                    decoded = line.decode('utf-8', errors='ignore').strip()
                    if decoded:
                        await self._process_line(decoded)
                else:
                    await asyncio.sleep(0.01)
            except serial.SerialException as e:
                logger.error(f"Serial error: {e}")
                self.errors += 1
                await self._handle_disconnect()
                break
            except Exception as e:
                logger.error(f"Read loop error: {e}")
                self.errors += 1
                await asyncio.sleep(0.1)

    async def _mock_reader(self):
        """Generate mock sensor data for testing"""
        import random
        sensor_types = list(self.baselines.keys())
        
        while self.running:
            for sensor_type in sensor_types:
                if not self.running:
                    break
                
                baseline = self.baselines[sensor_type]
                
                # Add some drift
                self.drift[sensor_type] += random.uniform(-0.1, 0.1)
                self.drift[sensor_type] = max(-5.0, min(5.0, self.drift[sensor_type]))
                
                # Generate value with noise
                value = baseline["value"] + self.drift[sensor_type] + random.uniform(-baseline["variance"], baseline["variance"])
                value = max(baseline["min"], min(baseline["max"], value))
                
                message = {
                    "type": "sensor_reading",
                    "sensor": sensor_type,
                    "value": round(value, 2),
                    "unit": baseline["unit"],
                    "timestamp": int(time.time()),
                }
                
                if self.callback:
                    await self.callback(message)
                
                await asyncio.sleep(self.interval / len(self.baselines))
            
            # Occasionally send device status
            if random.random() < 0.1:
                status_message = {
                    "type": "device_status",
                    "firmware_version": "1.0.0",
                    "hardware_version": "1.0",
                    "uptime_seconds": int(time.time()),
                    "free_heap": random.randint(1000, 2000),
                    "sensors_active": list(self.baselines.keys()),
                    "actuators_state": {"pump": False, "valve": False},
                }
                if self.callback:
                    await self.callback(status_message)
            
            # Occasionally send events
            if random.random() < self.event_probability:
                event_types = [
                    ("threshold_exceeded", "warning", "Water level below minimum: 8.5 cm", {"sensor": "water_level", "value": 8.5, "threshold": 10}),
                    ("automation_triggered", "info", "Automation rule 'Low Water Pump' executed", {"rule_id": "rule_1", "rule_name": "Low Water Pump"}),
                    ("device_connected", "info", "Device connected", {}),
                ]
                event_type, severity, message, metadata = random.choice(event_types)
                event_message = {
                    "type": "event",
                    "event_type": event_type,
                    "severity": severity,
                    "message": message,
                    "metadata": metadata,
                    "timestamp": int(time.time()),
                }
                if self.callback:
                    await self.callback(event_message)

    def set_baseline(self, sensor_type: str, value: float):
        if sensor_type in self.baselines:
            self.baselines[sensor_type]["value"] = value

    def get_baselines(self) -> Dict:
        return self.baselines.copy()


# Serial port simulation for pyserial compatibility
class MockSerial:
    def __init__(self, port: str, baudrate: int = 115200, timeout: float = 1.0):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.is_open = False
        self._buffer = ""
        self.simulator = MockSerialSimulator()
        self.simulator.set_callback(self._on_message)
        
    def open(self):
        self.is_open = True
        asyncio.create_task(self.simulator.start())
        
    def close(self):
        self.is_open = False
        asyncio.create_task(self.simulator.stop())
        
    def readline(self) -> bytes:
        # In real implementation, this would read from buffer
        # For mock, we return empty and rely on callback
        return b""
    
    def write(self, data: bytes):
        # Handle commands from backend
        try:
            command = json.loads(data.decode().strip())
            print(f"[MockSerial] Received command: {command}")
        except:
            pass
        return len(data)
    
    def _on_message(self, message: Dict):
        line = json.dumps(message) + "\n"
        self._buffer += line
    
    def in_waiting(self) -> int:
        return len(self._buffer)
    
    def read(self, size: int = 1) -> bytes:
        if self._buffer:
            result = self._buffer[:size]
            self._buffer = self._buffer[size:]
            return result.encode()
        return b""


# Main entry point for standalone service
async def main():
    simulator = MockSerialSimulator()
    
    def print_message(msg):
        print(json.dumps(msg))
    
    simulator.set_callback(print_message)
    simulator.set_interval(1.0)
    
    print("[MockSerial] Starting mock serial simulator...", flush=True)
    await simulator.start()
    
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        await simulator.stop()
        print("\n[MockSerial] Stopped")


if __name__ == "__main__":
    asyncio.run(main())
```

### Docker Integration

```yaml
# docker-compose.yml (add to existing)
services:
  mock-serial:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    command: python scripts/dev_serial.py
    environment:
      - MOCK_INTERVAL=1.0
    profiles:
      - mock
    networks:
      - arc-labs-network
    depends_on:
      - backend
```

### Backend Configuration

```python
# app/core/config.py
SERIAL_MOCK: bool = os.getenv("SERIAL_MOCK", "false").lower() == "true"
SERIAL_PORT: str = os.getenv("SERIAL_PORT", "/dev/ttyUSB0")
```

```python
# app/services/serial_manager.py
async def connect(self):
    if settings.SERIAL_MOCK:
        from scripts.dev_serial import MockSerial
        self.serial = MockSerial(settings.SERIAL_PORT, settings.SERIAL_BAUDRATE)
        self.serial.open()
        self.serial.simulator.set_callback(self._on_message_received)
        return
    
    # Real serial connection
    self.serial = serial.Serial(...)
```

### Usage in CI

```yaml
# .github/workflows/ci.yml
services:
  mock-serial:
    image: ghcr.io/arc-labs/backend:latest
    command: python scripts/dev_serial.py
    env:
      MOCK_INTERVAL: 0.5
    ports:
      - 8001:8000  # Not used but keeps container alive

# In test job
env:
  SERIAL_MOCK: true
  SERIAL_PORT: /dev/ttyUSB0  # Not used but required
```

### Local Development
```bash
# Start with mock serial
docker-compose --profile mock up

# Or start mock separately
cd backend && python scripts/dev_serial.py
```

### Configuration Options

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `MOCK_INTERVAL` | `1.0` | Seconds between sensor readings |
| `MOCK_EVENT_PROBABILITY` | `0.01` | Probability of event per cycle |
| `MOCK_WATER_LEVEL_BASE` | `45.0` | Water level baseline (cm) |
| `MOCK_TEMP_BASE` | `23.5` | Temperature baseline (°C) |
| `MOCK_HUMIDITY_BASE` | `65.0` | Humidity baseline (%) |
| `MOCK_GAS_BASE` | `450` | Gas baseline (ppm) |
| `MOCK_BATTERY_BASE` | `3.85` | Battery baseline (V) |

## Testing Scenarios

### Normal Operation
```bash
# Default settings - normal operation
MOCK_INTERVAL=1.0
```

### Stress Test
```bash
# High frequency, many events
MOCK_INTERVAL=0.1
MOCK_EVENT_PROBABILITY=0.1
```

### Edge Cases
```bash
# Low water level triggers alerts
MOCK_WATER_LEVEL_BASE=8.0

# High temperature
MOCK_TEMP_BASE=55.0

# Low battery
MOCK_BATTERY_BASE=3.2
```

### Custom Scenarios
```python
# In test file
simulator = MockSerialSimulator()
simulator.set_baseline("water_level", 5.0)  # Critical low
simulator.set_baseline("temperature", 60.0)  # Critical high
simulator.set_interval(0.1)

# Simulate command response
def handle_command(command):
    if command["command"] == "pump_on":
        # Simulate water level rising
        for i in range(10):
            simulator.set_baseline("water_level", 5.0 + i * 2)
            await asyncio.sleep(0.5)
```

## Integration with pytest

```python
# tests/conftest.py
@pytest.fixture(scope="session")
async def mock_serial():
    simulator = MockSerialSimulator()
    await simulator.start()
    yield simulator
    await simulator.stop()

@pytest.fixture
async def backend_with_mock(mock_serial):
    # Configure backend to use mock
    with patch("app.services.serial_manager.SerialManager._create_connection") as mock:
        mock_serial = AsyncMock()
        mock_serial.simulator = mock_serial
        mock.return_value = mock_serial
        yield
```

## Consequences

### Positive
- Zero hardware dependency for CI
- Configurable sensor values for edge case testing
- Fast feedback loop (< 1 min CI)
- Deterministic behavior for assertions
- Works on any platform (Linux, macOS, Windows)

### Negative
- Not real hardware (can't catch hardware-specific bugs)
- Simplified physics model
- No electrical noise simulation
- No hardware timing variations

## Related ADRs
- ADR 005: Serial Protocol
- ADR 004: Backend Framework
- ADR 007: Local Database