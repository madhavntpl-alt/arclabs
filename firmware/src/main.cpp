/**
 * ARC LABS Catalyst Mk1 Firmware
 * Main entry point: setup() + loop()
 * 
 * Hardware: Arduino Uno (ATmega328P)
 * Sensors: Water Level (Ultrasonic), Gas (MQ-2), Temp/Humidity (DHT11), Battery
 * Actuators: Pump Relay, Valve Relay
 * Communication: JSON Lines over Serial @ 115200 baud
 */

#include <Arduino.h>
#include <ArduinoJson.h>
#include <DHT.h>

#include "config/pins.h"
#include "config/constants.h"
#include "config/thresholds.h"
#include "sensors/SensorBase.h"
#include "sensors/WaterLevelSensor.h"
#include "sensors/GasSensor.h"
#include "sensors/TempHumiditySensor.h"
#include "sensors/BatteryMonitor.h"
#include "actuators/Relay.h"
#include "actuators/Pump.h"
#include "comm/SerialProtocol.h"
#include "comm/RFIDReader.h"
#include "control/AutomationEngine.h"
#include "control/SafetyInterlocks.h"
#include "control/StateMachine.h"
#include "monitoring/DataLogger.h"
#include "monitoring/HealthMonitor.h"
#include "monitoring/Diagnostics.h"
#include "utils/CRC.h"
#include "utils/RingBuffer.h"
#include "utils/TimeUtils.h"

// ============================================================================
// Global Instances
// ============================================================================

// Sensors
WaterLevelSensor waterLevelSensor(PIN_WATER_LEVEL);
GasSensor gasSensor(PIN_GAS_SENSOR);
TempHumiditySensor tempHumiditySensor(PIN_DHT11);
BatteryMonitor batteryMonitor(PIN_BATTERY_VOLTAGE);

// Actuators
Relay pumpRelay(PIN_RELAY_PUMP, RELAY_ACTIVE_LOW);
Relay valveRelay(PIN_RELAY_VALVE, RELAY_ACTIVE_LOW);
Pump pump(pumpRelay);

// Communication
SerialProtocol serialProtocol;
RFIDReader rfidReader(PIN_RFID_SS, PIN_RFID_RST);

// Control
AutomationEngine automationEngine;
SafetyInterlocks safetyInterlocks;
StateMachine stateMachine;

// Monitoring
DataLogger dataLogger;
HealthMonitor healthMonitor;
Diagnostics diagnostics;

// Timing
unsigned long lastSensorRead = 0;
unsigned long lastStatusSend = 0;
unsigned long lastHeartbeat = 0;

// ============================================================================
// Setup
// ============================================================================

void setup() {
    // Initialize serial communication
    Serial.begin(SERIAL_BAUDRATE);
    while (!Serial && millis() < 2000) {
        // Wait for serial connection (for native USB boards)
    }
    
    // Initialize pins
    pinMode(PIN_LED_STATUS, OUTPUT);
    pinMode(PIN_BUZZER, OUTPUT);
    
    // Initialize sensors
    waterLevelSensor.begin();
    gasSensor.begin();
    tempHumiditySensor.begin();
    batteryMonitor.begin();
    
    // Initialize actuators
    pumpRelay.begin();
    valveRelay.begin();
    pump.begin();
    
    // Initialize RFID (optional)
    #ifdef ENABLE_RFID
    rfidReader.begin();
    #endif
    
    // Initialize control systems
    safetyInterlocks.begin();
    automationEngine.begin();
    stateMachine.begin();
    
    // Initialize monitoring
    dataLogger.begin();
    healthMonitor.begin();
    diagnostics.begin();
    
    // Load configuration from EEPROM
    loadConfiguration();
    
    // Send startup event
    sendDeviceStatus();
    sendEvent("system_startup", "info", "System initialized");
    
    // Status LED blink to indicate ready
    for (int i = 0; i < 3; i++) {
        digitalWrite(PIN_LED_STATUS, HIGH);
        delay(100);
        digitalWrite(PIN_LED_STATUS, LOW);
        delay(100);
    }
}

// ============================================================================
// Main Loop
// ============================================================================

void loop() {
    unsigned long currentMillis = millis();
    
    // Read serial commands
    serialProtocol.processIncoming();
    
    // Read sensors at defined interval
    if (currentMillis - lastSensorRead >= SENSOR_READ_INTERVAL_MS) {
        readAllSensors();
        lastSensorRead = currentMillis;
    }
    
    // Send device status periodically
    if (currentMillis - lastStatusSend >= STATUS_SEND_INTERVAL_MS) {
        sendDeviceStatus();
        lastStatusSend = currentMillis;
    }
    
    // Send heartbeat
    if (currentMillis - lastHeartbeat >= HEARTBEAT_INTERVAL_MS) {
        sendHeartbeat();
        lastHeartbeat = currentMillis;
    }
    
    // Run automation engine
    automationEngine.evaluate();
    
    // Check safety interlocks
    safetyInterlocks.check();
    
    // Update state machine
    stateMachine.update();
    
    // Update monitoring
    healthMonitor.update();
    diagnostics.update();
    
    // Log data if enabled
    dataLogger.log();
    
    // Handle RFID
    #ifdef ENABLE_RFID
    rfidReader.check();
    #endif
    
    // Small delay to prevent watchdog issues
    delay(1);
}

// ============================================================================
// Sensor Reading
// ============================================================================

void readAllSensors() {
    // Read water level
    float waterLevel = waterLevelSensor.read();
    if (waterLevel >= 0) {
        sendSensorReading("water_level", waterLevel, "cm");
    }
    
    // Read gas
    float gas = gasSensor.read();
    if (gas >= 0) {
        sendSensorReading("gas", gas, "ppm");
    }
    
    // Read temperature and humidity
    float temperature = tempHumiditySensor.readTemperature();
    float humidity = tempHumiditySensor.readHumidity();
    if (temperature != NAN) {
        sendSensorReading("temperature", temperature, "°C");
    }
    if (humidity != NAN) {
        sendSensorReading("humidity", humidity, "%");
    }
    
    // Read battery
    float battery = batteryMonitor.read();
    if (battery >= 0) {
        sendSensorReading("battery", battery, "V");
    }
}

// ============================================================================
// Serial Communication
// ============================================================================

void sendSensorReading(const char* sensor, float value, const char* unit) {
    StaticJsonDocument<256> doc;
    doc["type"] = "sensor_reading";
    doc["sensor"] = sensor;
    doc["value"] = value;
    doc["unit"] = unit;
    doc["timestamp"] = TimeUtils::getUnixTime();
    
    String output;
    serializeJson(doc, output);
    Serial.println(output);
}

void sendDeviceStatus() {
    StaticJsonDocument<512> doc;
    doc["type"] = "device_status";
    doc["timestamp"] = TimeUtils::getUnixTime();
    
    JsonObject payload = doc.createNestedObject("payload");
    payload["firmware_version"] = FIRMWARE_VERSION;
    payload["hardware_version"] = HARDWARE_VERSION;
    payload["uptime_seconds"] = millis() / 1000;
    payload["free_heap"] = ESP.getFreeHeap();  // For ESP boards, use freeMemory() for AVR
    
    JsonArray sensorsActive = payload.createNestedArray("sensors_active");
    sensorsActive.add("water_level");
    sensorsActive.add("temperature");
    sensorsActive.add("humidity");
    sensorsActive.add("gas");
    sensorsActive.add("battery");
    
    JsonObject actuatorsState = payload.createNestedObject("actuators_state");
    actuatorsState["pump"] = pump.isRunning();
    actuatorsState["valve"] = valveRelay.getState();
    
    String output;
    serializeJson(doc, output);
    Serial.println(output);
}

void sendEvent(const char* eventType, const char* severity, const char* message) {
    StaticJsonDocument<256> doc;
    doc["type"] = "event";
    doc["timestamp"] = TimeUtils::getUnixTime();
    
    JsonObject payload = doc.createNestedObject("payload");
    payload["event_type"] = eventType;
    payload["severity"] = severity;
    payload["message"] = message;
    
    String output;
    serializeJson(doc, output);
    Serial.println(output);
}

void sendCommandAck(const char* commandId, bool success, const char* message) {
    StaticJsonDocument<256> doc;
    doc["type"] = "command_ack";
    doc["timestamp"] = TimeUtils::getUnixTime();
    
    JsonObject payload = doc.createNestedObject("payload");
    payload["command_id"] = commandId;
    payload["success"] = success;
    if (message) payload["message"] = message;
    
    String output;
    serializeJson(doc, output);
    Serial.println(output);
}

void sendHeartbeat() {
    StaticJsonDocument<128> doc;
    doc["type"] = "heartbeat";
    doc["timestamp"] = TimeUtils::getUnixTime();
    
    JsonObject payload = doc.createNestedObject("payload");
    payload["uptime_seconds"] = millis() / 1000;
    payload["free_heap"] = ESP.getFreeHeap();
    
    String output;
    serializeJson(doc, output);
    Serial.println(output);
}

// ============================================================================
// Configuration
// ============================================================================

void loadConfiguration() {
    // Load from EEPROM
    // Implementation depends on storage library
}

void saveConfiguration() {
    // Save to EEPROM
}

// ============================================================================
// Command Handlers (called from SerialProtocol)
// ============================================================================

void handlePumpOn(JsonObject params) {
    int duration = params["duration"] | 30;
    if (safetyInterlocks.canActivatePump()) {
        pump.start(duration * 1000);
        sendCommandAck("pump_on", true, "Pump started");
        sendEvent("automation_triggered", "info", "Pump activated via command");
    } else {
        sendCommandAck("pump_on", false, "Safety interlock prevents pump activation");
    }
}

void handlePumpOff() {
    pump.stop();
    sendCommandAck("pump_off", true, "Pump stopped");
}

void handleRelaySet(JsonObject params) {
    int relay = params["relay"] | 1;
    bool state = params["state"] | false;
    
    if (relay == 1) {
        pumpRelay.setState(state);
    } else if (relay == 2) {
        valveRelay.setState(state);
    }
    sendCommandAck("relay_set", true, "Relay state changed");
}

void handleCalibrate(JsonObject params) {
    const char* sensor = params["sensor"] | "";
    float value = params["value"] | 0;
    
    // Implementation depends on sensor
    sendCommandAck("calibrate", true, "Calibration saved");
}

void handleReset() {
    sendCommandAck("reset", true, "Resetting...");
    delay(100);
    // Reset via watchdog or software reset
    asm volatile ("jmp 0");
}

void handleGetStatus() {
    sendDeviceStatus();
}

// ============================================================================
// Serial Protocol Callback
// ============================================================================

void onCommandReceived(JsonObject command) {
    const char* cmd = command["command"] | "";
    String commandId = command["command_id"] | "";
    JsonObject params = command["params"];
    
    if (strcmp(cmd, "pump_on") == 0) {
        handlePumpOn(params);
    } else if (strcmp(cmd, "pump_off") == 0) {
        handlePumpOff();
    } else if (strcmp(cmd, "relay_set") == 0) {
        handleRelaySet(params);
    } else if (strcmp(cmd, "calibrate") == 0) {
        handleCalibrate(params);
    } else if (strcmp(cmd, "reset") == 0) {
        handleReset();
    } else if (strcmp(cmd, "get_status") == 0) {
        handleGetStatus();
    } else {
        sendCommandAck(commandId.c_str(), false, "Unknown command");
    }
}

// Register callback
void setupCommandCallback() {
    serialProtocol.setCommandCallback(onCommandReceived);
}