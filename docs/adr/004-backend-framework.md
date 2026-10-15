# ADR 004: Backend Framework Selection

## Status
Accepted

## Context
We need a backend framework for the ARC LABS monitoring API. Requirements include real-time WebSocket support, async I/O for serial communication, type safety, and good developer experience.

## Decision
We will use **FastAPI with Pydantic v2, SQLAlchemy 2.0, and Uvicorn**.

## Rationale

### FastAPI
- **Async-first** - native async/await for serial I/O, WebSocket, database
- **Automatic OpenAPI** - Swagger UI, ReDoc, client generation
- **Pydantic integration** - validation, serialization, documentation
- **Fast** - Starlette + Uvicorn, comparable to Node/Go
- **Type hints** - full IDE support, mypy checking
- **Dependency injection** - clean architecture, testable
- **WebSocket native** - first-class support, not bolted on

### Pydantic v2
- **Rust-based** - 10-50x faster validation
- **Strict mode** - catch type coercion bugs
- **JSON Schema** - automatic OpenAPI schema generation
- **Custom validators** - field, model, root validators
- **Serialization** - model_dump, model_dump_json

### SQLAlchemy 2.0
- **Async ORM** - asyncpg, aiosqlite support
- **2.0 style** - select(), insert(), update() with typing
- **Mature** - battle-tested, extensive features
- **Alembic** - migrations included
- **Flexible** - raw SQL when needed

### Uvicorn
- **ASGI server** - production-ready
- **Worker processes** - multiprocessing for CPU-bound work
- **Hot reload** - development velocity
- **HTTP/2, WebSocket** support

## Alternatives Considered

### Django + Django REST Framework
- **Pros**: Admin, auth, ORM, batteries included
- **Cons**: Sync-first, heavier, async limited, no native WebSocket

### Flask + Flask-SocketIO
- **Pros**: Lightweight, flexible
- **Cons**: No built-in validation, manual OpenAPI, async limited

### Node.js + Fastify/Express
- **Pros**: Same language as frontend, huge ecosystem
- **Cons**: Context switching, no type safety across boundary, callback hell

### Go + Gin/Fiber
- **Pros**: Performance, concurrency, single binary
- **Cons**: Different language, less team familiarity, verbose

### Rust + Axum/Actix
- **Pros**: Performance, safety, concurrency
- **Cons**: Steep learning curve, longer dev time, smaller team pool

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FASTAPI APP                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  API     │  │  WebSocket│  │  Serial  │  │  Services    │   │
│  │  Routes  │  │  Manager  │  │  Manager │  │  (Business)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│         │           │           │           │                   │
│         └───────────┼───────────┼───────────┘                   │
│                     ▼                                           │
│         ┌─────────────────────────────────────────┐            │
│         │           SERVICE LAYER                 │            │
│         │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │            │
│         │  │ Alert   │ │ Auto-   │ │ Data    │   │            │
│         │  │ Engine  │ │ mation  │ │ Processor│  │            │
│         │  └─────────┘ └─────────┘ └─────────┘   │            │
│         └─────────────────────────────────────────┘            │
│                     │                                           │
│         ┌───────────┴───────────┐                              │
│         ▼                       ▼                              │
│  ┌─────────────┐         ┌─────────────┐                      │
│  │ Repository  │         │  Database   │                      │
│  │  Layer      │         │  (SQLite/   │                      │
│  └─────────────┘         │   TimescaleDB)│                      │
│                          └─────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## Consequences

### Positive
- Full async stack for high concurrency
- Type-safe end-to-end with shared Pydantic models
- Auto-generated API docs
- Easy testing with pytest + httpx
- WebSocket and REST on same server
- Serial communication non-blocking

### Negative
- Python async learning curve
- SQLAlchemy 2.0 syntax different from 1.4
- Pydantic v2 breaking changes from v1
- Fewer built-in features than Django (auth, admin)

## Implementation Notes

### Project Structure
```
backend/
├── app/
│   ├── api/v1/           # REST endpoints
│   ├── core/             # Config, security, database
│   ├── models/           # Pydantic models
│   ├── services/         # Business logic
│   ├── websocket/        # WebSocket handlers
│   ├── repositories/     # Data access
│   ├── schemas/          # OpenAPI customization
│   └── main.py           # App factory
├── tests/
├── pyproject.toml
└── Dockerfile
```

### Key Dependencies
```toml
fastapi>=0.109
uvicorn[standard]>=0.27
pydantic>=2.5
pydantic-settings>=2.1
sqlalchemy>=2.0
aiosqlite>=0.19
alembic>=1.13
python-multipart>=0.0.6
python-jose[cryptography]>=3.3
passlib[bcrypt]>=1.7
structlog>=24.1
prometheus-client>=0.19
pyserial>=3.5
websockets>=12.0
httpx>=0.26
python-dateutil>=2.8
crcmod>=1.7
tenacity>=8.2
```

## Migration Path
- Start with SQLite for development
- Migrate to PostgreSQL for production
- Add authentication (JWT) when needed
- Add rate limiting, CORS, CSP
- Add Prometheus metrics

## Related ADRs
- ADR 005: Serial Protocol
- ADR 006: Real-time Transport
- ADR 007: Local Database
- ADR 008: Timeseries Storage