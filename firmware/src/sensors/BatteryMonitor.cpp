#include "BatteryMonitor.h"
#include "utils/TimeUtils.h"

BatteryMonitor::BatteryMonitor(uint8_t pin) : _pin(pin) {}

void BatteryMonitor::begin() {
    pinMode(_pin, INPUT);
    _available = true;
    _healthy = true;
    _lastReadTime = 0;
    _filteredValue = 0;
}

float BatteryMonitor::read() {
    float voltage = readVoltage();
    if (voltage < 0) {
        _healthy = false;
        return NAN;
    }
    
    // Low-pass filter
    _filteredValue = _alpha * voltage + (1 - _alpha) * _filteredValue;
    _lastReadTime = TimeUtils::getMillis();
    _healthy = true;
    
    return _filteredValue;
}

float BatteryMonitor::readVoltage() {
    int raw = analogRead(_pin);
    if (raw < 0) return -1;
    
    // Convert ADC to voltage
    // V_adc = (raw / 1023) * Vref
    // V_bat = V_adc * dividerRatio + offset
    float vAdc = (raw / 1023.0) * _adcRef;
    float voltage = vAdc * _dividerRatio + _offset;
    
    return voltage;
}

bool BatteryMonitor::calibrate(float knownValue) {
    float current = readVoltage();
    if (current < 0) return false;
    
    // Adjust divider ratio to match known value
    // knownValue = current * (newRatio / currentRatio)
    // newRatio = currentRatio * knownValue / current
    _dividerRatio = _dividerRatio * knownValue / current;
    return true;
}

float BatteryMonitor::getPercentage() const {
    if (_filteredValue <= _minVoltage) return 0;
    if (_filteredValue >= _fullVoltage) return 100;
    
    float range = _fullVoltage - _minVoltage;
    float percentage = ((_filteredValue - _minVoltage) / range) * 100.0;
    return constrain(percentage, 0, 100);
}

bool BatteryMonitor::isCharging() const {
    return _filteredValue > _maxVoltage;
}