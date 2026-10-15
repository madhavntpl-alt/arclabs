# Catalyst Mk1 Wiring Diagrams

## Complete System Wiring

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CATALYST Mk1 COMPLETE WIRING                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│   │  SENSORS    │     │  ARDUINO    │     │ ACTUATORS   │                  │
│   │             │     │    UNO      │     │             │                  │
│   │  ┌───────┐  │     │             │     │  ┌───────┐  │                  │
│   │  │Water  │──┼────►│ A0          │     │  │Pump   │◄─┼────│ D3         │
│   │  │Level  │  │     │             │     │  │Relay  │  │     │           │
│   │  └───────┘  │     │             │     │  └───────┘  │                  │
│   │  ┌───────┐  │     │             │     │  ┌───────┐  │                  │
│   │  │ Gas   │──┼────►│ A1          │     │  │Valve  │◄─┼────│ D4         │
│   │  │ MQ-2  │  │     │             │     │  │Relay  │  │     │           │
│   │  └───────┘  │     │             │     │  └───────┘  │                  │
│   │  ┌───────┐  │     │             │     │             │                  │
│   │  │DHT11  │──┼────►│ D2          │     │             │                  │
│   │  │Temp/Hum│  │     │             │     │             │                  │
│   │  └───────┘  │     │             │     │             │                  │
│   │  ┌───────┐  │     │             │     │  ┌───────┐  │                  │
│   │  │Battery│──┼────►│ A2          │     │  │Status │  │     │           │
│   │  │Monitor│  │     │             │     │  │LED    │◄─┼────│ D13        │
│   │  └───────┘  │     │             │     │  └───────┘  │                  │
│   │             │     │             │     │  ┌───────┐  │                  │
│   │             │     │             │     │  │Buzzer │◄─┼────│ D5 (PWM)   │
│   │             │     │             │     │  └───────┘  │                  │
│   │   RFID      │     │             │     │             │                  │
│   │  (Optional) │     │             │     │             │                  │
│   │  SS ────────┼────►│ D10         │     │             │                  │
│   │  RST ───────┼────►│ D9          │     │             │                  │
│   │  MOSI ──────┼────►│ D11         │     │             │                  │
│   │  MISO ──────┼────►│ D12         │     │             │                  │
│   │  SCK ───────┼────►│ D13         │     │             │                  │
│   └─────────────┘     └─────────────┘     └─────────────┘                  │
│         │                   │                   │                           │
│         │         POWER     │                   │                           │
│         │                   ▼                   │                           │
│         │              ┌─────────┐              │                           │
│         │              │ 5V/GND  │              │                           │
│         │              └─────────┘              │                           │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                           │
│                             │                                               │
│                        5V/12V PSU                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Sensor Wiring

### 1. Water Level Sensor (JSN-SR04T Ultrasonic)

```
JSN-SR04T (Waterproof Ultrasonic)
┌────────────────────────────────────────┐
│  ┌─────────────────────────────────┐   │
│  │ VCC (Red)    ──────────────► 5V │   │
│  │ GND (Black)  ──────────────► GND│   │
│  │ TRIG (Yellow) ─────────────► D7 │   │
│  │ ECHO (White)   ─────────────► D6 │   │
│  └─────────────────────────────────┘   │
│                                        │
│  Mounting: Above water surface,        │
│  pointing downward                     │
│  Range: 25cm - 450cm                   │
└────────────────────────────────────────┘

Alternative: Pressure Sensor
┌────────────────────────────────────────┐
│  VCC ──────► 5V                        │
│  GND ──────► GND                       │
│  SIG ──────► A0                        │
│  (Submerged at tank bottom)            │
└────────────────────────────────────────┘
```

### 2. Gas Sensor (MQ-2)

```
MQ-2 Gas Sensor Module
┌────────────────────────────────────────┐
│  VCC  ──────────────► 5V               │
│  GND  ──────────────► GND              │
│  AOUT ──────────────► A1               │
│  DOUT ──────────────► (not connected)  │
│                                        │
│  Burn-in: 24-48 hours powered on       │
│  Calibration: In clean air, record R0  │
│  Sensitivity: LPG, Propane, Methane,   │
│  Alcohol, Hydrogen, Smoke              │
└────────────────────────────────────────┘
```

### 3. Temperature/Humidity (DHT11/DHT22)

```
DHT11 / DHT22
┌────────────────────────────────────────┐
│  VCC  ──────────────► 5V               │
│  GND  ──────────────► GND              │
│  DATA ─────────────► D2                │
│                                        │
│  REQUIRED: 4.7kΩ pull-up resistor      │
│  between DATA and VCC                  │
│                                        │
│  DHT11: ±2°C, ±5% RH, 1Hz sampling    │
│  DHT22: ±0.5°C, ±2% RH, 0.5Hz sampling│
└────────────────────────────────────────┘

Wiring:
  5V ──┬── VCC
       │
       ├── 4.7kΩ ── DATA ──► D2
       │
  GND ──┴── GND
```

### 4. Battery Voltage Monitor

```
Voltage Divider (11:1 ratio)
Measures up to 25V with 5V ADC

       Battery+
          │
       ┌──┴──┐
       │ 100k│ R1 (100kΩ, 1%)
       └──┬──┘
          │
       ┌──┴──┐
       │ 10k │ R2 (10kΩ, 1%)
       └──┬──┘
          │
          ├──► A2 (ADC Input)
          │
         GND

Formula: V_bat = V_adc × (R1 + R2) / R2 = V_adc × 11
Max measurable: 5V × 11 = 55V (practical: 25V)
```

## Actuator Wiring

### Pump Relay (5V Relay Module, Active LOW)

```
5V Relay Module
┌────────────────────────────────────────┐
│  Relay Module        Arduino Uno       │
│  ┌──────────────┐     ┌────────────┐   │
│  │ VCC ─────────┼────► 5V          │   │
│  │ GND ─────────┼────► GND         │   │
│  │ IN  ─────────┼────► D3          │   │
│  └──────────────┘     └────────────┘   │
│                                        │
│  Relay Contacts (High Power):          │
│  ┌──────────────────────────────────┐  │
│  │ COM ──────► Pump Power+          │  │
│  │ NO  ──────► Power Supply+        │  │
│  │ Pump - ──────► Power Supply-     │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Active LOW: LOW = ON, HIGH = OFF      │
│  Opto-isolated for protection          │
└────────────────────────────────────────┘

Power Supply for Pump:
  - Match pump voltage (12V/24V typical)
  - Adequate current rating (pump current + 20%)
  - Fuse on positive line (2x pump rating)
```

### Valve Relay (5V Relay Module, Active LOW)

```
5V Relay Module
┌────────────────────────────────────────┐
│  Relay Module        Arduino Uno       │
│  ┌──────────────┐     ┌────────────┐   │
│  │ VCC ─────────┼────► 5V          │   │
│  │ GND ─────────┼────► GND         │   │
│  │ IN  ─────────┼────► D4          │   │
│  └──────────────┘     └────────────┘   │
│                                        │
│  Relay Contacts:                       │
│  ┌──────────────────────────────────┐  │
│  │ COM ──────► Valve Power+         │  │
│  │ NO  ──────► Power Supply+        │  │
│  │ Valve - ─────► Power Supply-     │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Active LOW: LOW = OPEN, HIGH = CLOSED │
└────────────────────────────────────────┘
```

## Status Indicators

### Status LED (D13 - Built-in)

```
Arduino Uno
┌────────────────────────────────────────┐
│  D13 (PB5) ──────► Built-in LED        │
│                                        │
│  Blink Patterns:                       │
│  • 3 quick blinks = Startup complete   │
│  • Slow blink (1Hz) = Normal operation │
│  • Fast blink (5Hz) = Error/Warning    │
│  • Solid ON = Emergency stop           │
│  • OFF = Power off / Deep sleep        │
└────────────────────────────────────────┘
```

### Buzzer (D5 - PWM)

```
Passive Buzzer
┌────────────────────────────────────────┐
│  Buzzer          Arduino Uno           │
│  ┌──────────┐    ┌────────────┐        │
│  │ + ───────┼────► D5 (PWM)   │        │
│  │ - ───────┼────► GND        │        │
│  └──────────┘    └────────────┘        │
│                                        │
│  Tone Functions:                       │
│  • tone(5, 1000, 100) = Beep           │
│  • tone(5, 2000, 500) = Alert          │
│  • tone(5, 500, 1000) = Warning        │
│  • noTone(5) = Stop                    │
└────────────────────────────────────────┘
```

## Power Distribution

```
Power Supply Options:
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  Option 1: USB Power (Development)                                 │
│  ─────────────────────────────────────────                         │
│  USB 5V ──► Arduino USB ──► 5V Regulator ──► All Components       │
│  Max Current: 500mA                                                │
│                                                                    │
│  Option 2: Barrel Jack (Production)                                │
│  ─────────────────────────────────────────                         │
│  7-12V DC ──► Barrel Jack ──► Arduino Vin ──► 5V Regulator        │
│  Max Current: 800mA (limited by regulator)                        │
│                                                                    │
│  Option 3: External 5V Supply (High Power)                         │
│  ─────────────────────────────────────────                         │
│  5V/3A ──► 5V Pin ──► Direct to 5V Rail ──► All Components        │
│  Bypass Arduino regulator                                          │
│  Must provide clean 5V ±5%                                         │
│                                                                    │
│  Power Budget (Typical):                                           │
│  ────────────────────────                                           │
│  Arduino Uno:           ~50mA                                      │
│  Sensors (all):         ~100mA                                     │
│  Relays (2x):           ~140mA (70mA each when ON)                │
│  Buzzer:                ~30mA                                      │
│  RFID (optional):       ~50mA                                      │
│  ────────────────────────                                           │
│  Total:                 ~370mA (well under 500mA USB limit)       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Grounding Scheme

```
Single-Point Ground (Star Grounding)

         ┌─────────────────────────┐
         │      ARDUINO GND        │
         │      (Star Point)       │
         └───────────┬─────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Sensors │  │Relays/  │  │ Status  │
   │  GND    │  │Actuators│  │ LED/    │
   │         │  │  GND    │  │ Buzzer  │
   └─────────┘  └─────────┘  └─────────┘
        │            │            │
        └────────────┼────────────┘
                     │
              ┌──────┴──────┐
              │  Power      │
              │  Supply     │
              │  GND        │
              └─────────────┘

Rules:
• All grounds connect to Arduino GND (single point)
• No ground loops
• Power supply negative = Arduino GND
• Shield cables connected at one end only
```

## Cable Management

### Cable Lengths (Recommended)

| Connection | Max Length | Type |
|------------|------------|------|
| Sensors | 2m | Shielded twisted pair |
| Relays | 1m | 22 AWG |
| Power | 1m | 18 AWG |
| Serial (USB) | 3m | USB 2.0 cable |
| RFID | 0.5m | Ribbon cable |

### Connector Types

| Component | Connector |
|-----------|-----------|
| Sensors | JST-XH 3-pin / Terminal block |
| Relays | Terminal block / JST-XH |
| Power | Barrel jack / Screw terminal |
| RFID | 2.54mm header |
| Programming | USB-B |

## Safety Considerations

### Electrical Safety

1. **Isolation**: Relay modules provide opto-isolation between Arduino and high-power circuits
2. **Fusing**: All actuator power lines must have fuses
3. **Grounding**: All metal enclosures connected to earth ground
4. **Enclosure**: IP65 rated for wet environments

### Emergency Stop

```
Hardware E-Stop (Optional)
┌────────────────────────────────────────┐
│  E-Stop Button (NC)                    │
│  ┌──────────────┐                      │
│  │ COM ────────┼────► Safety Circuit  │
│  │ NC  ────────┼────► Interrupts      │
│  └──────────────┘     Power to Relays  │
│                                        │
│  Pressing E-Stop:                      │
│  • Immediately cuts power to all relays│
│  • Triggers firmware emergency stop    │
│  • Requires manual reset               │
└────────────────────────────────────────┘
```

## Testing Connections

### Continuity Checklist

- [ ] All GND connections continuous
- [ ] 5V rail continuous to all sensors
- [ ] Relay IN pins connected to correct Arduino pins
- [ ] Sensor signal pins connected to correct Arduino pins
- [ ] No shorts between power and ground
- [ ] Relay contacts isolated from control circuit
- [ ] Battery divider resistors correct values
- [ ] DHT11 pull-up resistor installed

### Functional Tests

1. **Power On**: Arduino boots, status LED blinks 3x
2. **Serial**: Open serial monitor at 115200, see startup message
3. **Sensors**: Each sensor reports valid readings
4. **Relays**: Click audible when activated via serial command
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
| 1.0 | 2024-01-15 | Initial wiring documentation |