/**
 * Pin Definitions for Catalyst Mk1
 * Arduino Uno (ATmega328P)
 */

#ifndef PINS_H
#define PINS_H

// ============================================================================
// Sensor Pins (Analog/Digital)
// ============================================================================

// Water Level Sensor (Ultrasonic JSN-SR04T or Pressure)
// Trigger/Echo on single pin for single-wire ultrasonic, or separate pins
#define PIN_WATER_LEVEL_TRIG    7
#define PIN_WATER_LEVEL_ECHO    6
// For single-wire sensors like JSN-SR04T
#define PIN_WATER_LEVEL         A0

// Gas Sensor (MQ-2) - Analog
#define PIN_GAS_SENSOR          A1

// Temperature/Humidity (DHT11/DHT22) - Digital
#define PIN_DHT11               2

// Battery Voltage Monitor - Analog (via voltage divider)
#define PIN_BATTERY_VOLTAGE     A2

// ============================================================================
// Actuator Pins (Digital Outputs)
// ============================================================================

// Pump Relay - Active LOW (relay module)
#define PIN_RELAY_PUMP          3

// Valve Relay - Active LOW (relay module)
#define PIN_RELAY_VALVE         4

// ============================================================================
// Communication Pins
// ============================================================================

// RFID RC522 (SPI)
#define PIN_RFID_SS             10
#define PIN_RFID_RST            9
// SPI pins (fixed on Uno): MOSI=11, MISO=12, SCK=13

// Serial (USB) - Hardware Serial (pins 0, 1)
// Hardware Serial1 not available on Uno

// ============================================================================
// Status/Indicator Pins
// ============================================================================

// Status LED (built-in on pin 13)
#define PIN_LED_STATUS          13

// Buzzer (PWM capable)
#define PIN_BUZZER              5

// ============================================================================
// Optional/Expansion Pins
// ============================================================================

// Additional relays (if needed)
#define PIN_RELAY_3             5
#define PIN_RELAY_4             6

// SD Card (SPI) - shares SPI with RFID
// #define PIN_SD_CS              8

// I2C (A4=SDA, A5=SCL) - for future expansion
// #define PIN_I2C_SDA           A4
// #define PIN_I2C_SCL           A5

// ============================================================================
// Relay Configuration
// ============================================================================

// Relay active state (LOW = active for most relay modules)
#define RELAY_ACTIVE_LOW        true
#define RELAY_ACTIVE_HIGH       false

#define RELAY_DEFAULT_STATE     false  // OFF by default

// ============================================================================
// ADC Reference
// ============================================================================

// ADC reference voltage (5V for Uno)
#define ADC_REF_VOLTAGE         5.0

// Battery voltage divider ratio
// R1 = 100kΩ (top), R2 = 10kΩ (bottom)
// V_bat = V_adc * (R1 + R2) / R2 = V_adc * 11
#define BATTERY_DIVIDER_RATIO   11.0

// ============================================================================
// DHT Configuration
// ============================================================================

#define DHT_TYPE                DHT11  // or DHT22
#define DHT_READ_INTERVAL_MS    2000

#endif // PINS_H