/**
 * Relay Actuator
 * Controls relay modules (active LOW or HIGH)
 */

#ifndef RELAY_H
#define RELAY_H

#include "ActuatorBase.h"
#include "config/constants.h"

class Relay : public ActuatorBase {
public:
    Relay(uint8_t pin, bool activeLow = RELAY_ACTIVE_LOW);
    
    void begin() override;
    void setState(bool state) override;
    bool getState() const override { return _state; }
    void toggle() override { setState(!_state); }
    const char* getType() const override { return "relay"; }
    bool isAvailable() const override { return _available; }
    void emergencyStop() override { setState(false); }
    
    // Set active low/high mode
    void setActiveLow(bool activeLow);
    
    // Pulse relay for specified duration (ms)
    void pulse(unsigned long durationMs);

private:
    uint8_t _pin;
    bool _activeLow;
    bool _state = false;
    bool _available = false;
    unsigned long _pulseEndTime = 0;
    bool _pulsing = false;
};

#endif // RELAY_H