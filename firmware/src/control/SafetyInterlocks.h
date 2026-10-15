/**
 * Safety Interlocks
 * Hardware watchdog, E-stop, and safety checks
 */

#ifndef SAFETY_INTERLOCKS_H
#define SAFETY_INTERLOCKS_H

#include <Arduino.h>
#include "config/constants.h"

class SafetyInterlocks {
public:
    SafetyInterlocks();
    
    void begin();
    void check();
    
    // Check if pump can be activated
    bool canActivatePump() const;
    
    // Check if valve can be activated
    bool canActivateValve() const;
    
    // Emergency stop
    void emergencyStop();
    
    // Reset emergency stop
    void resetEmergencyStop();
    
    // Check if emergency stop is active
    bool isEmergencyStopActive() const { return _emergencyStop; }
    
    // Register sensor readings for safety checks
    void updateSensorReading(uint8_t sensorType, float value);
    
    // Register actuator states
    void updateActuatorState(uint8_t actuatorType, bool state);
    
    // Get safety status
    struct SafetyStatus {
        bool emergencyStop = false;
        bool pumpAllowed = true;
        bool valveAllowed = true;
        bool watchdogOk = true;
        uint8_t violations = 0;
    };
    
    SafetyStatus getStatus() const;

private:
    // Safety thresholds
    float _minWaterLevel = SAFETY_MIN_WATER_LEVEL_CM;
    float _maxTemperature = SAFETY_MAX_TEMP_C;
    float _minBattery = SAFETY_MIN_BATTERY_V;
    
    // Current readings
    float _waterLevel = 0;
    float _temperature = 0;
    float _batteryVoltage = 0;
    
    // Actuator states
    bool _pumpRunning = false;
    bool _valveOpen = false;
    
    // Emergency stop
    bool _emergencyStop = false;
    uint32_t _emergencyStopTime = 0;
    
    // Watchdog
    uint32_t _lastWatchdogReset = 0;
    bool _watchdogEnabled = WATCHDOG_ENABLED;
    
    // Violation tracking
    uint8_t _violations = 0;
    uint32_t _lastViolationTime = 0;
    
    // Emergency stop pin
    uint8_t _estopPin = 255;  // Not configured by default
    
    // Check watchdog
    void checkWatchdog();
    
    // Check sensor limits
    void checkSensorLimits();
    
    // Reset watchdog
    void resetWatchdog();
};

#endif // SAFETY_INTERLOCKS_H