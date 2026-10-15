# ADR 007: Local Database Selection

## Status
Accepted

## Context
The ARC LABS backend needs a local database for development and single-device deployments. Requirements: lightweight, zero-config, supports async, compatible with SQLAlchemy 2.0.

## Decision
We will use **SQLite with aiosqlite** for local development and single-device deployments.

## Rationale

### SQLite
- **Zero configuration** - single file, no server process
- **Embedded** - runs in-process, no network latency
- **ACID compliant** - full transaction support
- **Ubiquitous** - available everywhere, battle-tested
- **SQL standard** - compatible with SQLAlchemy
- **Portable** - single file for backup/migration
- **WAL mode** - concurrent readers, better performance

### aiosqlite
- **Async wrapper** - non-blocking I/O for FastAPI
- **Thread pool** - runs SQLite in executor
- **Compatible** - drop-in for asyncpg API
- **Lightweight** - minimal overhead

### WAL Mode
```python
# Enable WAL for better concurrency
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA cache_size=-32768;  # 32MB cache
PRAGMA temp_store=MEMORY;
```

## Schema Design

### Tables

#### devices
```sql
CREATE TABLE devices (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    type            TEXT NOT NULL,
    status          TEXT NOT NULL,
    firmware_version TEXT,
    hardware_version TEXT,
    config_json     JSONB,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### sensor_readings (Time-series, partitioned by day)
```sql
CREATE TABLE sensor_readings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id     TEXT              NOT NULL,
    sensor_type   TEXT              NOT NULL,
    value         REAL              NOT NULL,
    unit          TEXT              NOT NULL,
    timestamp     TIMESTAMP         NOT NULL,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);
CREATE INDEX idx_sensor_readings_device_time ON sensor_readings(device_id, timestamp);
```

#### events
```sql
CREATE TABLE events (
    id           TEXT PRIMARY KEY,
    device_id    TEXT              NOT NULL,
    event_type   TEXT              NOT NULL,
    severity     TEXT              NOT NULL,
    message      TEXT              NOT NULL,
    metadata     JSONB,
    timestamp    TIMESTAMP         NOT NULL,
    correlation_id TEXT,
    device_id FK REFERENCES devices(id)
);
CREATE INDEX idx_events_device_time ON events(device_id, timestamp);
CREATE INDEX idx_events_type_severity ON events(event_type, severity);
```

#### alerts
```sql
CREATE TABLE alerts (
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
    resolved_by     TEXT,
    device_id FK REFERENCES devices(id)
);
```

#### automation_rules
```sql
CREATE TABLE automation_rules (
    id                      TEXT PRIMARY KEY,
    name                    TEXT NOT NULL,
    enabled                 BOOLEAN DEFAULT TRUE,
    priority                INTEGER DEFAULT 10,
    conditions_json         JSONB NOT NULL,
    actions_json            JSONB NOT NULL,
    logic                   TEXT DEFAULT 'AND',
    cooldown_seconds        INTEGER DEFAULT 60,
    max_executions_per_day  INTEGER,
    execution_count         INTEGER DEFAULT 0,
    last_triggered          TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);
```

## Configuration

### Database URL
```python
# Development
DATABASE_URL = "sqlite+aiosqlite:///./data/arc_labs.db"

# Production (single device)
DATABASE_URL = "sqlite+aiosqlite:///./data/arc_labs.db"

# With WAL and optimizations
DATABASE_URL = "sqlite+aiosqlite:///./data/arc_labs.db?journal_mode=WAL&synchronous=NORMAL&cache_size=-32768"
```

### Engine Configuration
```python
engine = create_async_engine(
    DATABASE_URL,
    echo=settings.APP_DEBUG,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={
        "check_same_thread": False,  # Allow multi-thread
    },
)
```

## Migration Strategy

### Alembic Setup
```ini
# alembic.ini
[alembic]
script_location = migrations
sqlalchemy.url = sqlite+aiosqlite:///./data/arc_labs.db

[post_write_hooks]
hooks = format
format.type = console_scripts
format.entrypoint = black
format.options = -l 100
```

### Migration Commands
```bash
# Create migration
alembic revision --autogenerate -m "add sensor_readings table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Data Retention

### Sensor Readings
- **High resolution**: 1 minute for 7 days
- **Aggregated**: 15 minutes for 90 days
- **Daily aggregates**: 1 hour for 2 years

### Events
- **All events**: 90 days
- **Critical/emergency**: 2 years
- **Archived**: Compressed, moved to cold storage

### Alerts
- **Active**: Until resolved
- **Resolved**: 90 days
- **Archived**: 2 years

## Backup Strategy

### Automated Backup
```python
# Daily at 2 AM
async def backup_database():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"./backups/arc_labs_{timestamp}.db"
    
    # Use SQLite backup API
    async with aiosqlite.connect(DATABASE_URL) as src:
        async with aiosqlite.connect(backup_path) as dst:
            await src.backup(dst)
    
    # Compress
    subprocess.run(["gzip", backup_path])
    
    # Clean old backups (keep 30 days)
    cleanup_old_backups()
```

### Restore
```bash
# Stop backend
# Restore from backup
gunzip -c backups/arc_labs_20240115_020000.db.gz > ./data/arc_labs.db
# Restart backend
```

## Performance

### Indexing Strategy
- Primary keys on all tables
- Composite indexes for time-series queries
- Partial indexes for common filters
- Monitor with `EXPLAIN QUERY PLAN`

### Vacuum Schedule
```sql
-- Weekly vacuum
VACUUM;

-- Analyze for query planner
ANALYZE;
```

## Limits

### SQLite Limits
| Limit | Value | Notes |
|-------|-------|-------|
| Max database size | 281 TB | Theoretical |
| Max row size | 1 GB | Practical limit much lower |
| Concurrent writers | 1 | WAL allows concurrent readers |
| Page size | 4096 bytes | Configurable at compile |

### Practical Limits for ARC LABS
- **Sensor readings**: ~10/sec = 864K/day = ~315M/year
- **Events**: ~100/day = 36K/year
- **Database size**: ~500MB/year (with indexes)
- **Retention**: 2 years = ~1GB

## Migration to TimescaleDB (ADR 008)

### When to Migrate
- Multi-device deployments
- Concurrent writers needed
- Horizontal scaling required
- Advanced analytics (TimescaleDB)

### Migration Path
1. Add PostgreSQL support alongside SQLite
2. Dual-write during transition
3. Migrate historical data with `pgloader`
4. Switch reads to TimescaleDB
5. Stop SQLite writes

## Consequences

### Positive
- Zero-config development
- Simple backup/restore
- No infrastructure for single device
- Easy testing (in-memory SQLite)
- Portable deployment

### Negative
- Single writer limitation
- No horizontal scaling
- Limited concurrent connections
- No built-in replication
- Manual partitioning for time-series

## Migration to TimescaleDB (ADR 008)

## Related ADRs
- ADR 004: Backend Framework
- ADR 008: Timeseries Storage
- ADR 011: Hardware Simulation