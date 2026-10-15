/**
 * Water Level Sensor
 * Supports Ultrasonic (JSN-SR04T) and Pressure sensors
 */

#ifndef WATER_LEVEL_SENSOR_H
#define WATER_LEVEL_SENSOR_H

#include "SensorBase.h"
#include "config/pins.h"
#include "config/constants.h"

class WaterLevelSensor : public SensorBase {
public:
    WaterLevelSensor(uint8_t pin);
    
    void begin() override;
    float read() override;
    const char* getType() const override { return "water_level"; }
    const char* getUnit() const override { return "cm"; }
    bool isAvailable() const override { return _available; }
    bool calibrate(float knownValue) override;
    unsigned long getLastReadTime() const override { return _lastReadTime; }
    bool isHealthy() const override { return _healthy; }
    
    // Set sensor type (ultrasonic vs pressure)
    void setSensorType(uint8_t type);
    
    // Get raw distance for calibration
    float getRawDistance();

private:
    uint8_t _pin;
    uint8_t _sensorType;  // 0 = ultrasonic, 1 = pressure
    bool _available = false;
    bool _healthy = false;
    unsigned long _lastReadTime = 0;
    
    // Calibration
    float _slope = 58.0;      // cm per volt (ultrasonic) or cm per ADC unit
    float _offset = -2.5;     // cm offset
    
    // Ultrasonic specific
    uint8_t _trigPin = PIN_WATER_LEVEL_TRIG;
    uint8_t _echoPin = PIN_WATER_LEVEL_ECHO;
    
    // Pressure sensor specific
    float _voltageMin = 0.5;   // V at 0cm
    float _voltageMax = 4.5;   // V at max range
    float _rangeMax = 300.0;   // cm
    
    // Filtering
    float _lastValue = 0;
    float _filteredValue = 0;
    const float _alpha = 0.3;  // Low-pass filter coefficient
    
    // Read raw sensor value
    float readRaw();
    
    // Apply calibration
    float applyCalibration(float raw);
    
    // Ultrasonic measurement
    float readUltrasonic();
    
    // Pressure sensor measurement
    float readPressure();
};

#endif // WATER_LEVEL_SENSOR_H