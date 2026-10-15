/**
 * Battery Voltage Monitor
 * Uses voltage divider to measure battery voltage
 */

#ifndef BATTERY_MONITOR_H
#define BATTERY_MONITOR_H

#include "SensorBase.h"
#include "config/pins.h"
#include "config/constants.h"

class BatteryMonitor : public SensorBase {
public:
    BatteryMonitor(uint8_t pin);
    
    void begin() override;
    float read() override;
    const char* getType() const override { return "battery"; }
    const char* getUnit() const override { return "V"; }
    bool isAvailable() const override { return _available; }
    bool calibrate(float knownValue) override;
    unsigned long getLastReadTime() const override { return _lastReadTime; }
    bool isHealthy() const override { return _healthy; }
    
    // Get battery percentage (0-100%)
    float getPercentage() const;
    
    // Check if charging (voltage > max threshold)
    bool isCharging() const;

private:
    uint8_t _pin;
    bool _available = false;
    bool _healthy = false;
    unsigned long _lastReadTime = 0;
    
    // Calibration
    float _dividerRatio = BATTERY_DIVIDER_RATIO;
    float _adcRef = ADC_REF_VOLTAGE;
    float _offset = 0.0;
    
    // Filtering
    float _filteredValue = 0;
    const float _alpha = 0.1;
    
    // Battery thresholds
    float _minVoltage = BATTERY_MIN_V;
    float _maxVoltage = BATTERY_MAX_V;
    float _fullVoltage = BATTERY_FULL_V;
    
    // Read raw ADC and convert to voltage
    float readVoltage();
};

#endif // BATTERY_MONITOR_H