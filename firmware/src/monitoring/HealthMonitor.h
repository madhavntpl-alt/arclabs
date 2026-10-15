/**
 * Health Monitor
 * Uptime, free RAM, errors, system health
 */

#ifndef HEALTH_MONITOR_H
#define HEALTH_MONITOR_H

#include <Arduino.h>
#include "config/constants.h"

class HealthMonitor {
public:
    HealthMonitor();
    
    void begin();
    void update();
    
    // Get health metrics
    struct Metrics {
        uint32_t uptimeSeconds = 0;
        uint32_t freeHeap = 0;
        uint32_t minFreeHeap = 0;
        uint16_t errors = 0;
        uint16_t warnings = 0;
        uint8_t cpuUsage = 0;
        float cpuTemperature = 0;
        bool watchdogOk = true;
        bool sdCardOk = false;
        bool sensorsOk = true;
        bool actuatorsOk = true;
    };
    
    Metrics getMetrics() const;
    
    // Record error
    void recordError(const char* error);
    
    // Record warning
    void recordWarning(const char* warning);
    
    // Update sensor/actuator status
    void setSensorStatus(uint8_t sensorType, bool ok);
    void setActuatorStatus(uint8_t actuatorType, bool ok);
    
    // Get uptime
    uint32_t getUptime() const { return _uptimeSeconds; }
    
    // Get free heap
    uint32_t getFreeHeap() const;

private:
    uint32_t _startTime = 0;
    uint32_t _uptimeSeconds = 0;
    uint32_t _freeHeap = 0;
    uint32_t _minFreeHeap = 0;
    uint16_t _errors = 0;
    uint16_t _warnings = 0;
    uint8_t _cpuUsage = 0;
    float _cpuTemperature = 0;
    bool _watchdogOk = true;
    bool _sdCardOk = false;
    bool _sensorsOk = true;
    bool _actuatorsOk = true;
    
    // Error history
    struct ErrorEntry {
        uint32_t timestamp;
        char message[64];
    };
    ErrorEntry _errorHistory[32];
    uint8_t _errorCount = 0;
    uint8_t _errorHead = 0;
};

#endif // HEALTH_MONITOR_H