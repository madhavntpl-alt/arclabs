#include "Pump.h"
#include "utils/TimeUtils.h"

Pump::Pump(Relay& relay) : _relay(relay) {}

void Pump::begin() {
    _relay.begin();
    stop();
}

void Pump::start(unsigned long durationMs) {
    if (!canStart()) return;
    
    _relay.setState(true);
    _running = true;
    _startTime = TimeUtils::getMillis();
    _duration = durationMs;
    _lastStartTime = _startTime;
    _totalRuntime += durationMs > 0 ? durationMs : 0;
}

void Pump::stop() {
    if (_running) {
        unsigned long elapsed = TimeUtils::getMillis() - _startTime;
        _totalRuntime += elapsed;
    }
    _relay.setState(false);
    _running = false;
    _duration = 0;
}

unsigned long Pump::getRemainingTime() const {
    if (!_running || _duration == 0) return 0;
    
    unsigned long elapsed = TimeUtils::getMillis() - _startTime;
    if (elapsed >= _duration) return 0;
    return _duration - elapsed;
}

void Pump::emergencyStop() {
    stop();
}

void Pump::update() {
    if (_running && _duration > 0) {
        if (getRemainingTime() == 0) {
            stop();
        }
    }
}

bool Pump::canStart() const {
    unsigned long now = TimeUtils::getMillis();
    
    // Check cooldown
    if (now < _cooldownEnd) return false;
    
    // Check if already running
    if (_running) return false;
    
    // Check minimum time since last start
    if (now - _lastStartTime < PUMP_COOLDOWN_MS) return false;
    
    return true;
}