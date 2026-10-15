#include "DataLogger.h"
#include "utils/TimeUtils.h"

DataLogger::DataLogger() : _enabled(false), _sdCardPresent(false) {}

void DataLogger::begin() {
    _enabled = initSDCard();
    if (_enabled) {
        // Write header if new file
    }
}

void DataLogger::log() {
    if (!_enabled || !_sdCardPresent) return;
    
    // Flush buffer periodically
    if (_bufferPos > 256) {
        flushBuffer();
    }
}

void DataLogger::logSensorReading(const char* sensor, float value, const char* unit, unsigned long timestamp) {
    if (!_enabled || !_sdCardPresent) return;
    
    formatSensorEntry(_logBuffer + _bufferPos, 512 - _bufferPos, sensor, value, unit, TimeUtils::getUnixTime());
    size_t len = strlen(_logBuffer + _bufferPos);
    _bufferPos += len;
    _sensorEntries++;
    _totalEntries++;
}

void DataLogger::logEvent(const char* eventType, const char* severity, const char* message, unsigned long timestamp) {
    if (!_enabled || !_sdCardPresent) return;
    
    formatEventEntry(_logBuffer + _bufferPos, 512 - _bufferPos, eventType, severity, message, TimeUtils::getUnixTime());
    size_t len = strlen(_logBuffer + _bufferPos);
    _bufferPos += len;
    _eventEntries++;
    _totalEntries++;
}

void DataLogger::logCommand(const char* command, bool success, const char* message) {
    if (!_enabled || !_sdCardPresent) return;
    
    formatCommandEntry(_logBuffer + _bufferPos, 512 - _bufferPos, command, success, message, TimeUtils::getUnixTime());
    size_t len = strlen(_logBuffer + _bufferPos);
    _bufferPos += len;
    _commandEntries++;
    _totalEntries++;
}

DataLogger::Stats DataLogger::getStats() const {
    Stats stats;
    stats.totalEntries = _totalEntries;
    stats.sensorEntries = _sensorEntries;
    stats.eventEntries = _eventEntries;
    stats.commandEntries = _commandEntries;
    stats.bytesWritten = _bytesWritten;
    stats.errors = 0;
    return stats;
}

bool DataLogger::initSDCard() {
    // SD card initialization would go here
    // For now, return false (logging disabled)
    return false;
}

void DataLogger::flushBuffer() {
    if (_bufferPos > 0) {
        // Write to file
        _bufferPos = 0;
    }
}

void DataLogger::formatSensorEntry(char* buffer, size_t size, const char* sensor, float value, const char* unit, unsigned long timestamp) {
    snprintf(buffer, size, "%lu,SENSOR,%s,%.2f,%s\n", timestamp, sensor, value, unit);
}

void DataLogger::formatEventEntry(char* buffer, size_t size, const char* eventType, const char* severity, const char* message, unsigned long timestamp) {
    snprintf(buffer, size, "%lu,EVENT,%s,%s,%s\n", timestamp, eventType, severity, message);
}

void DataLogger::formatCommandEntry(char* buffer, size_t size, const char* command, bool success, const char* message, unsigned long timestamp) {
    snprintf(buffer, size, "%lu,COMMAND,%s,%s,%s\n", timestamp, command, success ? "SUCCESS" : "FAILED", message ? message : "");
}