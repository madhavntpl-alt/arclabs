#include "SafetyInterlocks.h"
#include "utils/TimeUtils.h"

SafetyInterlocks::SafetyInterlocks() : 
    _minWaterLevel(SAFETY_MIN_WATER_LEVEL_CM),
    _maxTemperature(SAFETY_MAX_TEMP_C),
    _minBattery(SAFETY_MIN_BATTERY_V),
    _waterLevel(0),
    _temperature(0),
    _batteryVoltage(0),
    _pumpRunning(false),
    _valveOpen(false),
    _emergencyStop(false),
    _emergencyStopTime(0),
    _lastWatchdogReset(0),
    _watchdogEnabled(WATCHDOG_ENABLED),
    _violations(0),
    _lastViolationTime(0),
    _estopPin(255)
{}

void SafetyInterlocks::begin() {
    _lastWatchdogReset = TimeUtils::getMillis();
    _emergencyStop = false;
    _violations = 0;
    
    // Configure emergency stop pin if defined
    if (_estopPin != 255) {
        pinMode(_estopPin, INPUT_PULLUP);
    }
    
    // Initialize watchdog if enabled
    if (_watchdogEnabled) {
        // Watchdog initialization would go here
        // For AVR: wdt_enable(WDTO_8S);
    }
}

void SafetyInterlocks::check() {
    checkWatchdog();
    checkSensorLimits();
}

bool SafetyInterlocks::canActivatePump() const {
    if (_emergencyStop) return false;
    if (_waterLevel < _minWaterLevel) return false;
    if (_temperature > 60.0) return false;  // Emergency temp limit
    if (_batteryVoltage < _minBattery) return false;
    return true;
}

bool SafetyInterlocks::canActivateValve() const {
    if (_emergencyStop) return false;
    if (_batteryVoltage < _minBattery) return false;
    return true;
}

void SafetyInterlocks::emergencyStop() {
    _emergencyStop = true;
    _emergencyStopTime = TimeUtils::getMillis();
}

void SafetyInterlocks::resetEmergencyStop() {
    _emergencyStop = false;
}

void SafetyInterlocks::updateSensorReading(uint8_t sensorType, float value) {
    switch (sensorType) {
        case 0: _waterLevel = value; break;      // water_level
        case 1: _temperature = value; break;     // temperature
        case 2: break;  // humidity
        case 3: break;  // gas
        case 4: _batteryVoltage = value; break;  // battery
    }
}

void SafetyInterlocks::updateActuatorState(uint8_t actuatorType, bool state) {
    switch (actuatorType) {
        case 0: _pumpRunning = state; break;  // pump
        case 1: _valveOpen = state; break;    // valve
    }
}

SafetyInterlocks::SafetyStatus SafetyInterlocks::getStatus() const {
    SafetyStatus status;
    status.emergencyStop = _emergencyStop;
    status.pumpAllowed = canActivatePump();
    status.valveAllowed = canActivateValve();
    status.watchdogOk = true;  // Simplified
    status.violations = _violations;
    return status;
}

void SafetyInterlocks::checkWatchdog() {
    if (!_watchdogEnabled) return;
    
    uint32_t now = TimeUtils::getMillis();
    if (now - _lastWatchdogReset > WATCHDOG_TIMEOUT_MS) {
        // Watchdog timeout - emergency stop
        _emergencyStop = true;
        _emergencyStopTime = TimeUtils::getMillis();
    }
}

void SafetyInterlocks::checkSensorLimits() {
    uint32_t now = TimeUtils::getMillis();
    bool violation = false;
    
    if (_waterLevel < _minWaterLevel) violation = true;
    if (_temperature > 60.0) violation = true;  // Hard limit
    if (_batteryVoltage < 3.0) violation = true;  // Hard limit
    
    if (violation) {
        _violations++;
        _lastViolationTime = TimeUtils::getMillis();
        
        if (_violations > 10) {
            // Too many violations - emergency stop
            _emergencyStop = true;
        }
    }
}

void SafetyInterlocks::resetWatchdog() {
    _lastWatchdogReset = TimeUtils::getMillis();
}