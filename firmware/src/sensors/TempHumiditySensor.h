/**
 * Temperature/Humidity Sensor (DHT11/DHT22)
 */

#ifndef TEMP_HUMIDITY_SENSOR_H
#define TEMP_HUMIDITY_SENSOR_H

#include "SensorBase.h"
#include "config/pins.h"
#include "config/constants.h"
#include <DHT.h>

class TempHumiditySensor : public SensorBase {
public:
    TempHumiditySensor(uint8_t pin, uint8_t type = DHT_TYPE);
    
    void begin() override;
    float read() override;  // Returns temperature
    float readTemperature();
    float readHumidity();
    const char* getType() const override { return "temp_humidity"; }
    const char* getUnit() const override { return "°C"; }
    bool isAvailable() const override { return _available; }
    bool calibrate(float knownValue) override;
    unsigned long getLastReadTime() const override { return _lastReadTime; }
    bool isHealthy() const override { return _healthy; }
    
    // Get last readings
    float getLastTemperature() const { return _lastTemperature; }
    float getLastHumidity() const { return _lastHumidity; }

private:
    DHT _dht;
    bool _available = false;
    bool _healthy = false;
    unsigned long _lastReadTime = 0;
    float _lastTemperature = NAN;
    float _lastHumidity = NAN;
    float _tempOffset = 0.0;
    float _humidityOffset = 0.0;
    unsigned long _lastRead = 0;
};

#endif // TEMP_HUMIDITY_SENSOR_H