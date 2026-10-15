# Catalyst Mk1 Pinout Reference

## Arduino Uno (ATmega328P) Pin Assignments

### Digital Pins

| Pin | Function | Description |
|-----|----------|-------------|
| 0 | RX | Serial receive (USB) |
| 1 | TX | Serial transmit (USB) |
| 2 | DHT11 | Temperature/Humidity sensor data |
| 3 | RELAY_PUMP | Pump relay control (Active LOW) |
| 4 | RELAY_VALVE | Valve relay control (Active LOW) |
| 5 | BUZZER | Buzzer (PWM) |
| 6 | WATER_LEVEL_ECHO | Ultrasonic sensor echo |
| 7 | WATER_LEVEL_TRIG | Ultrasonic sensor trigger |
| 8 | - | Available for expansion |
| 9 | RFID_RST | RFID RC522 reset |
| 10 | RFID_SS | RFID RC522 SPI SS |
| 11 | MOSI | SPI Master Out Slave In |
| 12 | MISO | SPI Master In Slave Out |
| 13 | SCK / LED_STATUS | SPI Clock / Status LED |

### Analog Pins

| Pin | Function | Description |
|-----|----------|-------------|
| A0 | WATER_LEVEL | Water level sensor (ultrasonic/pressure) |
| A1 | GAS_SENSOR | MQ-2 gas sensor |
| A2 | BATTERY_VOLTAGE | Battery voltage monitor (via divider) |
| A3 | - | Available for expansion |
| A4 | SDA | I2C data (expansion) |
| A5 | SCL | I2C clock (expansion) |

## Power Connections

| Connection | Voltage | Description |
|------------|---------|-------------|
| USB | 5V | Power from USB |
| Barrel Jack | 7-12V | External power supply |
| VIN | 7-12V | Input voltage (after barrel jack) |
| 5V | 5V | Regulated 5V output |
| 3.3V | 3.3V | Regulated 3.3V output |
| GND | 0V | Ground |

## Sensor Wiring Diagrams

### Water Level Sensor (JSN-SR04T Ultrasonic)

```
JSN-SR04T          Arduino Uno
---------          -----------
VCC       ------>  5V
GND       ------>  GND
TRIG      ------>  D7
ECHO      ------>  D6
```

### Gas Sensor (MQ-2)

```
MQ-2             Arduino Uno
----             -----------
VCC       ------>  5V
GND       ------>  GND
AOUT      ------>  A1
DOUT      ------>  (not used)
```

### Temperature/Humidity (DHT11)

```
DHT11            Arduino Uno
-----            -----------
VCC       ------>  5V
GND       ------>  GND
DATA      ------>  D2
(Pull-up 4.7kΩ between DATA and VCC)
```

### Battery Voltage Monitor

```
Voltage Divider:  100kΩ (R1) + 10kΩ (R2)
                    Battery+
                       |
                      [R1] 100kΩ
                       |
                       +-------> A2 (ADC)
                       |
                      [R2] 10kΩ
                       |
                      GND

Measures up to 25V (5V * 11)
```

## Actuator Wiring

### Pump Relay (Active LOW)

```
Relay Module       Arduino Uno
----------         -----------
VCC       ------>  5V
GND       ------>  GND
IN        ------>  D3
COM       ------>  Pump Power+
NO        ------>  Power Supply+
Pump -    ------>  Power Supply-
```

### Valve Relay (Active LOW)

```
Relay Module       Arduino Uno
----------         -----------
VCC       ------>  5V
GND       ------>  GND
IN        ------>  D4
COM       ------>  Valve Power+
NO        ------>  Power Supply+
Valve -   ------>  Power Supply-
```

## RFID RC522 (Optional)

```
RC522            Arduino Uno
----             -----------
VCC       ------>  3.3V
GND       ------>  GND
RST       ------>  D9
SS        ------>  D10
MOSI      ------>  D11
MISO      ------>  D12
SCK       ------>  D13
```

## Expansion Headers

### I2C Expansion (A4/A5)
- A4: SDA
- A5: SCL
- Compatible with: RTC, additional sensors, displays

### SPI Expansion (D11/D12/D13)
- D11: MOSI
- D12: MISO
- D13: SCK
- Can add additional SPI devices with separate CS pins

## Notes

1. **Relay modules are Active LOW** - LOW = ON, HIGH = OFF
2. **Ultrasonic sensor** uses D7 (TRIG) and D6 (ECHO)
3. **DHT11** requires 4.7kΩ pull-up resistor on data line
4. **Battery divider** allows measuring up to 25V (11:1 ratio)
5. **Status LED** on D13 shows system status
6. **Buzzer** on D5 (PWM) for audible alerts
7. **All sensors powered from 5V** - ensure adequate current capacity
8. **Total current draw** should not exceed 500mA from USB or 800mA from barrel jack

## Pin Conflicts to Avoid

- D0/D1: Used for USB serial - avoid for other functions
- D10-D13: SPI bus - shared with RFID, SD card
- A4/A5: I2C bus - shared with RTC, displays
- D2: DHT11 - timing critical, avoid interrupts
- D3/D4: PWM capable - used for relays
- D5/D6: PWM capable - buzzer, ultrasonic echo

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-15 | Initial pinout for Catalyst Mk1 |