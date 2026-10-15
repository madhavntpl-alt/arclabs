/**
 * Constants for Catalyst Mk1
 * Timing, buffer sizes, and system constants
 */

#ifndef CONSTANTS_H
#define CONSTANTS_H

// ============================================================================
// Timing Constants (milliseconds)
// ============================================================================

// Sensor reading interval
#define SENSOR_READ_INTERVAL_MS     1000    // 1 second

// Status broadcast interval
#define STATUS_SEND_INTERVAL_MS     10000   // 10 seconds

// Heartbeat interval
#define HEARTBEAT_INTERVAL_MS       30000   // 30 seconds

// Serial timeout
#define SERIAL_TIMEOUT_MS           1000

// Command timeout
#define COMMAND_TIMEOUT_MS          5000

// Watchdog timeout
#define WATCHDOG_TIMEOUT_MS         8000

// ============================================================================
// Buffer Sizes
// ============================================================================

// Serial buffers
#define SERIAL_RX_BUFFER_SIZE       1024
#define SERIAL_TX_BUFFER_SIZE       1024
#define JSON_DOC_SIZE               1024

// Message queue
#define MESSAGE_QUEUE_SIZE          32

// Ring buffer for incoming serial
#define MESSAGE_BUFFER_SIZE         2048

// ============================================================================
// Sensor Constants
// ============================================================================

// DHT sensor
#define DHT_READ_INTERVAL_MS        2000    // Minimum interval between DHT reads

// Ultrasonic sensor
#define ULTRASONIC_TIMEOUT_US       30000   // 30ms timeout (max ~5m)
#define ULTRASONIC_SPEED_OF_SOUND   343.0   // m/s at 20°C

// Gas sensor (MQ-2)
#define MQ2_WARMUP_TIME_MS          60000   // 1 minute warmup
#define MQ2_CALIBRATION_SAMPLES     50      // Samples for calibration

// Battery monitor
#define BATTERY_SAMPLES             10      // Samples for averaging
#define BATTERY_LOW_SAMPLES         5       // Consecutive low readings for alert

// ============================================================================
// Actuator Constants
// ============================================================================

// Pump
#define PUMP_MAX_RUNTIME_MS         300000  // 5 minutes max continuous
#define PUMP_COOLDOWN_MS            10000   // 10 seconds between cycles
#define PUMP_MIN_DURATION_MS        1000    // 1 second minimum

// Valve
#define VALVE_OPEN_TIME_MS          5000    // Time to fully open
#define VALVE_CLOSE_TIME_MS         5000    // Time to fully close

// Relay
#define RELAY_SWITCH_DELAY_MS       100     // Debounce delay

// ============================================================================
// Safety Constants
// ============================================================================

// Safety interlocks
#define SAFETY_MAX_PUMP_RUNTIME_MS  300000  // 5 minutes
#define SAFETY_MIN_WATER_LEVEL_CM   5.0     // Emergency stop if below
#define SAFETY_MAX_TEMP_C           60.0    // Emergency stop if above
#define SAFETY_MIN_BATTERY_V        3.0     // Emergency stop if below

// Emergency stop
#define EMERGENCY_STOP_HOLD_MS      1000    // Hold button for 1 second

// ============================================================================
// Communication Constants
// ============================================================================

// Serial
#define SERIAL_BAUDRATE             115200
#define SERIAL_CONFIG               SERIAL_8N1

// JSON protocol
#define JSON_PROTOCOL_VERSION       1
#define MAX_JSON_SIZE               1024

// Message types
#define MSG_TYPE_SENSOR_READING     "sensor_reading"
#define MSG_TYPE_DEVICE_STATUS      "device_status"
#define MSG_TYPE_EVENT              "event"
#define MSG_TYPE_COMMAND            "command"
#define MSG_TYPE_COMMAND_ACK        "command_ack"
#define MSG_TYPE_COMMAND_NACK       "command_nack"
#define MSG_TYPE_HEARTBEAT          "heartbeat"
#define MSG_TYPE_ERROR              "error"

// Command types
#define CMD_PUMP_ON                 "pump_on"
#define CMD_PUMP_OFF                "pump_off"
#define CMD_RELAY_SET               "relay_set"
#define CMD_VALVE_SET               "valve_set"
#define CMD_CALIBRATE               "calibrate"
#define CMD_RESET                   "reset"
#define CMD_GET_STATUS              "get_status"
#define CMD_SET_THRESHOLD           "set_threshold"
#define CMD_ENABLE_AUTOMATION       "enable_automation"
#define CMD_DISABLE_AUTOMATION      "disable_automation"
#define CMD_EMERGENCY_STOP          "emergency_stop"

// Event types
#define EVT_SENSOR_READING          "sensor_reading"
#define EVT_THRESHOLD_EXCEEDED      "threshold_exceeded"
#define EVT_THRESHOLD_CLEARED       "threshold_cleared"
#define EVT_AUTOMATION_TRIGGERED    "automation_triggered"
#define EVT_COMMAND_SENT            "command_sent"
#define EVT_COMMAND_ACK             "command_ack"
#define EVT_COMMAND_FAILED          "command_failed"
#define EVT_DEVICE_CONNECTED        "device_connected"
#define EVT_DEVICE_DISCONNECTED     "device_disconnected"
#define EVT_DEVICE_ERROR            "device_error"
#define EVT_FIRMWARE_UPDATE         "firmware_update"
#define EVT_CALIBRATION             "calibration"
#define EVT_CONFIG_CHANGED          "config_changed"
#define EVT_USER_ACTION             "user_action"
#define EVT_SYSTEM_STARTUP          "system_startup"
#define EVT_SYSTEM_SHUTDOWN         "system_shutdown"
#define EVT_ERROR                   "error"

// Severity levels
#define SEVERITY_INFO               "info"
#define SEVERITY_WARNING            "warning"
#define SEVERITY_CRITICAL           "critical"
#define SEVERITY_EMERGENCY          "emergency"

// ============================================================================
// System Information
// ============================================================================

#define FIRMWARE_VERSION            "1.0.0"
#define HARDWARE_VERSION            "1.0"
#define DEVICE_TYPE                 "catalyst_mk1"
#define DEVICE_NAME                 "Catalyst Mk1"

// ============================================================================
// EEPROM Addresses
// ============================================================================

#define EEPROM_CONFIG_START         0
#define EEPROM_CALIBRATION_START    100
#define EEPROM_THRESHOLDS_START     200
#define EEPROM_AUTOMATION_START     300

// ============================================================================
// Watchdog
// ============================================================================

#define WATCHDOG_ENABLED            true
#define WATCHDOG_TIMEOUT_MS         8000    // 8 seconds

// ============================================================================
// Debug
// ============================================================================

#define DEBUG_ENABLED               true
#define DEBUG_SERIAL                Serial
#define DEBUG_BAUDRATE              115200

#endif // CONSTANTS_H