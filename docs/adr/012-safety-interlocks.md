# ADR 012: Safety Interlocks

## Status
Accepted

## Context
The ARC LABS platform controls physical actuators (pump, valve) based on sensor readings and automation rules. We need hardware and software safety interlocks to prevent damage, injury, or unsafe conditions.

## Decision
We will implement **multi-layer safety interlocks** at firmware, backend, and hardware levels with defense-in-depth approach.

## Safety Requirements

### Functional Safety
- **Pump protection**: No dry-run, max runtime, cooldown
- **Valve protection**: Position confirmation, timeout
- **Sensor validation**: Range checks, rate-of-change limits
- **Emergency stop**: Hardware and software accessible

### Safety Integrity Level
- **Target SIL 1** (IEC 61508) for non-life-safety equipment
- **Risk reduction factor**: 10-100x
- **Probability of dangerous failure**: < 10^-5 per hour

## Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────────┐
│                    SAFETY LAYERS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: HARDWARE (Highest Priority)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • E-stop button (NC, cuts power to relays)              │   │
│  │ • Watchdog timer (hardware reset on firmware hang)      │   │
│  │ • Relay modules with opto-isolation                     │   │
│  │ • Fuses on all power lines                              │   │
│  │ • Brown-out detection                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  Layer 2: FIRMWARE (Real-time, High Priority)                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • SafetyInterlocks class (highest priority task)        │   │
│  │ • Sensor limit checks (hard limits)                     │   │
│  │ • Actuator state validation                             │   │
│  │ • Watchdog kick (every loop)                            │   │
│  │ • E-stop pin monitoring                                 │   │
│  │ • Pump/valve cooldown enforcement                       │   │
│  │ • Max runtime enforcement                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  Layer 3: BACKEND (Application Logic)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • AlertEngine (threshold evaluation)                    │   │
│  │ • AutomationEngine (rule evaluation with cooldown)      │   │
│  │ • SafetyInterlocks service (pre-command validation)     │   │
│  │ • Command validation (params, permissions)              │   │
│  │ • Rate limiting (prevent command flooding)              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  Layer 4: FRONTEND (User Protection)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Confirmation dialogs for destructive actions          │   │
│  │ • Visual safety status indicators                       │   │
│  │ • Confirmation required for emergency stop              │   │
│  │ • Read-only mode for viewers                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Safety Limits (Configurable)

### Hard Limits (Firmware-enforced, Cannot be overridden)
| Parameter | Min | Max | Action on Violation |
|-----------|-----|-----|---------------------|
| Water Level | 5 cm | 300 cm | Emergency stop pump |
| Temperature | -10°C | 60°C | Emergency stop all |
| Battery Voltage | 3.0V | 5.0V | Emergency stop all |
| Pump Runtime | - | 5 min | Auto-stop |
| Pump Cooldown | 10 sec | - | Block start |

### Soft Limits (Backend-enforced, Configurable via API)
| Parameter | Default Min | Default Max | Severity |
|-----------|-------------|-------------|----------|
| Water Level | 10 cm | 200 cm | Warning/Critical |
| Temperature | 0°C | 50°C | Warning/Critical |
| Humidity | 20% | 80% | Warning |
| Gas | - | 1000 ppm | Warning/Critical |
| Battery | 3.3V | 4.2V | Warning/Critical |

## Implementation

### Firmware SafetyInterlocks

```cpp
// control/SafetyInterlocks.h
class SafetyInterlocks {
public:
    void begin();
    void check();
    
    bool canActivatePump() const;
    bool canActivateValve() const;
    void emergencyStop();
    void resetEmergencyStop();
    
    void updateSensorReading(uint8_t sensorType, float value);
    void updateActuatorState(uint8_t actuatorType, bool state);
    
    struct SafetyStatus {
        bool emergencyStop = false;
        bool pumpAllowed = true;
        bool valveAllowed = true;
        bool watchdogOk = true;
        uint8_t violations = 0;
    };
    
    SafetyStatus getStatus() const;

private:
    // Safety thresholds
    float minWaterLevel = SAFETY_MIN_WATER_LEVEL_CM;
    float maxTemperature = SAFETY_MAX_TEMP_C;
    float minBattery = SAFETY_MIN_BATTERY_V;
    
    // Current readings
    float waterLevel = 0;
    float temperature = 0;
    float batteryVoltage = 0;
    
    // Actuator states
    bool pumpRunning = false;
    bool valveOpen = false;
    
    // Emergency stop
    bool emergencyStop = false;
    uint32_t emergencyStopTime = 0;
    
    // Watchdog
    uint32_t lastWatchdogReset = 0;
    bool watchdogEnabled = WATCHDOG_ENABLED;
    
    // Violation tracking
    uint8_t violations = 0;
    uint32_t lastViolationTime = 0;
    
    void checkWatchdog();
    void checkSensorLimits();
    void resetWatchdog();
};
```

### Backend SafetyInterlocks Service

```python
# app/services/safety_interlocks.py
class SafetyInterlocks:
    def __init__(self):
        self.hard_limits = {
            SensorType.WATER_LEVEL: {"min": 5.0, "max": 300.0},
            SensorType.TEMPERATURE: {"min": -10.0, "max": 60.0},
            SensorType.HUMIDITY: {"min": 0.0, "max": 100.0},
            SensorType.GAS: {"min": 0.0, "max": 2000.0},
            SensorType.BATTERY: {"min": 3.0, "max": 5.0},
        }
        self.soft_limits = {}  # Loaded from config
        self.emergency_stop = False
        self.pump_running = False
        self.valve_open = False
        
    async def validate_pump_command(self, action: str, duration: int) -> tuple[bool, str]:
        """Validate pump command against safety rules"""
        if self.emergency_stop:
            return False, "Emergency stop active"
        
        if action == "on":
            # Check hard limits
            if self.water_level < 5.0:
                return False, "Water level below safety minimum (5 cm)"
            if self.temperature > 60.0:
                return False, "Temperature exceeds safety limit (60°C)"
            if self.battery_voltage < 3.0:
                return False, "Battery below safety minimum (3.0V)"
            
            # Check soft limits (warning only, not blocking)
            warnings = []
            if self.water_level < self.soft_limits.get("water_level_min", 10):
                warnings.append("Water level below configured minimum")
            if self.temperature > self.soft_limits.get("temp_max", 50):
                warnings.append("Temperature above configured maximum")
            
            return True, "; ".join(warnings) if warnings else "OK"
        
        return True, "OK"
    
    def update_sensor_reading(self, sensor_type: SensorType, value: float):
        if sensor_type == SensorType.WATER_LEVEL:
            self.water_level = value
        elif sensor_type == SensorType.TEMPERATURE:
            self.temperature = value
        elif sensor_type == SensorType.BATTERY:
            self.battery_voltage = value
    
    def update_actuator_state(self, actuator_type: str, state: bool):
        if actuator_type == "pump":
            self.pump_running = state
        elif actuator_type == "valve":
            self.valve_open = state
    
    async def emergency_stop(self):
        self.emergency_stop = True
        # Would trigger firmware emergency stop via serial
```

### AlertEngine Integration

```python
# app/services/alert_engine.py
async def evaluate_reading(self, reading) -> List[Alert]:
    new_alerts = []
    
    if reading.sensor_type in self.thresholds:
        threshold = self.thresholds[reading.sensor_type]
        result = evaluate_threshold(reading.value, threshold)
        
        if result.exceeded:
            # Check hard limits for emergency severity
            if reading.sensor_type == SensorType.WATER_LEVEL and reading.value < 5.0:
                result.severity = AlertSeverity.EMERGENCY
            elif reading.sensor_type == SensorType.TEMPERATURE and reading.value > 60:
                result.severity = AlertSeverity.EMERGENCY
            
            alert = self._create_alert(reading, result)
            if alert:
                new_alerts.append(alert)
        else:
            self._clear_alert(reading.sensor_type)
    
    return new_alerts
```

## Hardware E-Stop Circuit

```
E-Stop Circuit (Normally Closed)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   24V/12V Supply                                                │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────────┐                                               │
│  │ E-Stop Button │  (Normally Closed, Red, Twist-to-Release)  │
│  │ (NC Contact)  │                                               │
│  └──────┬────────┘                                               │
│         │                                                         │
│         ▼                                                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │           SAFETY RELAY / CONTACTOR                          │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ Coil ──────────────────────────────────► To Relays   │  │  │
│  │  │                                                        │  │  │
│  │  │ NC Contact (Aux) ──► Firmware E-Stop Input (D8)       │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│         │                                                         │
│         ▼                                                         │
│  ┌──────────────┐     ┌──────────────┐                          │
│  │ Pump Relay   │     │ Valve Relay  │                          │
│  │ (Power Cut)  │     │ (Power Cut)  │                          │
│  └──────────────┘     └──────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Behavior:
1. Normal: E-Stop closed → Safety relay energized → Relays powered
2. E-Stop pressed: E-Stop opens → Safety relay de-energized → Power cut to relays
2. Firmware detects E-Stop via auxiliary contact (D8) → Software emergency stop
3. Twist-to-release → Power restored → Firmware requires explicit reset
```

## Automation Safety

### Rule Evaluation Safety
```python
# In AutomationEngine.evaluate_rule()
async def _evaluate_rule(self, rule, context):
    # 1. Check cooldown
    if rule.last_triggered:
        cooldown_end = rule.last_triggered + timedelta(seconds=rule.cooldown_seconds)
        if datetime.now() < cooldown_end:
            return None
    
    # 2. Check max executions per day
    if rule.max_executions_per_day:
        today_executions = count_executions_today(rule.id)
        if today_executions >= rule.max_executions_per_day:
            return None

    # 4. Validate actions against safety interlocks
    for action in rule.actions:
        if not await self._validate_action_safety(action):
            return None
    
    # 5. Execute with safety monitoring
    return await self._execute_actions_safely(rule.actions)
```

### Action Safety Validation
```python
async def _validate_action_safety(self, action: AutomationAction) -> bool:
    if action.type == "pump_on":
        return await safety_interlocks.can_activate_pump(action.params.get("duration", 60))
    elif action.type == "actuator_set":
        return await safety_interlocks.can_activate_actuator(
            action.params["actuator_type"], 
            action.params["state"]
        )
    return True
```

## Emergency Stop Procedures

### Software Emergency Stop
```python
# API endpoint
@router.post("/control/emergency_stop")
async def emergency_stop(
    safety: SafetyInterlocks = Depends(get_safety_interlocks)
):
    await safety.emergency_stop()
    # Send command to firmware
    await serial_manager.send_command({
        "type": "command",
        "command": "emergency_stop",
        "command_id": generate_id()
    })
    return {"success": True, "message": "Emergency stop activated"}
```

### Firmware Emergency Stop Handler
```cpp
void handleEmergencyStop() {
    // Immediate actions
    pump.stop();
    valveRelay.setState(false);
    pumpRelay.setState(false);
    
    // Set emergency flag
    safetyInterlocks.emergencyStop();
    
    // Send acknowledgment
    serialProtocol.sendCommandAck("emergency_stop", true, "Emergency stop executed");
    
    // Log event
    sendEvent("emergency_stop", "emergency", "Emergency stop activated via software");
}
```

### Recovery Procedure
```python
# API endpoint
@router.post("/control/emergency_stop/reset")
async def reset_emergency_stop(
    current_user: User = Depends(require_roles("operator", "admin")),
    safety: SafetyInterlocks = Depends(get_safety_interlocks)
):
    # Require explicit confirmation
    safety.reset_emergency_stop()
    await serial_manager.send_command({
        "type": "command",
        "command": "reset_emergency_stop",
        "command_id": generate_id()
    })
    return {"success": True, "message": "Emergency stop reset"}
```

## Testing Safety Interlocks

### Unit Tests
```python
# tests/unit/test_safety_interlocks.py
@pytest.fixture
def safety():
    return SafetyInterlocks()

def test_pump_blocked_by_low_water(safety):
    safety.update_sensor_reading(SensorType.WATER_LEVEL, 3.0)
    allowed, msg = safety.validate_pump_command("on", 30)
    assert not allowed
    assert "below safety minimum" in msg

def test_pump_allowed_normal(safety):
    safety.update_sensor_reading(SensorType.WATER_LEVEL, 50.0)
    safety.update_sensor_reading(SensorType.TEMPERATURE, 25.0)
    safety.update_sensor_reading(SensorType.BATTERY, 3.8)
    allowed, msg = safety.validate_pump_command("on", 30)
    assert allowed

def test_emergency_stop_blocks_all(safety):
    safety.emergency_stop()
    allowed, _ = safety.validate_pump_command("on", 30)
    assert not allowed
    allowed, _ = safety.validate_pump_command("off", 0)
    assert not allowed
```

### Integration Tests
```python
# tests/integration/test_safety_integration.py
@pytest.mark.asyncio
async def test_emergency_stop_api(client):
    # Trigger emergency stop
    response = await client.post("/api/v1/control/emergency_stop")
    assert response.status_code == 200
    
    # Verify pump blocked
    response = await client.post("/api/v1/control/pump", json={"action": "on", "duration_seconds": 30})
    assert response.status_code == 400
    
    # Reset
    response = await client.post("/api/v1/control/emergency_stop/reset")
    assert response.status_code == 200
    
    # Verify pump works again
    response = await client.post("/api/v1/control/pump", json={"action": "on", "duration_seconds": 30})
    assert response.status_code == 200
```

## Compliance & Documentation

### Safety Documentation
- **Safety Requirements Specification** (this ADR)
- **Safety Architecture Document** (hardware + software)
- **Hazard Analysis** (HAZOP for each actuator)
- **Test Plan** (unit, integration, hardware-in-loop)
- **Operating Manual** (emergency procedures)

### Traceability Matrix
| Requirement | Firmware | Backend | Frontend | Hardware | Test |
|-------------|----------|---------|----------|----------|------|
| SR-01: Pump dry-run prevention | ✓ | ✓ | ✓ | ✓ | ✓ |
| SR-02: Max pump runtime | ✓ | ✓ | | | ✓ |
| SR-03: Emergency stop | ✓ | ✓ | ✓ | ✓ | ✓ |
| SR-04: Sensor limits | ✓ | ✓ | | | ✓ |
| SR-05: Valve timeout | ✓ | ✓ | | | ✓ |

## Consequences

### Positive
- Multi-layer protection (hardware + firmware + software)
- Configurable limits for different deployments
- Clear emergency procedures
- Testable at all layers
- Compliance-ready documentation

### Negative
- Complexity across multiple layers
- Potential for false positives (nuisance stops)
- Coordination required between firmware/backend teams
- Hardware E-Stop adds cost/complexity

## Related ADRs
- ADR 005: Serial Protocol (emergency stop command)
- ADR 004: Backend Framework (SafetyInterlocks service)
- ADR 005: Serial Protocol (command/ack pattern)
- ADR 011: Hardware Simulation (safety testing)