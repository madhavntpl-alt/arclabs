/**
 * Automation Engine
 * Rule evaluation on device
 */

#ifndef AUTOMATION_ENGINE_H
#define AUTOMATION_ENGINE_H

#include <Arduino.h>
#include "config/constants.h"
#include "sensors/SensorBase.h"
#include "actuators/ActuatorBase.h"

#define MAX_RULES 16
#define MAX_CONDITIONS 8
#define MAX_ACTIONS 8

enum ConditionType {
    COND_SENSOR = 0,
    COND_TIME = 1,
    COND_STATE = 2,
};

enum Operator {
    OP_LT = 0,    // <
    OP_LTE = 1,   // <=
    OP_GT = 2,    // >
    OP_GTE = 3,   // >=
    OP_EQ = 4,    // ==
    OP_NEQ = 5,   // !=
    OP_BETWEEN = 6,
    OP_OUTSIDE = 7,
};

enum ActionType {
    ACT_PUMP_ON = 0,
    ACT_PUMP_OFF = 1,
    ACT_RELAY_SET = 2,
    ACT_NOTIFY = 3,
};

struct Condition {
    uint8_t type;           // ConditionType
    uint8_t sensorType;     // For sensor conditions
    uint8_t operator;       // Operator
    float value;
    float valueMax;         // For BETWEEN/OUTSIDE
    uint32_t durationMs;    // Must hold for this long
    uint8_t timeStartHour;  // For time conditions
    uint8_t timeStartMin;
    uint8_t timeEndHour;
    uint8_t timeEndMin;
    uint8_t daysOfWeek;     // Bitmask
    uint8_t actuatorType;   // For state conditions
    bool targetState;       // For state conditions
};

struct Action {
    uint8_t type;           // ActionType
    uint8_t actuatorType;   // For actuator actions
    bool state;             // For relay_set
    uint32_t durationMs;    // For pump_on
    char message[64];       // For notify
    uint8_t severity;       // For notify
};

struct Rule {
    char name[32];
    bool enabled = true;
    uint8_t priority = 10;
    uint8_t conditionCount = 0;
    Condition conditions[MAX_CONDITIONS];
    uint8_t actionCount = 0;
    Action actions[MAX_ACTIONS];
    uint8_t logic;  // 0 = AND, 1 = OR
    uint32_t cooldownMs = 60000;
    uint32_t lastTriggered = 0;
    uint16_t executionCount = 0;
    bool cooldownActive = false;
};

class AutomationEngine {
public:
    AutomationEngine();
    
    void begin();
    void evaluate();
    
    // Rule management
    bool addRule(const Rule& rule);
    bool removeRule(uint8_t index);
    bool enableRule(uint8_t index, bool enabled);
    Rule* getRule(uint8_t index) { return &_rules[index]; }
    uint8_t getRuleCount() const { return _ruleCount; }
    
    // Evaluate specific rule
    bool evaluateRule(uint8_t index);
    
    // Set sensor values for evaluation
    void setSensorValue(uint8_t sensorType, float value);
    
    // Set actuator states
    void setActuatorState(uint8_t actuatorType, bool state);

private:
    Rule _rules[MAX_RULES];
    uint8_t _ruleCount = 0;
    
    // Current values for evaluation
    float _sensorValues[8];  // Max 8 sensor types
    bool _actuatorStates[8]; // Max 8 actuator types
    bool _sensorValid[8];
    
    // Condition state tracking (for duration)
    struct {
        bool active = false;
        uint32_t startTime = 0;
    } _conditionStates[MAX_RULES][MAX_CONDITIONS];
    
    // Evaluate single condition
    bool evaluateCondition(const Condition& cond, uint8_t ruleIdx, uint8_t condIdx);
    
    // Execute actions
    void executeActions(const Rule& rule);
    
    // Check cooldown
    bool checkCooldown(const Rule& rule);
    
    // Execute single action
    void executeAction(const Action& action);
};

#endif // AUTOMATION_ENGINE_H