# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial monorepo structure with pnpm workspaces
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: FastAPI + Pydantic v2 + SQLAlchemy 2.0
- Firmware: Arduino/PlatformIO with JSON Lines protocol
- Shared: TypeScript types + Python Pydantic models
- Docker Compose for local development
- GitHub Actions CI/CD pipelines
- Architecture Decision Records (ADRs)
- Comprehensive documentation

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

---

## [0.1.0] - 2024-01-15

### Added
- Project initialization
- Core monorepo structure
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: FastAPI + Pydantic v2 + SQLAlchemy 2.0
- Firmware: Arduino/PlatformIO with JSON Lines protocol
- Shared: TypeScript types + Python Pydantic models
- Docker Compose for local development
- GitHub Actions CI/CD pipelines
- Architecture Decision Records (ADRs)
- Comprehensive documentation

---

## Release Process

1. Update version in `package.json` (root) and `pyproject.toml` (backend)
2. Update `CHANGELOG.md` with release notes
3. Create git tag: `git tag v0.1.0`
4. Push tag: `git push origin v0.1.0`
5. GitHub Actions builds and deploys automatically

## Versioning Scheme

- **Major**: Breaking API changes, major architecture shifts
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, backward compatible

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance
- `perf`: Performance improvement
- `ci`: CI/CD changes