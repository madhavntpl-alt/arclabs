/**
 * Data Logger
 * SD card logging (optional)
 */

#ifndef DATA_LOGGER_H
#define DATA_LOGGER_H

#include <Arduino.h>
#include "config/constants.h"

class DataLogger {
public:
    DataLogger();
    
    void begin();
    void log();
    
    // Log sensor reading
    void logSensorReading(const char* sensor, float value, const char* unit, unsigned long timestamp);
    
    // Log event
    void logEvent(const char* eventType, const char* severity, const char* message, unsigned long timestamp);
    
    // Log command
    void logCommand(const char* command, bool success, const char* message);
    
    // Check if logging is enabled
    bool isEnabled() const { return _enabled; }
    
    // Enable/disable logging
    void setEnabled(bool enabled) { _enabled = enabled; }
    
    // Get log statistics
    struct Stats {
        uint32_t totalEntries = 0;
        uint32_t sensorEntries = 0;
        uint32_t eventEntries = 0;
        uint32_t commandEntries = 0;
        uint32_t bytesWritten = 0;
        uint32_t errors = 0;
    };
    
    Stats getStats() const;

private:
    bool _enabled = false;
    bool _sdCardPresent = false;
    
    // Statistics
    uint32_t _totalEntries = 0;
    uint32_t _sensorEntries = 0;
    uint32_t _eventEntries = 0;
    uint32_t _commandEntries = 0;
    uint32_t _bytesWritten = 0;
    uint32_t _errors = 0;
    
    // File handling
    // File _logFile;
    // File _eventFile;
    // File _commandFile;
    
    // Buffer for batch writing
    char _logBuffer[512];
    size_t _bufferPos = 0;
    
    // Initialize SD card
    bool initSDCard();
    
    // Write buffer to file
    void flushBuffer();
    
    // Format log entry
    void formatSensorEntry(char* buffer, size_t size, const char* sensor, float value, const char* unit, unsigned long timestamp);
    void formatEventEntry(char* buffer, size_t size, const char* eventType, const char* severity, const char* message, unsigned long timestamp);
    void formatCommandEntry(char* buffer, size_t size, const char* command, bool success, const char* message, unsigned long timestamp);
};

#endif // DATA_LOGGER_H