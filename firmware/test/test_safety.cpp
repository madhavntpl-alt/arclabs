/**
 * Unit tests for Safety
 */

#include <Arduino.h>
#include "../src/control/SafetyInterlocks.h"
#include "../src/control/AutomationEngine.h"

void setup() {
    Serial.begin(115200);
    while (!Serial) delay(10);
    
    Serial.println("Starting Safety Tests...");
}

void loop() {
    testSafetyInterlocks();
    testAutomationEngine();
    
    Serial.println("All safety tests passed!");
    while (true) delay(1000);
}

void testSafetyInterlocks() {
    SafetyInterlocks safety;
    safety.begin();
    
    // Test initial state
    assert(safety.isEmergencyStopActive() == false);
    assert(safety.canActivatePump() == true);
    assert(safety.canActivateValve() == true);
    
    // Test emergency stop
    safety.emergencyStop();
    assert(safety.isEmergencyStopActive() == true);
    assert(safety.canActivatePump() == false);
    assert(safety.canActivateValve() == false);
    
    // Test reset
    safety.resetEmergencyStop();
    assert(safety.isEmergencyStopActive() == false);
    assert(safety.canActivatePump() == true);
    
    // Test sensor updates
    safety.updateSensorReading(0, 3.0);  // Water level below minimum
    assert(safety.canActivatePump() == false);
    
    safety.updateSensorReading(0, 10.0);  // Water level normal
    assert(safety.canActivatePump() == true);
    
    safety.updateSensorReading(1, 65.0);  // Temperature too high
    assert(safety.canActivatePump() == false);
    
    Serial.println("testSafetyInterlocks: PASSED");
}

void testAutomationEngine() {
    AutomationEngine engine;
    engine.begin();
    
    // Create a test rule
    AutomationEngine::Rule rule;
    strcpy(rule.name, "Test Rule");
    rule.enabled = true;
    rule.priority = 10;
    rule.logic = 0;  // AND
    rule.cooldownMs = 60000;
    rule.conditionCount = 1;
    rule.conditions[0] = {
        .type = 0,  // SENSOR
        .sensorType = 0,  // water_level
        .operator = 0,  // LT
        .value = 20.0,
        .durationMs = 0
    };
    rule.actionCount = 1;
    rule.actions[0] = {
        .type = 0,  // PUMP_ON
        .durationMs = 60000
    };
    
    bool added = engine.addRule(rule);
    assert(added == true);
    assert(engine.getRuleCount() == 1);
    
    // Test rule evaluation
    engine.setSensorValue(0, 15.0);  // Water level 15 cm (below 20)
    bool triggered = engine.evaluateRule(0);
    assert(triggered == true);
    
    // Test cooldown
    bool triggeredAgain = engine.evaluateRule(0);
    assert(triggeredAgain == false);  // Should be in cooldown
    
    // Test disable rule
    engine.enableRule(0, false);
    engine.setSensorValue(0, 15.0);
    triggered = engine.evaluateRule(0);
    assert(triggered == false);
    
    // Test enable rule again
    engine.enableRule(0, true);
    triggered = engine.evaluateRule(0);
    assert(triggered == false);  // Still in cooldown
    
    Serial.println("testAutomationEngine: PASSED");
}

void assert(bool condition) {
    if (!condition) {
        Serial.println("ASSERTION FAILED!");
        while (true) delay(100);
    }
}