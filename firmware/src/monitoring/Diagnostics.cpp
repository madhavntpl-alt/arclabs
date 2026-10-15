#include "Diagnostics.h"
#include "utils/TimeUtils.h"

Diagnostics::Diagnostics() : _allPassed(false), _lastTestTime(0) {}

void Diagnostics::begin() {
    _allPassed = false;
}

void Diagnostics::update() {
    // Periodic diagnostics could run here
}

bool Diagnostics::runSelfTest() {
    _allPassed = true;
    _lastTestTime = TimeUtils::getMillis();
    
    // Run all tests
    bool sensorsOk = testSensors();
    bool actuatorsOk = testActuators();
    bool commsOk = testCommunication();
    bool memoryOk = testMemory();
    bool storageOk = testStorage();
    bool watchdogOk = testWatchdog();
    
    _allPassed = sensorsOk && actuatorsOk && commsOk && memoryOk && storageOk && watchdogOk;
    
    return _allPassed;
}

bool Diagnostics::testSensors() {
    // Test each sensor
    // This would read from actual sensors and verify they return valid values
    return true;  // Placeholder
}

bool Diagnostics::testActuators() {
    // Test each actuator
    // Would briefly activate each and verify response
    return true;  // Placeholder
}

bool Diagnostics::testCommunication() {
    // Test serial communication
    // Could send test message and verify echo
    return true;  // Placeholder
}

bool Diagnostics::testMemory() {
    // Check heap fragmentation, stack usage
    uint32_t freeHeap = ESP.getFreeHeap();
    if (freeHeap < 1024) return false;
    return true;
}

bool Diagnostics::testStorage() {
    // Test SD card if present
    return true;  // Placeholder
}

bool Diagnostics::testWatchdog() {
    // Test watchdog functionality
    return true;  // Placeholder
}

Diagnostics::TestResult Diagnostics::getLastResult() const {
    return _lastResult;
}

Diagnostics::DiagnosticInfo Diagnostics::getInfo() const {
    DiagnosticInfo info;
    info.uptime = millis() / 1000;
    info.freeHeap = ESP.getFreeHeap();
    info.errors = 0;
    info.warnings = 0;
    info.sensorsOk = true;
    info.actuatorsOk = true;
    info.commsOk = true;
    info.storageOk = true;
    return info;
}

bool Diagnostics::runTest(const char* name, bool (*testFunc)(), const char* failMessage) {
    uint32_t start = TimeUtils::getMillis();
    bool passed = testFunc();
    uint32_t duration = TimeUtils::getMillis() - start;
    
    if (!passed) {
        _allPassed = false;
        _lastResult = {name, false, failMessage, duration};
        return false;
    }
    
    _lastResult = {name, true, "OK", duration};
    return true;
}