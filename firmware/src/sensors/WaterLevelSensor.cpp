#include "WaterLevelSensor.h"
#include "utils/TimeUtils.h"

WaterLevelSensor::WaterLevelSensor(uint8_t pin) : _pin(pin), _sensorType(0) {}

void WaterLevelSensor::begin() {
    if (_sensorType == 0) {
        // Ultrasonic
        pinMode(_trigPin, OUTPUT);
        pinMode(_echoPin, INPUT);
        digitalWrite(_trigPin, LOW);
    } else {
        // Pressure sensor - analog input
        pinMode(_pin, INPUT);
    }
    
    _available = true;
    _healthy = true;
    _lastReadTime = 0;
    _filteredValue = 0;
    _lastValue = 0;
}

float WaterLevelSensor::read() {
    float raw = readRaw();
    if (raw < 0) {
        _healthy = false;
        return NAN;
    }
    
    float calibrated = applyCalibration(raw);
    
    // Low-pass filter
    _filteredValue = _alpha * calibrated + (1 - _alpha) * _filteredValue;
    _lastValue = _filteredValue;
    _lastReadTime = TimeUtils::getMillis();
    _healthy = true;
    
    return _filteredValue;
}

float WaterLevelSensor::readRaw() {
    if (_sensorType == 0) {
        return readUltrasonic();
    } else {
        return readPressure();
    }
}

float WaterLevelSensor::readUltrasonic() {
    // Trigger pulse
    digitalWrite(_trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(_trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(_trigPin, LOW);
    
    // Read echo pulse
    unsigned long duration = pulseIn(_echoPin, HIGH, ULTRASONIC_TIMEOUT_US);
    
    if (duration == 0) {
        return -1;  // Timeout
    }
    
    // Calculate distance: distance = (duration * speed_of_sound) / 2
    // duration is in microseconds, speed of sound is 343 m/s = 0.0343 cm/µs
    float distance = (duration * 0.0343) / 2.0;
    
    return distance;
}

float WaterLevelSensor::readPressure() {
    // Read analog value (0-1023)
    int raw = analogRead(_pin);
    if (raw < 0) return -1;
    
    // Convert to voltage
    float voltage = (raw / 1023.0) * 5.0;
    
    // Convert voltage to distance based on sensor calibration
    // Assuming 0.5V = 0cm, 4.5V = max range
    float voltageRange = _voltageMax - _voltageMin;
    if (voltageRange <= 0) return -1;
    
    float normalized = (voltage - _voltageMin) / voltageRange;
    normalized = constrain(normalized, 0.0, 1.0);
    
    return normalized * _rangeMax;
}

float WaterLevelSensor::applyCalibration(float raw) {
    if (_sensorType == 0) {
        // Ultrasonic: apply slope and offset
        return raw * _slope + _offset;
    } else {
        // Pressure: already in cm, apply slope/offset
        return raw * _slope + _offset;
    }
}

bool WaterLevelSensor::calibrate(float knownValue) {
    float raw = readRaw();
    if (raw < 0) return false;
    
    // Calculate new slope/offset based on known value
    // For single-point calibration, adjust offset
    float calibrated = applyCalibration(raw);
    _offset = knownValue - (raw * _slope);
    
    return true;
}

void WaterLevelSensor::setSensorType(uint8_t type) {
    _sensorType = type;
}

float WaterLevelSensor::getRawDistance() {
    return readRaw();
}