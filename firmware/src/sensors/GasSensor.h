/**
 * Gas Sensor (MQ-2)
 * Measures LPG, propane, methane, alcohol, hydrogen, smoke
 */

#ifndef GAS_SENSOR_H
#define GAS_SENSOR_H

#include "SensorBase.h"
#include "config/pins.h"
#include "config/constants.h"

class GasSensor : public SensorBase {
public:
    GasSensor(uint8_t pin);
    
    void begin() override;
    float read() override;
    const char* getType() const override { return "gas"; }
    const char* getUnit() const override { return "ppm"; }
    bool isAvailable() const override { return _available; }
    bool calibrate(float knownValue) override;
    unsigned long getLastReadTime() const override { return _lastReadTime; }
    bool isHealthy() const override { return _healthy; }
    
    // Set baseline R0 (resistance in clean air)
    void setR0(float r0);
    float getR0() const { return _r0; }
    
    // Get raw Rs/R0 ratio
    float getRatio() const;

private:
    uint8_t _pin;
    bool _available = false;
    bool _healthy = false;
    unsigned long _lastReadTime = 0;
    
    // Calibration parameters
    float _r0 = 10.0;         // Resistance in clean air (kΩ)
    float _slope = -0.45;     // Log-log slope for LPG
    float _intercept = 1.2;   // Log-log intercept
    
    // Calibration
    bool _calibrated = false;
    unsigned long _warmupStart = 0;
    bool _warmedUp = false;
    
    // Filtering
    float _filteredValue = 0;
    const float _alpha = 0.2;
    
    // Read raw resistance ratio
    float readRatio();
    
    // Convert ratio to ppm
    float ratioToPpm(float ratio);
    
    // Check warmup status
    bool checkWarmup();
};

#endif // GAS_SENSOR_H