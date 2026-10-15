#include "StateMachine.h"
#include "utils/TimeUtils.h"

StateMachine::StateMachine() : _currentState(STATE_INIT), _previousState(STATE_INIT) {}

void StateMachine::begin() {
    _currentState = STATE_INIT;
    _previousState = STATE_INIT;
    _targetState = STATE_INIT;
    _transitionPending = false;
    _stateEnterTime = TimeUtils::getMillis();
    _stateDuration = 0;
}

void StateMachine::update() {
    // Check for pending transition
    if (_transitionPending) {
        executeTransition();
    }
    
    // Run current state logic
    runCurrentState();
    
    // Update state duration
    _stateDuration = TimeUtils::getMillis() - _stateEnterTime;
}

bool StateMachine::transitionTo(SystemState newState) {
    if (newState == _currentState) return true;
    if (newState >= 8) return false;  // Invalid state
    
    _targetState = newState;
    _transitionPending = true;
    return true;
}

void StateMachine::executeTransition() {
    // Call exit callback for current state
    if (_onExit) {
        _onExit(_currentState);
    }
    
    _previousState = _currentState;
    _currentState = _targetState;
    _transitionPending = false;
    _stateEnterTime = TimeUtils::getMillis();
    _stateDuration = 0;
    
    // Call enter callback for new state
    if (_onEnter) {
        _onEnter(_currentState);
    }
}

void StateMachine::runCurrentState() {
    switch (_currentState) {
        case STATE_INIT:
            handleInit();
            break;
        case STATE_IDLE:
            handleIdle();
            break;
        case STATE_MONITORING:
            handleMonitoring();
            break;
        case STATE_CONTROL:
            handleControl();
            break;
        case STATE_CALIBRATION:
            handleCalibration();
            break;
        case STATE_ERROR:
            handleError();
            break;
        case STATE_EMERGENCY:
            handleEmergency();
            break;
        case STATE_MAINTENANCE:
            handleMaintenance();
            break;
    }
}

void StateMachine::handleInit() {
    // Initialization complete, transition to monitoring
    transitionTo(STATE_MONITORING);
}

void StateMachine::handleIdle() {
    // Low power idle state
}

void StateMachine::handleMonitoring() {
    // Normal monitoring operation
}

void StateMachine::handleControl() {
    // Active control operation
}

void StateMachine::handleCalibration() {
    // Calibration mode
}

void StateMachine::handleError() {
    // Error state - attempt recovery
}

void StateMachine::handleEmergency() {
    // Emergency state - all actuators off
}

void StateMachine::handleMaintenance() {
    // Maintenance mode
}

const char* StateMachine::getStateName() const {
    switch (_currentState) {
        case STATE_INIT: return "INIT";
        case STATE_IDLE: return "IDLE";
        case STATE_MONITORING: return "MONITORING";
        case STATE_CONTROL: return "CONTROL";
        case STATE_CALIBRATION: return "CALIBRATION";
        case STATE_ERROR: return "ERROR";
        case STATE_EMERGENCY: return "EMERGENCY";
        case STATE_MAINTENANCE: return "MAINTENANCE";
        default: return "UNKNOWN";
    }
}