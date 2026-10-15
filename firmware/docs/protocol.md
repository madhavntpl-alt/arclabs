# Serial Communication Protocol Specification

## Overview

The Catalyst Mk1 firmware communicates with the backend via a serial connection using **JSON Lines** format (newline-delimited JSON) at **115200 baud**, 8N1.

## Message Format

Each message is a single JSON object terminated by a newline character (`\n`).

```json
{"type":"sensor_reading","sensor":"water_level","value":45.2,"unit":"cm","timestamp":1699900000}
```

## Message Types

### Firmware → Backend

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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | `"sensor_reading"` |
| timestamp | integer | Yes | Unix timestamp (seconds) |
| sequence | integer | No | Message sequence number |
| checksum | string | No | CRC32 hex of message without checksum |
| payload.sensor | string | Yes | Sensor type identifier |
| payload.value | number | Yes | Calibrated sensor value |
| payload.unit | string | Yes | Unit of measurement |
| payload.raw_value | number | No | Raw ADC/sensor reading |

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

| Severity | Values |
|----------|--------|
| info | Normal operation |
| warning | Approaching threshold |
| critical | Threshold exceeded |
| emergency | Safety critical |

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
| 1 | Pump relay |
| 2 | Valve relay |

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
}
```

#### Reset
```json
{
  "type": "command",
  "payload": {
    "command_id": "cmd_abc128",
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
    "command_id": "cmd_abc129",
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
    "command_id": "cmd_abc130",
    "command": "set_threshold",
    "params": {
      "sensor": "temperature",
      "min": 5,
      "max": 40
    }
  }
}
```

#### Emergency Stop
```json
{
  "type": "command",
  "payload": {
    "command_id": "cmd_abc131",
    "command": "emergency_stop",
    "params": {}
  }
}
```

## Checksum

Optional CRC32 checksum for message integrity.

- Calculated on JSON string without checksum field
- Polynomial: 0xEDB88320 (Ethernet)
- Format: 8-character lowercase hex
- Added as `"checksum": "a1b2c3d4"` field

Example:
```json
{"type":"sensor_reading","timestamp":1699900000,"payload":{"sensor":"water_level","value":45.2,"unit":"cm"},"checksum":"a1b2c3d4"}
```

## Sequence Numbers

- Incremented for each message sent
- Used for message ordering and deduplication
- Reset on device restart

## Error Codes

| Code | Description |
|------|-------------|
| `SENSOR_TIMEOUT` | Sensor read timeout |
| `SENSOR_ERROR` | Sensor hardware error |
| `COMMAND_UNKNOWN` | Unknown command type |
| `COMMAND_INVALID_PARAMS` | Invalid command parameters |
| `SAFETY_INTERLOCK` | Safety interlock prevents action |
| `CHECKSUM_ERROR` | Checksum verification failed |
| `SENSOR_TIMEOUT` | Sensor communication timeout |
| `CALIBRATION_FAILED` | Calibration procedure failed |
| `EMERGENCY_STOP` | Emergency stop active |
| `WATCHDOG_TIMEOUT` | Watchdog timeout |

## Example Communication Flow

```
Firmware -> Backend:
{"type":"sensor_reading","timestamp":1699900000,"payload":{"sensor":"water_level","value":45.2,"unit":"cm"}}

Backend -> Firmware:
{"type":"command","command_id":"cmd_1","command":"pump_on","params":{"duration":30}}

Firmware -> Backend:
{"type":"command_ack","command_id":"cmd_1","success":true,"message":"Pump activated for 30s"}

Firmware -> Backend (after 30s):
{"type":"event","payload":{"event_type":"automation_triggered","severity":"info","message":"Pump completed 30s cycle"}}
```

## Implementation Notes

1. **Line Buffering**: Read until `\n` or `\r\n`
2. **Buffer Size**: 1024 bytes minimum
3. **Timeout**: 1 second read timeout
3. **Reconnection**: Auto-reconnect on serial disconnect
4. **Mock Mode**: Backend can run with simulated serial data
5. **Flow Control**: None (reliable at 115200 with short messages)
5. **Encoding**: UTF-8