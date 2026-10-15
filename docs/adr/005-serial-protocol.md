# ADR 005: Serial Communication Protocol

## Status
Accepted

## Context
The Catalyst Mk1 firmware communicates with the backend over a serial USB connection. We need a robust, extensible protocol for bidirectional communication.

## Decision
We will use **JSON Lines (newline-delimited JSON)** over serial at **115200 baud, 8N1** with optional CRC32 checksum.

## Rationale

### JSON Lines
- **Human readable** - easy debugging, logging
- **Streaming friendly** - one message per line, parse incrementally
- **Language agnostic** - JSON parsers everywhere
- **Self-describing** - field names in message
- **Extensible** - add fields without breaking parsers
- **Tooling** - `jq`, `jsonl` tools for analysis

### 115200 Baud
- **Standard rate** - supported by all USB-serial chips
- **Sufficient bandwidth** - ~11KB/s, enough for 10Hz sensor data
- **Reliable** - less error-prone than higher rates
- **Universal** - FTDI, CH340, CP2102, native USB all support

### CRC32 Checksum (Optional)
- **Error detection** - catch corruption from noise
- **Lightweight** - 4 bytes, fast to compute
- **Standard polynomial** - 0xEDB88320 (Ethernet)
- **Optional** - backward compatible, firmware can add later

## Protocol Specification

### Message Format
```json
{"type":"sensor_reading","timestamp":1699900000,"sequence":42,"checksum":"a1b2c3d4","payload":{...}}
```

### Common Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Message type identifier |
| timestamp | integer | Yes | Unix epoch seconds |
| sequence | integer | No | Message sequence number |
| checksum | string | No | CRC32 hex of message sans checksum |
| payload | object | Yes | Type-specific data |

### Firmware → Backend Messages

#### Sensor Reading
```json
{
  "type": "sensor_reading",
  "timestamp": 1699900000,
  "sequence": 42,
  "checksum": "a1b2c3d4",
  "payload": {
    "sensor": "water_level",
    "value": 45.2,
    "unit": "cm",
    "raw_value": 512
  }
}
```

| Sensor | Unit | Typical Range |
|--------|------|---------------|
| water_level | cm | 0-300 |
| temperature | °C | -40 to 80 |
| humidity | % | 0-100 |
| gas | ppm | 0-10000 |
| battery | V | 0-5 |

#### Device Status
```json
{
  "type": "device_status",
  "timestamp": 1699900000,
  "payload": {
    "firmware_version": "1.0.0",
    "hardware_version": "1.0",
    "uptime_seconds": 3600,
    "free_heap": 1234,
    "wifi_rssi": -45,
    "sensors_active": ["water_level", "temperature", "humidity", "gas", "battery"],
    "actuators_state": {
      "pump": false,
      "valve": false
    }
  }
}
```

#### Event
```json
{
  "type": "event",
  "timestamp": 1699900000,
  "payload": {
    "event_type": "threshold_exceeded",
    "severity": "warning",
    "message": "Water level below minimum: 8.5 cm",
    "metadata": {
      "sensor": "water_level",
      "value": 8.5,
      "threshold": 10
    }
  }
}
```

| Event Type | Severity | Description |
|------------|----------|-------------|
| sensor_reading | info | Periodic reading |
| threshold_exceeded | warning/critical | Threshold breached |
| threshold_cleared | info | Back to normal |
| automation_triggered | info | Rule executed |
| command_sent | info | Backend sent command |
| command_ack | info | Firmware acknowledged |
| device_connected | info | Serial connected |
| device_disconnected | warning | Serial lost |
| error | error | Firmware error |

#### Command Acknowledgment
```json
{
  "type": "command_ack",
  "timestamp": 1699900000,
  "sequence": 43,
  "payload": {
    "command_id": "cmd_abc123",
    "success": true,
    "message": "Pump activated for 30s"
  }
}
```

#### Command Negative Acknowledgment
```json
{
  "type": "command_nack",
  "timestamp": 1699900000,
  "sequence": 44,
  "payload": {
    "command_id": "cmd_abc123",
    "error_code": "SAFETY_INTERLOCK",
    "message": "Safety interlock prevents pump activation"
  }
}
```

#### Heartbeat
```json
{
  "type": "heartbeat",
  "timestamp": 1699900000,
  "payload": {
    "uptime_seconds": 3600,
    "free_heap": 1234
  }
}
```

#### Error
```json
{
  "type": "error",
  "timestamp": 1699900000,
  "payload": {
    "error_code": "SENSOR_TIMEOUT",
    "message": "DHT11 read timeout",
    "context": {
      "sensor": "temperature",
      "attempts": 3
    }
  }
}
```

### Backend → Firmware Commands

#### Pump Control
```json
{
  "type": "command",
  "timestamp": 1699900000,
  "sequence": 45,
  "checksum": "a1b2c3d4",
  "payload": {
    "command_id": "cmd_abc123",
    "command": "pump_on",
    "params": {
      "duration": 30
    }
  }
}
```

#### Pump Off
```json
{
  "type": "command",
  "payload": {
    "command_id": "cmd_abc124",
    "command": "pump_off",
    "params": {}
  }
}
```

#### Relay Control
```json
{
  "type": "command",
  "payload": {
    "command_id": "cmd_abc125",
    "command": "relay_set",
    "params": {
      "relay": 1,
      "state": true
    }
  }
}
```

| Relay | Function |
|-------|----------|
| 1 | Pump |
| 2 | Valve |

#### Valve Control
```json
{
  "type": "command",
  "payload": {
    "command_id": "cmd_abc126",
    "command": "valve_set",
    "params": {
      "state": true,
      "duration": 60
    }
}
```

#### Calibration
```json
{
  "type": "command",
  "payload": {
    "command_id": "cmd_abc127",
    "command": "calibrate",
    "params": {
      "sensor": "water_level",
      "value": 0
    }
}
```

#### Reset
```json
{
  "type": "command",
  "payload": {
    "command_id": "cmd_abc127",
    "command": "reset",
    "params": {}
  }
}
```

#### Get Status
```json
{
  "type": "command",
  "payload": {
    "command_id": "cmd_abc128",
    "command": "get_status",
    "params": {}
  }
}
```

#### Set Threshold
```json
{
  "type": "command",
  "payload": {
    "command_id": "cmd_abc129",
    "command": "set_threshold",
    "params": {
      "sensor": "temperature",
      "min": 5,
      "max": 40
    }
}
```

#### Emergency Stop
```json
{
  "type": "command",
  "payload": {
    "command_id": "cmd_abc130",
    "command": "emergency_stop",
    "params": {}
  }
}
```

## Error Handling

### Error Codes
| Code | Description | Action |
|------|-------------|--------|
| `SENSOR_TIMEOUT` | Sensor read timeout | Retry, alert if persistent |
| `SENSOR_ERROR` | Sensor hardware error | Alert, mark sensor unhealthy |
| `COMMAND_UNKNOWN` | Unknown command type | Log, ignore |
| `COMMAND_INVALID_PARAMS` | Invalid command parameters | Log, nack |
| `SAFETY_INTERLOCK` | Safety prevents action | Nack, alert |
| `CHECKSUM_ERROR` | Checksum mismatch | Log, discard |
| `CALIBRATION_FAILED` | Calibration failed | Alert, keep old calibration |
| `EMERGENCY_STOP` | E-stop active | Block all commands |
| `WATCHDOG_TIMEOUT` | Watchdog timeout | Emergency stop |

### Nack Response
```json
{
  "type": "command_nack",
  "command_id": "cmd_123",
  "error_code": "SAFETY_INTERLOCK",
  "message": "Safety interlock prevents pump activation"
}
```

## Implementation

### Firmware (C++)
- ArduinoJson for parsing/serialization
- Ring buffer for incoming data
- Line-based parsing (newline delimiter)
- CRC32 for checksum validation
- Non-blocking serial read in loop()

### Backend (Python)
- pyserial for serial communication
- asyncio for async I/O
- Line-based parsing with buffer
- JSON schema validation with Pydantic
- Automatic reconnection with exponential backoff

## Testing

### Mock Serial
- Python script generating valid JSON Lines
- Configurable sensor values, intervals
- Simulates device status, events
- Used for CI/backend testing

### Protocol Tests
- Valid message parsing
- Invalid JSON handling
- Checksum validation
- Command/ack round-trip
- Reconnection behavior

## Consequences

### Positive
- Human-readable for debugging
- Easy to extend with new fields
- Language-agnostic
- Good tooling (jq, jsonl)
- Streaming-friendly

### Negative
- Larger than binary (mitigated by low message rate)
- JSON parsing overhead (negligible at 10Hz)
- No built-in schema enforcement (handled by Pydantic)

## Related ADRs
- ADR 004: Backend Framework
- ADR 006: Real-time Transport
- ADR 011: Hardware Simulation