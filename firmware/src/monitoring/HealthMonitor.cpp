#include "HealthMonitor.h"
#include "utils/TimeUtils.h"

HealthMonitor::HealthMonitor() {}

void HealthMonitor::begin() {
    _startTime = TimeUtils::getMillis();
    _uptimeSeconds = 0;
    _freeHeap = ESP.getFreeHeap();
    _minFreeHeap = _freeHeap;
}

void HealthMonitor::update() {
    uint32_t now = TimeUtils::getMillis();
    _uptimeSeconds = (now - _startTime) / 1000;
    _freeHeap = ESP.getFreeHeap();
    if (_freeHeap < _minFreeHeap) _minFreeHeap = _freeHeap;
    
    // CPU usage estimation (simplified)
    // _cpuUsage = calculateCPUUsage();
    
    // CPU temperature (if available)
    // _cpuTemperature = readCPUTemperature();
}

HealthMonitor::Metrics HealthMonitor::getMetrics() const {
    Metrics m;
    m.uptimeSeconds = _uptimeSeconds;
    m.freeHeap = _freeHeap;
    m.minFreeHeap = _minFreeHeap;
    m.errors = _errors;
    m.warnings = 0;
    m.cpuUsage = 0;
    m.cpuTemperature = 0;
    m.watchdogOk = true;
    m.sdCardOk = false;
    m.sensorsOk = true;
    m.actuatorsOk = true;
    return m;
}

void HealthMonitor::recordError(const char* error) {
    if (_errorCount < 32) {
        _errorHistory[_errorHead].timestamp = TimeUtils::getUnixTime();
        strncpy(_errorHistory[_errorHead].message, error, 63);
        _errorHistory[_errorHead].message[63] = '\0';
        _errorHead = (_errorHead + 1) % 32;
        if (_errorCount < 32) _errorCount++;
    }
    _errors++;
}

void HealthMonitor::recordWarning(const char* warning) {
    // Similar to recordError but for warnings
}

void HealthMonitor::setSensorStatus(uint8_t sensorType, bool ok) {
    // Update sensor status
}

void HealthMonitor::setActuatorStatus(uint8_t actuatorType, bool ok) {
    // Update actuator status
}

uint32_t HealthMonitor::getFreeHeap() const {
    return ESP.getFreeHeap();
}