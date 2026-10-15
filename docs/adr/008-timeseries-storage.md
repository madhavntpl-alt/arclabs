# ADR 008: Timeseries Storage for Production

## Status
Accepted (for production migration)

## Context
As ARC LABS scales to multiple devices and higher data volumes, SQLite becomes insufficient for time-series sensor data. We need a production-ready timeseries database.

## Decision
We will migrate to **PostgreSQL with TimescaleDB extension** for production time-series storage.

## Rationale

### TimescaleDB
- **PostgreSQL extension** - full SQL, ACID, familiar tooling
- **Automatic partitioning** - hypertables by time interval
- **Compression** - 90%+ storage reduction
- **Continuous aggregates** - materialized views auto-refreshed
- **Data retention** - automated drop policies
- **Scaling** - distributed hypertables, multi-node
- **PostgreSQL ecosystem** - ORMs, tools, expertise

### Why Not Alternatives

#### InfluxDB
- **Pros**: Purpose-built, Flux query language, built-in UI
- **Cons**: Separate stack, Flux learning curve, TSM engine quirks, licensing changes

#### Prometheus
- **Pros**: Metrics-focused, PromQL, built-in alerting
- **Cons**: Not for event data, no SQL, limited retention, pull model

#### MongoDB
- **Pros**: Flexible schema, horizontal scaling
- **Cons**: No SQL, weaker time-series functions, eventual consistency

#### Custom PostgreSQL Partitioning
- **Pros**: Native, no extension
- **Cons**: Manual partition management, no compression, no continuous aggregates

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRODUCTION STACK                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Backend    │  │  Backend    │  │  Backend (Analytics)    │ │
│  │  (API)      │  │  (Ingestion)│  │  (Read Replicas)        │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                      │               │
│         └────────────────┼──────────────────────┘               │
│                          ▼                                     │
│                 ┌─────────────────┐                            │
│                 │  PgBouncer      │  (Connection Pooling)      │
│                 └────────┬────────┘                            │
│                          ▼                                     │
│                 ┌─────────────────┐                            │
│                 │  TimescaleDB    │  (Primary)                 │
│                 │  (Hypertables)  │                            │
│                 └────────┬────────┘                            │
│                          ▼                                     │
│                 ┌─────────────────┐                            │
│                 │  Replica(s)     │  (Read Scaling)            │
│                 └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

## Schema Design

### Hypertables

#### sensor_readings
```sql
CREATE TABLE sensor_readings (
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

-- Compression after 7 days
ALTER TABLE sensor_readings SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'device_id, sensor_type'
);

ADD COMPRESSION POLICY sensor_readings INTERVAL '7 days';
```

#### events
```sql
CREATE TABLE events (
    time        TIMESTAMPTZ       NOT NULL,
    device_id   TEXT              NOT NULL,
    event_type  TEXT              NOT NULL,
    severity    TEXT              NOT NULL,
    message     TEXT              NOT NULL,
    metadata    JSONB,
    correlation_id TEXT
);

SELECT create_hypertable('events', 'time',
    chunk_time_interval => INTERVAL '1 day'
);

-- Compression after 30 days
ALTER TABLE events SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'device_id, event_type'
);

ADD COMPRESSION POLICY events INTERVAL '30 days';
```

### Regular Tables (Non-timeseries)

```sql
-- Devices, rules, config - regular tables
CREATE TABLE devices ( ... );
CREATE TABLE automation_rules ( ... );
CREATE TABLE thresholds ( ... );
```

## Continuous Aggregates

### Hourly Sensor Aggregates
```sql
CREATE MATERIALIZED VIEW sensor_readings_1h
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

ADD CONTINUOUS AGGREGATE POLICY sensor_readings_1h
    START_OFFSET INTERVAL '3 hours'
    END_OFFSET INTERVAL '1 hour'
    SCHEDULE INTERVAL '1 hour';
```

### Daily Sensor Aggregates
```sql
CREATE MATERIALIZED VIEW sensor_readings_1d
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

ADD CONTINUOUS AGGREGATE POLICY sensor_readings_1d
    START_OFFSET INTERVAL '3 days'
    END_OFFSET INTERVAL '1 day'
    SCHEDULE INTERVAL '1 day';
```

## Data Retention Policies

```sql
-- Drop raw readings after 90 days (aggregates kept)
SELECT add_retention_policy('sensor_readings', INTERVAL '90 days');

-- Drop events after 1 year
SELECT add_retention_policy('events', INTERVAL '1 year');

-- Keep aggregates for 5 years
-- No retention policy on continuous aggregates
```

## Compression Details

### Compressed Column Types
| Type | Compression | Ratio |
|------|-------------|-------|
| TIMESTAMPTZ | Delta-delta | 90%+ |
| DOUBLE PRECISION | Gorilla | 85%+ |
| TEXT (low cardinality) | Dictionary | 80%+ |
| JSONB | Custom | 50%+ |

### Expected Storage Savings
| Data Type | Raw (1 year) | Compressed | Savings |
|-----------|--------------|------------|---------|
| sensor_readings (10Hz, 5 sensors) | ~1.5 GB | ~150 MB | 90% |
| events (100/day) | ~50 MB | ~10 MB | 80% |
| Total | ~1.55 GB | ~160 MB | 90% |

## Indexing Strategy

### Automatic Indexes (TimescaleDB)
- Time column (automatic)
- Space partitioning columns (automatic)

### Custom Indexes
```sql
-- For device + time queries
CREATE INDEX idx_sensor_readings_device_time 
ON sensor_readings (device_id, time DESC);

-- For sensor type queries
CREATE INDEX idx_sensor_readings_type_time 
ON sensor_readings (sensor_type, time DESC);

-- For device status
CREATE INDEX idx_devices_status ON devices (status);

-- For rule evaluation
CREATE INDEX idx_rules_enabled_priority ON automation_rules (enabled, priority);
```

## Connection Pooling (PgBouncer)

```ini
# pgbouncer.ini
[databases]
arc_labs = host=timescaledb port=5432 dbname=arc_labs

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 5
max_db_connections = 50
```

## Migration from SQLite

### pgloader
```bash
# load.conf
LOAD DATABASE
    FROM sqlite:///./data/arc_labs.db
    INTO postgresql://user:pass@timescaledb:5432/arc_labs

WITH include drop, create tables, create indexes, reset sequences
     data only
     max parallel create index = 4
```

### Dual-Write Transition
1. Enable dual-write in backend (SQLite + TimescaleDB)
2. Run pgloader for historical data
3. Verify data integrity
3. Switch reads to TimescaleDB
4. Stop SQLite writes

## Monitoring

### Key Metrics
| Metric | Target |
|--------|--------|
| Chunk count | < 1000 |
| Compression ratio | > 80% |
| Continuous aggregate lag | < 5 min |
| Query latency (p95) | < 100ms |
| Compression ratio | > 85% |
| Disk usage growth | Predictable |

### Queries to Monitor
```sql
-- Chunk status
SELECT * FROM timescaledb_information.chunks;

-- Compression stats
SELECT * FROM timescaledb_information.compressed_chunk_stats;

-- Continuous aggregate status
SELECT * FROM timescaledb_information.continuous_aggregates;

-- Retention policies
SELECT * FROM timescaledb_information.retention_policies;
```

## Backup & Disaster Recovery

### Continuous Archiving (WAL-G)
```bash
# Base backup daily
wal-g backup-push /var/lib/postgresql/data

# WAL archiving continuous
archive_command = 'wal-g wal-push %p'
```

### Point-in-Time Recovery
```bash
# Restore to specific timestamp
wal-g backup-fetch /var/lib/postgresql/data LATEST
wal-g wal-fetch /var/lib/postgresql/data 2024-01-15T10:30:00Z
```

## Scaling

### Read Scaling
- Add read replicas for analytics queries
- Route analytics to replicas via PgBouncer
- Use `pg_stat_statements` to identify slow queries

### Write Scaling
- Single writer (TimescaleDB limitation)
- Multi-node for massive scale (Enterprise)
- Shard by device_id if needed

### Multi-node (Future)
```sql
-- Distributed hypertable
SELECT create_distributed_hypertable('sensor_readings', 'time', 'device_id');
```

## Consequences

### Positive
- Massive storage savings (90% compression)
- Fast time-range queries
- Automatic partition management
- Built-in data retention
- SQL compatibility
- Horizontal read scaling

### Negative
- Additional infrastructure (TimescaleDB, PgBouncer)
- More complex than SQLite
- Single writer bottleneck at extreme scale
- Requires PostgreSQL expertise
- Licensing (Timescale License for some features)

## Migration Checklist
- [ ] Provision TimescaleDB (cloud or self-hosted)
- [ ] Configure PgBouncer
- [ ] Run pgloader migration
- [ ] Verify data integrity
- [ ] Enable compression policies
- [ ] Set up continuous aggregates
- [ ] Configure retention policies
- [ ] Set up backups (WAL-G)
- [ ] Configure monitoring
- [ ] Load test with production data
- [ ] Switch backend to TimescaleDB
- [ ] Decommission SQLite

## Related ADRs
- ADR 004: Backend Framework
- ADR 007: Local Database
- ADR 010: Deployment Target