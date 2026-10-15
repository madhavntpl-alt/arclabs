/**
 * Actuator Base Class
 * Common interface for all actuators
 */

#ifndef ACTUATOR_BASE_H
#define ACTUATOR_BASE_H

#include <Arduino.h>

class ActuatorBase {
public:
    virtual ~ActuatorBase() = default;
    
    // Initialize actuator
    virtual void begin() = 0;
    
    // Set state (true = ON, false = OFF)
    virtual void setState(bool state) = 0;
    
    // Get current state
    virtual bool getState() const = 0;
    
    // Toggle state
    virtual void toggle() = 0;
    
    // Get actuator type identifier
    virtual const char* getType() const = 0;
    
    // Check if actuator is available
    virtual bool isAvailable() const = 0;
    
    // Emergency stop
    virtual void emergencyStop() = 0;
    
protected:
    bool _state = false;
    bool _available = false;
};

#endif // ACTUATOR_BASE_H