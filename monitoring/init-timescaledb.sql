-- TimescaleDB Initialization Script for ARC LABS Monitoring Platform
-- This script runs automatically when the TimescaleDB container starts

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Create schema for monitoring data
CREATE SCHEMA IF NOT EXISTS monitoring;
SET search_path TO monitoring, public;

-- =============================================================================
-- HYPERTABLES FOR TIME-SERIES DATA
-- =============================================================================

-- Sensor readings hypertable (partitioned by day)
CREATE TABLE IF NOT EXISTS sensor_readings (
    time        TIMESTAMPTZ       NOT NULL,
    device_id   TEXT              NOT NULL,
    sensor_type TEXT              NOT NULL,
    value       DOUBLE PRECISION  NOT NULL,
    unit        TEXT              NOT NULL,
    status      TEXT              NOT NULL,
    metadata    JSONB
);

SELECT create_hypertable('sensor_readings', 'time', 
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

-- Indexes for sensor_readings
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_time 
ON sensor_readings (device_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_type_time 
ON sensor_readings (sensor_type, time DESC);

-- Compression for sensor_readings (after 7 days)
ALTER TABLE sensor_readings SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'device_id, sensor_type'
);

-- Add compression policy (compress after 7 days)
SELECT add_compression_policy('sensor_readings', INTERVAL '7 days');

-- =============================================================================
-- EVENTS HYPERTABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS events (
    time           TIMESTAMPTZ       NOT NULL,
    device_id      TEXT              NOT NULL,
    event_type     TEXT              NOT NULL,
    severity       TEXT              NOT NULL,
    message        TEXT              NOT NULL,
    metadata       JSONB,
    correlation_id TEXT
);

SELECT create_hypertable('events', 'time', 
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_device_time ON events (device_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_events_type_severity ON events (event_type, severity);

-- Compression for events (after 30 days)
ALTER TABLE events SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'device_id, event_type'
);

SELECT add_compression_policy('events', INTERVAL '30 days');

-- Retention policy for events (1 year)
SELECT add_retention_policy('events', INTERVAL '1 year');

-- =============================================================================
-- CONTINUOUS AGGREGATES FOR SENSOR DATA
-- =============================================================================

-- Hourly sensor aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS sensor_readings_1h
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', time) AS bucket,
    device_id,
    sensor_type,
    MIN(value) AS min_val,
    MAX(value) AS max_val,
    AVG(value) AS avg_val,
    COUNT(*) AS count
FROM sensor_readings
GROUP BY bucket, device_id, sensor_type
WITH NO DATA;

-- Add continuous aggregate policy for hourly
SELECT add_continuous_aggregate_policy('sensor_readings_1h',
    start_offset => INTERVAL '3 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour'
);

-- Daily sensor aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS sensor_readings_1d
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 day', time) AS bucket,
    device_id,
    sensor_type,
    MIN(value) AS min_val,
    MAX(value) AS max_val,
    AVG(value) AS avg_val,
    COUNT(*) AS count
FROM sensor_readings
GROUP BY bucket, device_id, sensor_type
WITH NO DATA;

-- Add continuous aggregate policy for daily
SELECT add_continuous_aggregate_policy('sensor_readings_1d',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day'
);

-- =============================================================================
-- REGULAR TABLES (Non-timeseries)
-- =============================================================================

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    type            TEXT NOT NULL,
    status          TEXT NOT NULL,
    firmware_version TEXT,
    hardware_version TEXT,
    config_json     JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Automation rules table
CREATE TABLE IF NOT EXISTS automation_rules (
    id                    TEXT PRIMARY KEY,
    name                  TEXT NOT NULL,
    description           TEXT,
    enabled               BOOLEAN DEFAULT TRUE,
    priority              INTEGER DEFAULT 10,
    conditions_json       JSONB NOT NULL,
    actions_json          JSONB NOT NULL,
    logic                 TEXT DEFAULT 'AND',
    cooldown_seconds      INTEGER DEFAULT 60,
    max_executions_per_day INTEGER,
    execution_count       INTEGER DEFAULT 0,
    last_triggered        TIMESTAMPTZ,
    last_success          TIMESTAMPTZ,
    last_error            TEXT,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW(),
    created_by            TEXT,
    tags                  TEXT[]
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id              TEXT PRIMARY KEY,
    device_id       TEXT NOT NULL,
    rule_id         TEXT,
    severity        TEXT NOT NULL,
    status          TEXT DEFAULT 'active',
    message         TEXT NOT NULL,
    sensor_type     TEXT,
    value           DOUBLE PRECISION,
    threshold       DOUBLE PRECISION,
    unit            TEXT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by TEXT,
    resolved_at     TIMESTAMPTZ,
    resolved_by     TEXT
);

-- Thresholds configuration
CREATE TABLE IF NOT EXISTS thresholds (
    id                      TEXT PRIMARY KEY,
    water_level_min_cm      DOUBLE PRECISION,
    water_level_max_cm      DOUBLE PRECISION,
    temp_min_c              DOUBLE PRECISION,
    temp_max_c              DOUBLE PRECISION,
    humidity_min_pct        DOUBLE PRECISION,
    humidity_max_pct        DOUBLE PRECISION,
    gas_threshold_ppm       DOUBLE PRECISION,
    battery_min_v           DOUBLE PRECISION,
    battery_max_v           DOUBLE PRECISION,
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_by              TEXT
);

-- Calibration table
CREATE TABLE IF NOT EXISTS calibration (
    id                  TEXT PRIMARY KEY,
    sensor_type         TEXT NOT NULL,
    slope               DOUBLE PRECISION,
    offset              DOUBLE PRECISION,
    r0                  DOUBLE PRECISION,
    intercept           DOUBLE PRECISION,
    divider_ratio       DOUBLE PRECISION,
    adc_ref             DOUBLE PRECISION,
    last_calibrated     TIMESTAMPTZ,
    calibrated_by       TEXT
);

-- Commands log table
CREATE TABLE IF NOT EXISTS commands (
    id              TEXT PRIMARY KEY,
    command_type    TEXT NOT NULL,
    command         TEXT NOT NULL,
    params          JSONB,
    status          TEXT NOT NULL,
    device_id       TEXT,
    sent_at         TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    ack_success     BOOLEAN,
    ack_message     TEXT
);

-- =============================================================================
-- INDEXES FOR REGULAR TABLES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_devices_status ON devices (status);
CREATE INDEX IF NOT EXISTS idx_devices_type ON devices (type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_enabled ON automation_rules (enabled);
CREATE INDEX IF NOT EXISTS idx_automation_rules_priority ON automation_rules (priority);
CREATE INDEX IF NOT EXISTS idx_alerts_device_status ON alerts (device_id, status);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commands_device ON commands (device_id);
CREATE INDEX IF NOT EXISTS idx_commands_status ON commands (status);

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Latest sensor readings per device
CREATE OR REPLACE VIEW latest_sensor_readings AS
SELECT DISTINCT ON (device_id, sensor_type)
    device_id,
    sensor_type,
    value,
    unit,
    status,
    time
FROM sensor_readings
ORDER BY device_id, sensor_type, time DESC;

-- Active alerts summary
CREATE OR REPLACE VIEW active_alerts_summary AS
SELECT 
    device_id,
    severity,
    COUNT(*) as count
FROM alerts
WHERE status = 'active'
GROUP BY device_id, severity;

-- Device status summary
CREATE OR REPLACE VIEW device_status_summary AS
SELECT 
    d.id,
    d.name,
    d.type,
    d.status,
    d.firmware_version,
    d.last_seen,
    COUNT(a.id) as active_alerts_count
FROM devices d
LEFT JOIN alerts a ON d.id = a.device_id AND a.status = 'active'
GROUP BY d.id, d.name, d.type, d.status, d.firmware_version, d.last_seen;

-- =============================================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =============================================================================

-- Function to get latest sensor reading
CREATE OR REPLACE FUNCTION get_latest_reading(p_device_id TEXT, p_sensor_type TEXT)
RETURNS TABLE (
    time TIMESTAMPTZ,
    value DOUBLE PRECISION,
    unit TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT time, value, unit, status
    FROM sensor_readings
    WHERE device_id = p_device_id 
      AND sensor_type = p_sensor_type
    ORDER BY time DESC
    LIMIT 1;
END;
$$ LANGUAGE sql;

-- Function to get sensor history
CREATE OR REPLACE FUNCTION get_sensor_history(
    p_device_id TEXT,
    p_sensor_type TEXT,
    p_start TIMESTAMPTZ,
    p_end TIMESTAMPTZ,
    p_interval INTERVAL DEFAULT '1 minute'
)
RETURNS TABLE (
    bucket TIMESTAMPTZ,
    min_val DOUBLE PRECISION,
    max_val DOUBLE PRECISION,
    avg_val DOUBLE PRECISION,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY EXECUTE format(
        'SELECT time_bucket(%L, time) AS bucket, 
                MIN(value) AS min_val, 
                MAX(value) AS max_val, 
                AVG(value) AS avg_val, 
                COUNT(*) AS count
         FROM sensor_readings
         WHERE device_id = %L 
           AND sensor_type = %L
           AND time >= %L 
           AND time <= %L
         GROUP BY bucket
         ORDER BY bucket',
        p_interval, p_device_id, p_sensor_type, p_start, p_end
    );
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete sensor readings older than 90 days (aggregates retained)
    DELETE FROM sensor_readings 
    WHERE time < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete events older than 1 year
    DELETE FROM events 
    WHERE time < NOW() - INTERVAL '1 year';
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    -- Delete resolved alerts older than 90 days
    DELETE FROM alerts 
    WHERE status = 'resolved' 
      AND resolved_at < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    -- Delete old commands
    DELETE FROM commands 
    WHERE sent_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SCHEDULED JOBS (using pg_cron if available)
-- =============================================================================

-- Schedule daily cleanup at 2 AM
-- SELECT cron.schedule('daily-cleanup', '0 2 * * *', 'SELECT cleanup_old_data();');

-- Schedule continuous aggregate refresh
-- These are handled automatically by TimescaleDB policies

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Create monitoring user with read access
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'monitoring') THEN
        CREATE ROLE monitoring WITH LOGIN PASSWORD 'monitoring_password';
    END IF;
END $$;

GRANT USAGE ON SCHEMA monitoring TO monitoring;
GRANT SELECT ON ALL TABLES IN SCHEMA monitoring TO monitoring;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA monitoring TO monitoring;

-- Grant TimescaleDB functions
GRANT EXECUTE ON FUNCTION cleanup_old_data() TO monitoring;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'TimescaleDB initialization completed successfully!';
    RAISE NOTICE 'Hypertables created: sensor_readings, events';
    RAISE NOTICE 'Continuous aggregates: sensor_readings_1h, sensor_readings_1d';
    RAISE NOTICE 'Compression policies enabled';
    RAISE NOTICE 'Retention policies configured';
END $$;