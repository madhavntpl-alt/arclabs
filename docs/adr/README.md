# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the ARC LABS Monitoring Platform.

## Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| [001](./001-frontend-framework.md) | Frontend Framework: React + Vite + TypeScript | Accepted | 2024-01-15 |
| [002](./002-styling-approach.md) | Styling Approach: Tailwind CSS + Design Tokens | Accepted | 2024-01-15 |
| [003](./003-state-management.md) | State Management: React Query + Zustand | Accepted | 2024-01-15 |
| [004](./004-backend-framework.md) | Backend Framework: FastAPI + Pydantic + SQLAlchemy | Accepted | 2024-01-15 |
| [005](./005-serial-protocol.md) | Serial Protocol: JSON Lines over USB | Accepted | 2024-01-15 |
| [006](./006-realtime-transport.md) | Real-time Transport: WebSocket | Accepted | 2024-01-15 |
| [007](./007-local-database.md) | Local Database: SQLite with aiosqlite | Accepted | 2024-01-15 |
| [008](./008-timeseries-storage.md) | Timeseries Storage: TimescaleDB (Production) | Accepted | 2024-01-15 |
| [009](./009-authentication.md) | Authentication: JWT + API Keys + RBAC | Proposed | 2024-01-15 |
| [010](./010-deployment-target.md) | Deployment: Vercel + VPS + Docker | Accepted | 2024-01-15 |
| [011](./011-hardware-simulation.md) | Hardware Simulation for CI/Testing | Accepted | 2024-01-15 |
| [012](./012-safety-interlocks.md) | Safety Interlocks: Multi-layer Protection | Accepted | 2024-01-15 |

## How to Use

### Creating a New ADR
1. Copy `template.md` to `NNN-short-title.md`
2. Fill in all sections
3. Add entry to this index
4. Reference in related code/PRs

### ADR Lifecycle
- **Proposed** - Under discussion, not yet implemented
- **Accepted** - Approved, implementation can proceed
- **Superseded** - Replaced by newer ADR (reference successor)
- **Deprecated** - No longer relevant, but not replaced

### Referencing ADRs
In code comments: `// See ADR 003 for state management rationale`
In PR descriptions: `Implements ADR 005 (Serial Protocol)`
In commit messages: `feat: Add WebSocket per ADR 006`

## Template
See `template.md` for the standard ADR format.

## Guidelines

1. **One decision per ADR** - Keep focused
2. **Context first** - Why this decision matters
3. **Alternatives considered** - Show due diligence
4. **Consequences** - Both positive and negative
5. **Implementation notes** - Practical guidance
6. **Related ADRs** - Cross-references