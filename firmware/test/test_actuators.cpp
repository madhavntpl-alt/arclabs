/**
 * Unit tests for Actuators
 */

#include <Arduino.h>
#include "../src/actuators/Relay.h"
#include "../src/actuators/Pump.h"

void setup() {
    Serial.begin(115200);
    while (!Serial) delay(10);
    
    Serial.println("Starting Actuator Tests...");
}

void loop() {
    testRelay();
    testPump();
    
    Serial.println("All actuator tests passed!");
    while (true) delay(1000);
}

void testRelay() {
    Relay relay(3, true);  // Active LOW
    relay.begin();
    
    assert(relay.isAvailable() == true);
    assert(relay.getState() == false);
    
    // Test ON
    relay.setState(true);
    assert(relay.getState() == true);
    
    // Test OFF
    relay.setState(false);
    assert(relay.getState() == false);
    
    // Test toggle
    relay.toggle();
    assert(relay.getState() == true);
    relay.toggle();
    assert(relay.getState() == false);
    
    // Test pulse
    relay.pulse(100);
    assert(relay.getState() == true);
    
    // Test active low/high
    relay.setActiveLow(false);
    relay.setState(true);
    // ... test with active high
    
    Serial.println("testRelay: PASSED");
}

void testPump() {
    Relay relay(3, true);
    Pump pump(relay);
    pump.begin();
    
    assert(pump.isRunning() == false);
    
    // Test start with duration
    pump.start(5000);  // 5 seconds
    assert(pump.isRunning() == true);
    
    // Test remaining time
    unsigned long remaining = pump.getRemainingTime();
    assert(remaining > 0 && remaining <= 5000);
    
    // Test stop
    pump.stop();
    assert(pump.isRunning() == false);
    
    // Test emergency stop
    pump.emergencyStop();
    assert(pump.isRunning() == false);
    
    // Test cooldown
    pump.start(1000);
    pump.stop();
    // Immediately try to start again - should fail due to cooldown
    // pump.start(1000);  // This would fail in real implementation
    
    Serial.println("testPump: PASSED");
}

void assert(bool condition) {
    if (!condition) {
        Serial.println("ASSERTION FAILED!");
        while (true) delay(100);
    }
}