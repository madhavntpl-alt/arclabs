/**
 * State Machine
 * System state management
 */

#ifndef STATE_MACHINE_H
#define STATE_MACHINE_H

#include <Arduino.h>

enum SystemState {
    STATE_INIT = 0,
    STATE_IDLE = 1,
    STATE_MONITORING = 2,
    STATE_CONTROL = 3,
    STATE_CALIBRATION = 4,
    STATE_ERROR = 5,
    STATE_EMERGENCY = 6,
    STATE_MAINTENANCE = 7,
};

class StateMachine {
public:
    StateMachine();
    
    void begin();
    void update();
    
    // State transitions
    bool transitionTo(SystemState newState);
    SystemState getCurrentState() const { return _currentState; }
    SystemState getPreviousState() const { return _previousState; }
    
    // State-specific actions
    void handleInit();
    void handleIdle();
    void handleMonitoring();
    void handleControl();
    void handleCalibration();
    void handleError();
    void handleEmergency();
    void handleMaintenance();
    
    // Check if in specific state
    bool isInState(SystemState state) const { return _currentState == state; }
    bool isOperational() const { 
        return _currentState == STATE_MONITORING || _currentState == STATE_CONTROL; 
    }
    
    // Get state name
    const char* getStateName() const;
    
    // State entry/exit callbacks
    typedef void (*StateCallback)(SystemState);
    void setOnEnterCallback(StateCallback cb) { _onEnter = cb; }
    void setOnExitCallback(StateCallback cb) { _onExit = cb; }

private:
    SystemState _currentState = STATE_INIT;
    SystemState _previousState = STATE_INIT;
    SystemState _targetState = STATE_INIT;
    bool _transitionPending = false;
    
    // State timing
    uint32_t _stateEnterTime = 0;
    uint32_t _stateDuration = 0;
    
    // Callbacks
    void (*_onEnter)(SystemState) = nullptr;
    void (*_onExit)(SystemState) = nullptr;
    
    // Execute state transition
    void executeTransition();
    
    // State-specific logic
    void runCurrentState();
};

#endif // STATE_MACHINE_H