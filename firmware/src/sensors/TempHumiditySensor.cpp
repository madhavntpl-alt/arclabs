#include "TempHumiditySensor.h"
#include "utils/TimeUtils.h"

TempHumiditySensor::TempHumiditySensor(uint8_t pin, uint8_t type) : _dht(pin, type) {}

void TempHumiditySensor::begin() {
    _dht.begin();
    _available = true;
    _healthy = true;
    _lastReadTime = 0;
    _lastRead = 0;
    _lastTemperature = NAN;
    _lastHumidity = NAN;
}

float TempHumiditySensor::read() {
    return readTemperature();
}

float TempHumiditySensor::readTemperature() {
    unsigned long now = TimeUtils::getMillis();
    
    // Respect minimum read interval
    if (now - _lastRead < DHT_READ_INTERVAL_MS) {
        return _lastTemperature;
    }
    
    float temp = _dht.readTemperature();
    if (isnan(temp)) {
        _healthy = false;
        return NAN;
    }
    
    _lastTemperature = temp + _tempOffset;
    _lastReadTime = TimeUtils::getMillis();
    _lastRead = now;
    _healthy = true;
    
    return _lastTemperature;
}

float TempHumiditySensor::readHumidity() {
    unsigned long now = TimeUtils::getMillis();
    
    // Respect minimum read interval
    if (now - _lastRead < DHT_READ_INTERVAL_MS) {
        return _lastHumidity;
    }
    
    float hum = _dht.readHumidity();
    if (isnan(hum)) {
        _healthy = false;
        return NAN;
    }
    
    _lastHumidity = hum + _humidityOffset;
    _lastReadTime = TimeUtils::getMillis();
    _lastRead = now;
    _healthy = true;
    
    return _lastHumidity;
}

bool TempHumiditySensor::calibrate(float knownValue) {
    // Calibrate temperature
    float current = readTemperature();
    if (isnan(current)) return false;
    
    _tempOffset = knownValue - current;
    return true;
}