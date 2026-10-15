#include "GasSensor.h"
#include "utils/TimeUtils.h"
#include <math.h>

GasSensor::GasSensor(uint8_t pin) : _pin(pin) {}

void GasSensor::begin() {
    pinMode(_pin, INPUT);
    _warmupStart = TimeUtils::getMillis();
    _available = true;
    _healthy = false;  // Not healthy until warmed up
    _lastReadTime = 0;
    _filteredValue = 0;
}

float GasSensor::read() {
    if (!checkWarmup()) {
        _healthy = false;
        return NAN;
    }
    
    float ratio = readRatio();
    if (ratio <= 0) {
        _healthy = false;
        return NAN;
    }
    
    float ppm = ratioToPpm(ratio);
    
    // Low-pass filter
    _filteredValue = 0.2 * ppm + 0.8 * _filteredValue;
    _lastReadTime = TimeUtils::getMillis();
    _healthy = true;
    
    return _filteredValue;
}

bool GasSensor::checkWarmup() {
    if (_warmedUp) return true;
    
    unsigned long elapsed = TimeUtils::getMillis() - _warmupStart;
    if (elapsed >= MQ2_WARMUP_TIME_MS) {
        _warmedUp = true;
        _healthy = true;
        return true;
    }
    
    _healthy = false;
    return false;
}

float GasSensor::readRatio() {
    // Read analog value
    int raw = analogRead(_pin);
    if (raw <= 0) return -1;
    
    // Convert to voltage
    float voltage = (raw / 1023.0) * 5.0;
    
    // Calculate Rs (sensor resistance)
    // Rs = (Vc - Vout) / Vout * Rload
    // Assuming 10kΩ load resistor
    const float VCC = 5.0;
    const float RLOAD = 10.0;  // kΩ
    
    if (voltage >= 5.0) return -1;
    
    float rs = ((VCC - voltage) / voltage) * RLOAD;
    
    // Return Rs/R0 ratio
    if (_r0 <= 0) return -1;
    return rs / _r0;
}

float GasSensor::ratioToPpm(float ratio) {
    if (ratio <= 0) return 0;
    
    // ppm = 10^((log10(ratio) - intercept) / slope)
    float logRatio = log10(ratio);
    float ppm = pow(10, (logRatio - _intercept) / _slope);
    
    return ppm;
}

bool GasSensor::calibrate(float knownValue) {
    // Calibrate in known gas concentration
    // This sets the slope/intercept based on known ppm
    float ratio = readRatio();
    if (ratio <= 0) return false;
    
    // For single-point calibration, adjust intercept
    // log10(knownValue) = slope * log10(ratio) + intercept
    float logRatio = log10(readRatio());
    _intercept = log10(knownValue) - _slope * logRatio;
    _calibrated = true;
    
    return true;
}

void GasSensor::setR0(float r0) {
    _r0 = r0;
}

float GasSensor::getRatio() const {
    return _r0 > 0 ? 1.0 : 0;  // Placeholder
}