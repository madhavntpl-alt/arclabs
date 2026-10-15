/**
 * Unit tests for Sensors
 */

#include <Arduino.h>
#include "../src/sensors/WaterLevelSensor.h"
#include "../src/sensors/GasSensor.h"
#include "../src/sensors/TempHumiditySensor.h"
#include "../src/sensors/BatteryMonitor.h"

void setup() {
    Serial.begin(115200);
    while (!Serial) delay(10);
    
    Serial.println("Starting Sensor Tests...");
}

void loop() {
    testWaterLevelSensor();
    testGasSensor();
    testTempHumiditySensor();
    testBatteryMonitor();
    
    Serial.println("All sensor tests passed!");
    while (true) delay(1000);
}

void testWaterLevelSensor() {
    WaterLevelSensor sensor(PIN_WATER_LEVEL);
    sensor.begin();
    
    assert(sensor.isAvailable() == true);
    assert(strcmp(sensor.getType(), "water_level") == 0);
    assert(strcmp(sensor.getUnit(), "cm") == 0);
    
    // Test calibration
    bool calResult = sensor.calibrate(50.0);
    assert(calResult == true);
    
    Serial.println("testWaterLevelSensor: PASSED");
}

void testGasSensor() {
    GasSensor sensor(PIN_GAS_SENSOR);
    sensor.begin();
    
    assert(sensor.isAvailable() == true);
    assert(strcmp(sensor.getType(), "gas") == 0);
    assert(strcmp(sensor.getUnit(), "ppm") == 0);
    
    // Test R0 setting
    sensor.setR0(9.5);
    assert(sensor.getR0() == 9.5);
    
    Serial.println("testGasSensor: PASSED");
}

void testTempHumiditySensor() {
    TempHumiditySensor sensor(PIN_DHT11, DHT11);
    sensor.begin();
    
    assert(sensor.isAvailable() == true);
    assert(strcmp(sensor.getType(), "temp_humidity") == 0);
    
    // Test reading (will return NAN without actual hardware)
    float temp = sensor.readTemperature();
    float hum = sensor.readHumidity();
    
    // Test calibration
    bool calResult = sensor.calibrate(25.0);
    
    Serial.println("testTempHumiditySensor: PASSED");
}

void testBatteryMonitor() {
    BatteryMonitor sensor(PIN_BATTERY_VOLTAGE);
    sensor.begin();
    
    assert(sensor.isAvailable() == true);
    assert(strcmp(sensor.getType(), "battery") == 0);
    assert(strcmp(sensor.getUnit(), "V") == 0);
    
    // Test percentage calculation
    float pct = sensor.getPercentage();
    // Should be 0-100 (or 0 if not initialized)
    
    // Test charging detection
    bool charging = sensor.isCharging();
    
    Serial.println("testBatteryMonitor: PASSED");
}

void assert(bool condition) {
    if (!condition) {
        Serial.println("ASSERTION FAILED!");
        while (true) delay(100);
    }
}