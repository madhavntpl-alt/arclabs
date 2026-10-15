#include "AutomationEngine.h"
#include "config/constants.h"
#include "utils/TimeUtils.h"

AutomationEngine::AutomationEngine() : _ruleCount(0) {
    for (int i = 0; i < 8; i++) {
        _sensorValues[i] = NAN;
        _actuatorStates[i] = false;
        _sensorValid[i] = false;
    }
}

void AutomationEngine::begin() {
    _ruleCount = 0;
    for (int i = 0; i < MAX_RULES; i++) {
        for (int j = 0; j < MAX_CONDITIONS; j++) {
            _conditionStates[i][j].active = false;
            _conditionStates[i][j].startTime = 0;
        }
    }
}

void AutomationEngine::evaluate() {
    for (uint8_t i = 0; i < _ruleCount; i++) {
        evaluateRule(i);
    }
}

bool AutomationEngine::addRule(const Rule& rule) {
    if (_ruleCount >= MAX_RULES) return false;
    _rules[_ruleCount] = rule;
    _ruleCount++;
    return true;
}

bool AutomationEngine::removeRule(uint8_t index) {
    if (index >= _ruleCount) return false;
    
    for (uint8_t i = index; i < _ruleCount - 1; i++) {
        _rules[i] = _rules[i + 1];
    }
    _ruleCount--;
    return true;
}

bool AutomationEngine::enableRule(uint8_t index, bool enabled) {
    if (index >= _ruleCount) return false;
    _rules[index].enabled = enabled;
    return true;
}

bool AutomationEngine::evaluateRule(uint8_t index) {
    if (index >= _ruleCount) return false;
    
    Rule& rule = _rules[index];
    if (!rule.enabled) return false;
    
    // Check cooldown
    if (rule.cooldownActive) {
        if (TimeUtils::getMillis() - rule.lastTriggered >= rule.cooldownMs) {
            rule.cooldownActive = false;
        } else {
            return false;
        }
    }
    
    // Evaluate all conditions
    bool allMet = true;
    for (uint8_t i = 0; i < rule.conditionCount; i++) {
        bool condResult = evaluateCondition(rule.conditions[i], index, i);
        
        if (rule.logic == 0) {  // AND
            if (!condResult) {
                allMet = false;
                break;
            }
        } else {  // OR
            if (condResult) {
                allMet = true;
                break;
            }
        }
    }
    
    // For AND logic, all must be true; for OR, at least one
    if (rule.logic == 0 && !allMet) return false;
    if (rule.logic == 1 && !allMet) return false;
    
    // All conditions met (for AND) or at least one (for OR)
    executeActions(_rules[index]);
    rule.lastTriggered = TimeUtils::getMillis();
    rule.executionCount++;
    rule.cooldownActive = true;
    
    return true;
}

bool AutomationEngine::evaluateCondition(const Condition& cond, uint8_t ruleIdx, uint8_t condIdx) {
    switch (cond.type) {
        case COND_SENSOR: {
            if (cond.sensorType >= 8 || !_sensorValid[cond.sensorType]) {
                return false;
            }
            
            float value = _sensorValues[cond.sensorType];
            bool result = false;
            
            switch (cond.operator) {
                case OP_LT: result = value < cond.value; break;
                case OP_LTE: result = value <= cond.value; break;
                case OP_GT: result = value > cond.value; break;
                case OP_GTE: result = value >= cond.value; break;
                case OP_EQ: result = value == cond.value; break;
                case OP_NEQ: result = value != cond.value; break;
                case OP_BETWEEN: result = value >= cond.value && value <= cond.valueMax; break;
                case OP_OUTSIDE: result = value < cond.value || value > cond.valueMax; break;
            }
            
            // Check duration
            if (cond.durationMs > 0) {
                auto& state = _conditionStates[ruleIdx][condIdx];
                if (result) {
                    if (!state.active) {
                        state.active = true;
                        state.startTime = TimeUtils::getMillis();
                    } else if (TimeUtils::getMillis() - state.startTime >= cond.durationMs) {
                        return true;
                    }
                } else {
                    state.active = false;
                    state.startTime = 0;
                }
                return false;  // Not yet met duration
            }
            
            return result;
        }
        
        case COND_TIME: {
            // Time condition not fully implemented
            return false;
        }
        
        case COND_STATE: {
            if (cond.actuatorType >= 8) return false;
            bool currentState = _actuatorStates[cond.actuatorType];
            return (cond.targetState == currentState);
        }
    }
    return false;
}

void AutomationEngine::executeActions(const Rule& rule) {
    for (uint8_t i = 0; i < rule.actionCount; i++) {
        executeAction(rule.actions[i]);
    }
}

void AutomationEngine::executeAction(const Action& action) {
    switch (action.type) {
        case ACT_PUMP_ON:
            // Would call pump.start()
            break;
        case ACT_PUMP_OFF:
            // Would call pump.stop()
            break;
        case ACT_RELAY_SET:
            // Would call relay.setState(action.state)
            break;
        case ACT_NOTIFY:
            // Would send notification
            break;
    }
}

bool AutomationEngine::checkCooldown(const Rule& rule) {
    if (!rule.cooldownActive) return true;
    return (TimeUtils::getMillis() - rule.lastTriggered) >= rule.cooldownMs;
}

void AutomationEngine::setSensorValue(uint8_t sensorType, float value) {
    if (sensorType < 8) {
        _sensorValues[sensorType] = value;
        _sensorValid[sensorType] = true;
    }
}

void AutomationEngine::setActuatorState(uint8_t actuatorType, bool state) {
    if (actuatorType < 8) {
        _actuatorStates[actuatorType] = state;
    }
}