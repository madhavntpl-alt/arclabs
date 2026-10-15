# Hardware Interface Specification

## Overview
This document describes the hardware interface for the Catalyst Mk1 environmental monitoring and control system.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CATALYST Mk1 HARDWARE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    Serial/USB     ┌─────────────────────┐    │
│  │   FIRMWARE  │ ◄────────────────► │      BACKEND        │    │
│  │  (Arduino)  │   JSON Lines      │    (FastAPI)        │    │
│  └─────────────┘                   └─────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Pin Assignments

### Arduino Uno (ATmega328P)

| Pin | Function | Component | Details |
|-----|----------|-----------|---------|
| D0 | RX | USB Serial | Programming/Communication |
| D1 | TX | USB Serial | Programming/Communication |
| D2 | DHT11 Data | Temp/Humidity Sensor | Digital input with 4.7kΩ pull-up |
| D3 | Relay 1 (Pump) | Pump Relay Module | Active LOW, 5V logic |
| D4 | Relay 2 (Valve) | Valve Relay Module | Active LOW, 5V logic |
| D5 | Buzzer | Piezo Buzzer | PWM output for alerts |
| D6 | Ultrasonic Echo | Water Level Sensor | Input |
| D7 | Ultrasonic Trig | Water Level Sensor | Output |
| D8 | Status LED | Built-in LED | Activity indicator |
| D9 | RFID RST | RC522 Module | Reset pin |
| D10 | RFID SS | RC522 Module | SPI Slave Select |
| D11 | RFID MOSI | RC522 Module | SPI MOSI |
| D12 | RFID MISO | RC522 Module | SPI MISO |
| D13 | RFID SCK | RC522 Module | SPI Clock |
| A0 | Water Level | Ultrasonic/Pressure | Analog input |
| A1 | Gas Sensor | MQ-2 | Analog input |
| A2 | Battery Monitor | Voltage Divider | Analog input (0-5V = 0-25V battery) |

### Power Distribution

```
                    ┌─────────────────┐
                    │   POWER INPUT   │
                    │   7-12V DC or   │
                    │   USB 5V        │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  5V Rail │  │ 3.3V Rail│  │  Vin     │
        └────┬─────┘  └────┬─────┘  └────┬─────┘
             │             │             │
    ┌────────┼─────┐ ┌─────┼─────┐ ┌────┼────┐
    ▼        ▼     ▼ ▼     ▼     ▼ ▼    ▼    ▼
┌────────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│Arduino │ │Sensors│ │Relays│ │RFID│ │Buzzer│
│  5V    │ │       │ │      │ │    │ │      │
└────────┘ └────┘ └────┘ └────┘ └────┘ └────┘
```

## Sensor Specifications

### Water Level Sensor (JSN-SR04T Ultrasonic)
- **Range**: 25cm - 450cm
- **Accuracy**: ±2mm
- **Interface**: Single-wire UART or GPIO trigger/echo
- **Power**: 5V DC, ~15mA
- **Mounting**: Above water surface, pointing downward
- **Calibration**: 
  - Offset: -2.5cm (sensor housing)
  - Slope: 58.0 cm/V (ultrasonic) or linear mapping for pressure sensor

### Gas Sensor (MQ-2)
- **Target Gases**: LPG, Propane, Methane, Alcohol, Hydrogen, Smoke
- **Detection Range**: 200 - 10,000 ppm
- **Interface**: Analog voltage (0-5V)
- **Load Resistor**: 10kΩ (on module)
- **Heater**: 5V, ~150mA
- **Warm-up Time**: 24-48 hours for stable readings
- **Calibration**:
  - R0: Resistance in clean air (measure after warm-up)
  - Slope: -0.45 (LPG)
  - Intercept: 1.2

### Temperature/Humidity (DHT11)
- **Temperature Range**: 0-50°C (±2°C accuracy)
- **Humidity Range**: 20-90% RH (±5% RH accuracy)
- **Sampling Rate**: Max 1 Hz (1 second minimum interval)
- **Interface**: Single-wire digital protocol
- **Pull-up**: 4.7kΩ resistor between DATA and VCC
- **Alternative**: DHT22 (±0.5°C, ±2% RH, 0.5 Hz sampling)

### Battery Voltage Monitor
- **Circuit**: Voltage divider (100kΩ + 10kΩ = 11:1 ratio)
- **Measurement Range**: 0-25V (ADC reads 0-5V = 0-25V battery)
- **ADC Resolution**: 10-bit (0-1023 = 0-5V = 0-25V)
- **Resolution**: ~24mV per step
- **Thresholds**:
  - Low: 3.3V (3.6V with margin)
  - Critical: 3.0V
  - Full: 4.2V (Li-ion)
  - Charging: >4.2V

## Actuator Specifications

### Pump Relay (5V Relay Module)
- **Control Pin**: D3 (Active LOW)
- **Relay Rating**: 10A/250VAC, 10A/30VDC
- **Coil**: 5V, ~70mA
- **Isolation**: Opto-isolated
- **Pump Types Supported**:
  - 12V DC submersible pump (max 5A)
  - 120/240V AC pump via external contactor
- **Safety Features**:
  - Max continuous runtime: 5 minutes
  - Cooldown period: 10 seconds
  - Dry-run protection (water level < 5cm)
  - Emergency stop via hardware E-stop

### Valve Relay (5V Relay Module)
- **Control Pin**: D4 (Active LOW)
- **Relay Rating**: 10A/250VAC, 10A/30VDC
- **Valve Types Supported**:
  - 12V DC solenoid valve
  - 24V AC solenoid valve (via transformer)
- **Safety Features**:
  - Position confirmation (if feedback available)
  - Timeout protection (max open time)

## Communication Protocol

### Serial Interface
- **Port**: USB CDC (virtual COM port)
- **Baud Rate**: 115200
- **Format**: 8N1 (8 data bits, no parity, 1 stop bit)
- **Flow Control**: None
- **Protocol**: JSON Lines (newline-delimited JSON)

### Message Format (Firmware → Backend)
```json
{"type":"sensor_reading","sensor":"water_level","value":45.2,"unit":"cm","timestamp":1699900000}
{"type":"sensor_reading","sensor":"temperature","value":23.5,"unit":"°C","timestamp":1699900000}
{"type":"sensor_reading","sensor":"humidity","value":65,"unit":"%","timestamp":1699900000}
{"type":"sensor_reading","sensor":"gas","value":450,"unit":"ppm","timestamp":1699900000}
{"type":"sensor_reading","sensor":"battery","value":3.85,"unit":"V","timestamp":1699900000}
{"type":"device_status","firmware_version":"1.0.0","hardware_version":"1.0","uptime_seconds":3600,"free_heap":1234,"sensors_active":["water_level","temperature","humidity","gas","battery"],"actuators_state":{"pump":false,"valve":false}}
{"type":"event","event_type":"threshold_exceeded","severity":"warning","message":"Water level below minimum: 8.5 cm","timestamp":1699900000}
```

### Command Format (Backend → Firmware)
```json
{"type":"command","command_id":"cmd_abc123","command":"pump_on","params":{"duration":30}}
{"type":"command","command_id":"cmd_abc124","command":"pump_off","params":{}}
{"type":"command","command_id":"cmd_abc125","command":"relay_set","params":{"relay":1,"state":true}}
{"type":"command","command_id":"cmd_abc126","command":"calibrate","params":{"sensor":"water_level","value":0}}
```

### Acknowledgment (Firmware → Backend)
```json
{"type":"command_ack","command_id":"cmd_abc123","success":true,"message":"Pump activated for 30s"}
{"type":"command_nack","command_id":"cmd_abc123","error_code":"SAFETY_INTERLOCK","message":"Water level too low"}
```

### Checksum (Optional)
```json
{"type":"sensor_reading","sensor":"water_level","value":45.2,"unit":"cm","timestamp":1699900000,"checksum":"a1b2c3d4"}
```
CRC32 (Ethernet polynomial 0xEDB88320) of JSON string without checksum field.

## Timing Requirements

| Parameter | Value | Description |
|-----------|-------|-------------|
| Sensor Read Interval | 1000ms | Minimum interval between sensor reads |
| Status Broadcast | 10000ms | Device status broadcast interval |
| Heartbeat Interval | 30000ms | WebSocket/Serial heartbeat |
| Command Timeout | 5000ms | Max wait for command ack |
| Pump Max Runtime | 300000ms | Max continuous pump runtime |
| Pump Cooldown | 10000ms | Minimum time between pump cycles |
| DHT Read Interval | 2000ms | Minimum DHT sensor read interval |
| Watchdog Timeout | 8000ms | Hardware watchdog timeout |
| Serial Timeout | 1000ms | Serial read timeout |

## Power Requirements

| Component | Voltage | Current (Typical) | Current (Peak) |
|-----------|---------|-------------------|----------------|
| Arduino Uno | 5V | 50mA | 100mA |
| Sensors (all) | 5V | 100mA | 200mA |
| Relays (2x) | 5V | 140mA (70mA each) | 140mA |
| Buzzer | 5V | 30mA | 50mA |
| RFID (optional) | 3.3V | 50mA | 80mA |
| **Total** | **5V** | **~370mA** | **~570mA** |

### Power Supply Options
1. **USB Power** (Development): 5V/500mA from USB
2. **Barrel Jack** (Production): 7-12V DC, 1A minimum
3. **External 5V Supply**: 5V/2A regulated (bypass Arduino regulator)

## Environmental Specifications

| Parameter | Range |
|-----------|-------|
| Operating Temperature | 0°C to 50°C |
| Storage Temperature | -20°C to 70°C |
| Humidity | 10% - 90% RH (non-condensing) |
| Enclosure Rating | IP65 (with proper cable glands) |
| Altitude | Up to 2000m |

## Safety Features

### Hardware Safety
- **E-Stop Button**: Normally-closed, cuts power to all relays
- **Watchdog Timer**: Hardware watchdog (8s timeout)
- **Brown-out Detection**: MCU brown-out at 2.7V
- **Overcurrent Protection**: PTC fuses on sensor power
- **Opto-isolation**: Relay modules isolate MCU from load circuits

### Software Safety
- **Pump Protection**: Max 5min runtime, 10s cooldown, dry-run prevention
- **Valve Protection**: Position confirmation, timeout protection
- **Sensor Validation**: Range checks, rate-of-change limits
- **Emergency Stop**: Hardware + software accessible
- **Watchdog**: Hardware + software watchdogs

### Emergency Stop Circuit
```
E-Stop Button (NC) ──► Safety Relay Coil ──► Relay Contacts (NC) ──► Relay Power
                              │
                              └─► Aux Contact ──► Firmware E-Stop Input (D8)
```
- **Activation**: Press E-Stop → Power cut to relays + Firmware notified
- **Reset**: Twist-to-release → Power restored → Firmware requires explicit reset

## Wiring Checklist

### Pre-Power Checks
- [ ] All GND connections continuous
- [ ] 5V rail continuous to all sensors
- [ ] Relay IN pins: D3 (pump), D4 (valve)
- [ ] Sensor signals: A0 (water), A1 (gas), A2 (battery), D2 (DHT11)
- [ ] No shorts between power and ground
- [ ] Relay contacts isolated from control circuit
- [ ] Battery divider: 100kΩ + 10kΩ
- [ ] DHT11 pull-up: 4.7kΩ on D2

### Functional Tests
1. **Power On**: Arduino boots, status LED blinks 3x
2. **Serial**: Open serial monitor at 115200, see startup message
3. **Sensors**: Each sensor reports valid readings
4. **Relays**: Audible click when activated via serial command
5. **Pump**: Runs for specified duration, stops automatically
6. **Valve**: Opens/closes on command
7. **Status LED**: Shows correct patterns
8. **Buzzer**: Sounds on alerts
9. **RFID**: Reads card UID (if installed)

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| No serial output | Wrong baud rate | Set 115200 8N1 |
| Sensor reads NaN | Wiring/loose connection | Check continuity |
| Relay doesn't click | Wrong pin/Active LOW | Verify pin, check logic |
| Pump won't start | Safety interlock | Check water level, battery |
| DHT11 fails | No pull-up / timing | Add 4.7kΩ resistor |
| MQ-2 always high | Not warmed up | Wait 24-48 hours |
| Battery reads wrong | Divider ratio off | Calibrate with multimeter |

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-15 | Initial hardware interface specification |