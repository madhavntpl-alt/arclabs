#include "Relay.h"
#include "utils/TimeUtils.h"

Relay::Relay(uint8_t pin, bool activeLow) : _pin(pin), _activeLow(activeLow) {}

void Relay::begin() {
    pinMode(_pin, OUTPUT);
    // Set initial state (OFF)
    if (_activeLow) {
        digitalWrite(_pin, HIGH);
    } else {
        digitalWrite(_pin, LOW);
    }
    _state = false;
    _available = true;
}

void Relay::setState(bool state) {
    _state = state;
    if (_activeLow) {
        digitalWrite(_pin, state ? LOW : HIGH);
    } else {
        digitalWrite(_pin, state ? HIGH : LOW);
    }
}

void Relay::toggle() {
    setState(!_state);
}

void Relay::setActiveLow(bool activeLow) {
    _activeLow = activeLow;
    // Re-apply current state with new active mode
    setState(_state);
}

void Relay::pulse(unsigned long durationMs) {
    if (!_state) {
        setState(true);
        _pulseEndTime = TimeUtils::getMillis() + durationMs;
        _pulsing = true;
    }
}

// Call this in loop() to handle pulse timing
void Relay::update() {
    if (_pulsing && TimeUtils::getMillis() >= _pulseEndTime) {
        setState(false);
        _pulsing = false;
    }
}