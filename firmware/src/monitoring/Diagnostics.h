/**
 * Diagnostics
 * System diagnostics and self-tests
 */

#ifndef DIAGNOSTICS_H
#define DIAGNOSTICS_H

#include <Arduino.h>
#include "config/constants.h"

class Diagnostics {
public:
    Diagnostics();
    
    void begin();
    void update();
    
    // Run all self-tests
    bool runSelfTest();
    
    // Individual tests
    bool testSensors();
    bool testActuators();
    bool testCommunication();
    bool testMemory();
    bool testStorage();
    bool testWatchdog();
    
    // Get test results
    struct TestResult {
        const char* name;
        bool passed;
        const char* message;
        uint32_t durationMs;
    };
    
    TestResult getLastResult() const;
    bool allTestsPassed() const { return _allPassed; }
    
    // Get diagnostic info
    struct DiagnosticInfo {
        uint32_t uptime;
        uint32_t freeHeap;
        uint16_t errors;
        uint16_t warnings;
        bool sensorsOk;
        bool actuatorsOk;
        bool commsOk;
        bool storageOk;
    };
    
    DiagnosticInfo getInfo() const;

private:
    bool _allPassed = false;
    TestResult _lastResult;
    uint32_t _lastTestTime = 0;
    
    // Run individual test
    bool runTest(const char* name, bool (*testFunc)(), const char* failMessage);
};

#endif // DIAGNOSTICS_H