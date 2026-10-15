# ADR 009: Authentication and Authorization

## Status
Proposed (for v1.1)

## Context
The ARC LABS platform currently has no authentication. As we move to production and multi-user deployments, we need authentication and authorization.

## Decision
We will implement **JWT-based authentication with API keys** for programmatic access, with role-based access control (RBAC).

## Requirements

### Authentication
- **JWT tokens** for session management
- **API keys** for programmatic access (devices, integrations)
- **Refresh tokens** for long-lived sessions
- **Password hashing** with bcrypt/argon2
- **MFA support** (TOTP) for admin accounts

### Authorization
- **Role-based access control (RBAC)**
- **Resource-level permissions**
- **Device-scoped access** for multi-device deployments

### Roles
| Role | Description | Permissions |
|------|-------------|-------------|
| admin | Full system access | All |
| operator | Device control, monitoring | Read sensors, control actuators, view alerts |
| viewer | Read-only access | Read sensors, view alerts, view events |
| device | Device authentication | Send sensor data, receive commands |
| integration | Third-party integrations | Configurable scopes |

## Implementation

### JWT Tokens
Access token (short-lived):
```json
{
  "sub": "user_id",
  "type": "access",
  "roles": ["operator"],
  "device_ids": ["device_1", "device_2"],
  "exp": 1699903600,
  "iat": 1699900000
}
```

Refresh token (long-lived):
```json
{
  "sub": "user_id",
  "type": "refresh",
  "exp": 1700500000,
  "iat": 1699900000
}
```

### API Keys
Format: `ak_live_{base64url_encoded_random_bytes}`
Header: `Authorization: Bearer ak_live_...`

### Token Storage
- Access token: Memory (React state) + httpOnly cookie (fallback)
- Refresh token: httpOnly cookie, Secure, SameSite=Strict
- API keys: Hashed in database (bcrypt), only prefix stored

## API Endpoints

### Authentication
```
POST   /api/v1/auth/login           # Email/password → tokens
POST   /api/v1/auth/refresh         # Refresh token → new access token
POST   /api/v1/auth/logout          # Invalidate refresh token
POST   /api/v1/auth/mfa/enable      # Enable TOTP
POST   /api/v1/auth/mfa/verify      # Verify TOTP code
POST   /api/v1/auth/password/change # Change password
POST   /api/v1/auth/password/reset  # Request reset email
```

### API Keys
```
POST   /api/v1/api-keys             # Create API key
GET    /api/v1/api-keys             # List API keys (prefix only)
DELETE /api/v1/api-keys/{id}        # Revoke API key
```

### User Management (Admin)
```
GET    /api/v1/users                # List users
POST   /api/v1/users                # Create user (admin)
GET    /api/v1/users/{id}           # Get user
PATCH  /api/v1/users/{id}           # Update user (roles, device access)
DELETE /api/v1/users/{id}           # Delete user (admin)
```

## Authorization Middleware

### Dependency Injection
```python
# app/api/deps.py
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_jwt(token)
    user = await get_user(db, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(401, "Invalid token")
    return user

def require_roles(*roles: str):
    def checker(user: User = Depends(get_current_user)):
        if not any(role in user.roles for role in roles):
            raise HTTPException(403, "Insufficient permissions")
        return user
    return checker

def require_device_access(device_id: str):
    def checker(user: User = Depends(get_current_user)):
        if device_id not in user.device_ids and "admin" not in user.roles:
            raise HTTPException(403, "Device access denied")
        return user
    return checker
```

### Route Protection
```python
# Sensors - viewer+
@router.get("/sensors", dependencies=[Depends(require_roles("viewer", "operator", "admin"))])

# Control - operator+
@router.post("/control/pump", dependencies=[Depends(require_roles("operator", "admin"))])

# Admin only
@router.delete("/users/{id}", dependencies=[Depends(require_roles("admin"))])

# Device access scoped
@router.get("/devices/{device_id}/sensors", dependencies=[Depends(require_device_access)])
```

## Device Authentication

### Device JWT
```json
{
  "sub": "device_id",
  "type": "device",
  "device_id": "catalyst-mk1-001",
  "iat": 1699900000,
  "exp": 1700500000
}
```

### Device Registration
```
POST /api/v1/devices/register
{
  "name": "Catalyst Mk1 #1",
  "type": "catalyst_mk1",
  "hardware_version": "1.0",
  "serial_port": "/dev/ttyUSB0"
}
→ Returns device_id and JWT
```

## WebSocket Authentication

### Connection Handshake
```
GET /ws/live?token=eyJhbGciOiJIUzI1NiIs...
```

### Token Validation
```python
async def websocket_auth(websocket: WebSocket, token: str):
    try:
        payload = decode_jwt(token)
        if payload["type"] not in ("access", "device"):
            raise WebSocketException(4001, "Invalid token type")
        return payload
    except JWTError:
        raise WebSocketException(4001, "Invalid token")
```

## Password Security

### Hashing
```python
# Argon2id (preferred) or bcrypt
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

### Requirements
- Min 12 characters
- No common passwords (check against haveibeenpwned)
- No user info in password
- Rate limit: 5 attempts per 15 min per IP

## Session Management

### Token Rotation
- Access token: 30 minutes
- Refresh token: 7 days
- Rotate refresh token on use (detect reuse)

### Invalidation
- Logout: Delete refresh token
- Password change: Invalidate all refresh tokens
- Role change: Invalidate all access tokens (short TTL handles this)
- Suspicious activity: Invalidate all tokens

## Audit Logging

### Events to Log
- Login success/failure
- Token refresh
- Password change
- MFA enable/disable
- Role changes
- API key create/revoke
- Admin actions

### Log Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "event_type": "auth.login",
  "user_id": "user_123",
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "success": true,
  "metadata": {}
}
```

## Multi-Factor Authentication (MFA)

### TOTP (RFC 6238)
- QR code for authenticator app
- 6-digit codes, 30-second window
- Backup codes (10, single-use)

### Enrollment Flow
1. User enables MFA
2. Generate secret, show QR code
3. User scans, enters code
4. Verify, store encrypted secret
5. Generate backup codes

### Verification
```python
def verify_totp(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)
```

## Rate Limiting

### Per-Endpoint
| Endpoint | Limit |
|----------|-------|
| /auth/login | 5/min/IP |
| /auth/refresh | 10/min/user |
| /auth/mfa/verify | 5/min/user |
| /api/* | 100/min/user |

### Implementation
```python
# Redis-backed rate limiter
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@router.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, ...):
```

## Consequences

### Positive
- Secure, standard authentication
- Fine-grained access control
- Device and user authentication
- Audit trail for compliance
- Scalable to multi-device/multi-user

### Negative
- Significant implementation effort
- Complexity in token management
- Requires secure key management
- Additional infrastructure (Redis for rate limiting)
- Ongoing security maintenance

## Implementation Phases

### Phase 1 (v1.1)
- JWT authentication
- Basic roles (admin, operator, viewer)
- API keys for devices
- Password hashing

### Phase 2 (v1.2)
- Refresh token rotation
- MFA (TOTP)
- Device registration flow
- Audit logging

### Phase 3 (v1.3)
- MFA enforcement for admins
- SSO (OIDC/SAML)
- Device-scoped permissions
- Advanced audit queries

## Related ADRs
- ADR 004: Backend Framework
- ADR 006: Real-time Transport (WebSocket auth)
- ADR 010: Deployment Target