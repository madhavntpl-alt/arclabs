/**
 * Sensor Base Class
 * Common interface for all sensors
 */

#ifndef SENSOR_BASE_H
#define SENSOR_BASE_H

#include <Arduino.h>

class SensorBase {
public:
    virtual ~SensorBase() = default;
    
    // Initialize sensor
    virtual void begin() = 0;
    
    // Read sensor value
    // Returns NAN on error
    virtual float read() = 0;
    
    // Get sensor type identifier
    virtual const char* getType() const = 0;
    
    // Get unit of measurement
    virtual const char* getUnit() const = 0;
    
    // Check if sensor is available/working
    virtual bool isAvailable() const = 0;
    
    // Calibrate sensor with known reference value
    virtual bool calibrate(float knownValue) = 0;
    
    // Get last reading timestamp
    virtual unsigned long getLastReadTime() const = 0;
    
    // Get sensor status
    virtual bool isHealthy() const = 0;
    
protected:
    unsigned long _lastReadTime = 0;
    bool _healthy = false;
};

#endif // SENSOR_BASE_H