/**
 * Default Thresholds for Catalyst Mk1
 * These can be overridden via serial commands
 */

#ifndef THRESHOLDS_H
#define THRESHOLDS_H

// ============================================================================
// Water Level Thresholds (cm)
// ============================================================================

#define WATER_LEVEL_MIN_CM      10.0    // Low water alert
#define WATER_LEVEL_MAX_CM      200.0   // High water alert
#define WATER_LEVEL_CRITICAL_CM 5.0     // Emergency low

// ============================================================================
// Temperature Thresholds (°C)
// ============================================================================

#define TEMP_MIN_C              0.0     // Low temp alert
#define TEMP_MAX_C              50.0    // High temp alert
#define TEMP_CRITICAL_MIN_C     -10.0   // Emergency low
#define TEMP_CRITICAL_MAX_C     60.0    // Emergency high

// ============================================================================
// Humidity Thresholds (%)
// ============================================================================

#define HUMIDITY_MIN_PCT        20.0    // Low humidity alert
#define HUMIDITY_MAX_PCT        80.0    // High humidity alert
#define HUMIDITY_CRITICAL_MIN   10.0    // Emergency low
#define HUMIDITY_CRITICAL_MAX   90.0    // Emergency high

// ============================================================================
// Gas Thresholds (ppm)
// ============================================================================

#define GAS_THRESHOLD_PPM       1000.0  // Gas alert threshold
#define GAS_CRITICAL_PPM        2000.0  // Emergency high

// ============================================================================
// Battery Thresholds (V)
// ============================================================================

#define BATTERY_MIN_V           3.3     // Low battery alert
#define BATTERY_MAX_V           4.2     // High battery (charging)
#define BATTERY_CRITICAL_V      3.0     // Emergency low
#define BATTERY_FULL_V          4.1     // Considered full

// ============================================================================
// Threshold Severity Levels
// ============================================================================

typedef enum {
    SEVERITY_INFO     = 0,  // Informational
    SEVERITY_WARNING  = 1,  // Warning
    SEVERITY_CRITICAL = 2,  // Critical
    SEVERITY_EMERGENCY = 3  // Emergency
} ThresholdSeverity;

// ============================================================================
// Threshold Configuration Structure
// ============================================================================

struct ThresholdConfig {
    float water_level_min;
    float water_level_max;
    float temp_min;
    float temp_max;
    float humidity_min;
    float humidity_max;
    float gas_threshold;
    float battery_min;
    float battery_max;
};

// Default configuration
const ThresholdConfig DEFAULT_THRESHOLDS = {
    .water_level_min = WATER_LEVEL_MIN_CM,
    .water_level_max = WATER_LEVEL_MAX_CM,
    .temp_min = TEMP_MIN_C,
    .temp_max = TEMP_MAX_C,
    .humidity_min = HUMIDITY_MIN_PCT,
    .humidity_max = HUMIDITY_MAX_PCT,
    .gas_threshold = GAS_THRESHOLD_PPM,
    .battery_min = BATTERY_MIN_V,
    .battery_max = BATTERY_MAX_V,
};

#endif // THRESHOLDS_H