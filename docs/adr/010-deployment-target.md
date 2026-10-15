# ADR 010: Deployment Target

## Status
Accepted

## Context
We need to decide on the deployment infrastructure for the ARC LABS monitoring platform. Requirements include: frontend hosting, backend API hosting, database, WebSocket support, CI/CD, and cost-effectiveness.

## Decision
We will deploy:
- **Frontend**: Vercel (static hosting + edge functions)
- **Backend**: Docker containers on a VPS (Hetzner/DigitalOcean) or Kubernetes (future)
- **Database**: PostgreSQL with TimescaleDB (managed or self-hosted)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana (self-hosted)

## Rationale

### Frontend: Vercel
- **Zero-config** Next.js/React/Vite deployment
- **Edge network** - global CDN, low latency
- **Preview deployments** - every PR gets a URL
- **Custom domains** - free SSL, easy DNS
- **Edge functions** - for auth, redirects, A/B testing
- **Analytics** - built-in Web Vitals
- **Cost** - generous free tier, pay for usage

### Backend: VPS (Hetzner CX42 or DigitalOcean 4GB)
- **Full control** - Docker, systemd, custom config
- **Cost-effective** - ~€30-40/month for 4 vCPU, 8GB RAM, 160GB SSD
- **WebSocket support** - no proxy limitations
- **Serial access** - direct USB device access
- **No vendor lock-in** - standard Linux
- **Scalable** - can migrate to K8s later

#### Hetzner CX42 (Recommended)
- 4 vCPU, 8GB RAM, 160GB NVMe
- €30.52/month
- Nuremberg/Falkenstein data centers
- Excellent price/performance

#### DigitalOcean 4GB
- 2 vCPU, 4GB RAM, 80GB SSD
- $24/month
- Multiple regions
- Simpler UI

### Database: TimescaleDB (Self-hosted on same VPS or Managed)
- **Self-hosted on VPS** - no extra cost, full control
- **Managed (Timescale Cloud)** - $0.021/hr for 1CPU/4GB, automatic backups, HA
- **Migration path** - start self-hosted, migrate to managed if needed

### CI/CD: GitHub Actions
- **Native integration** - no extra accounts
- **Matrix builds** - test multiple Python/Node versions
- **Docker layer caching** - fast builds
- **Environments** - staging/production protection rules
- **Self-hosted runners** - for serial access tests (optional)

### Monitoring: Prometheus + Grafana (Self-hosted)
- **No vendor lock-in** - open source
- **Full control** - custom dashboards, alerts
- **Cost** - runs on same VPS
- **Integration** - Node exporter, cAdvisor, postgres_exporter

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│  │   GITHUB    │     │   VERCEL    │     │   VPS       │                  │
│  │             │     │  (Frontend) │     │  (Backend)  │                  │
│  │  ┌───────┐  │     │             │     │             │                  │
│  │  │ Code  │──┼────►│  Build &    │     │  ┌───────┐  │                  │
│  │  │ Push  │  │     │  Deploy     │     │  │Docker │  │                  │
│  │  └───────┘  │     │             │     │  │Compose│  │                  │
│  │      │      │     │  ┌───────┐  │     │  │       │  │                  │
│  │      │      │     │  │ CDN   │  │     │  │┌─────┐│  │                  │
│  │      ▼      │     │  └───────┘  │     │  ││Backend│  │                  │
│  │  ┌───────┐  │     │             │     │  │└─────┘│  │                  │
│  │  │ CI/CD │  │     │  ┌───────┐  │     │  │┌─────┐│  │                  │
│  │  │GitHub │  │     │  │Preview│  │     │  ││Timescale│ │               │
│  │  │Actions│  │     │  │Deploy │  │     │  ││DB     │  │                  │
│  │  └───────┘  │     │  └───────┘  │     │  │└─────┘│  │                  │
│  └─────────────┘     └─────────────┘     │  │┌─────┐│  │                  │
│                                           │  ││Redis│  │  │                  │
│                                           │  ││(Rate │  │                  │
│                                           │  ││Limit)│  │                  │
│                                           │  │└─────┘│  │                  │
│                                           │  └───────┘  │                  │
│                                           └─────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Configuration

### Vercel (Frontend)
```json
// vercel.json
{
  "buildCommand": "pnpm build:frontend",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://api.arc-labs.com/api/$1" },
    { "source": "/ws/(.*)", "destination": "wss://api.arc-labs.com/ws/$1" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss://api.arc-labs.com" }
      ]
    }
  ]
}
```

### VPS Setup (Ubuntu 22.04 LTS)
```bash
# Initial setup
apt update && apt upgrade -y
apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx

# Docker Compose
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  backend:
    image: ghcr.io/arc-labs/backend:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:pass@timescaledb:5432/arc_labs
      - SECRET_KEY=${SECRET_KEY}
      - CORS_ORIGINS=["https://app.arc-labs.com"]
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  timescaledb:
    image: timescale/timescaledb:latest-pg15
    environment:
      - POSTGRES_DB=arc_labs
      - POSTGRES_USER=arc_labs
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - timescaledb_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    volumes:
      - ./init-timescaledb.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - backend

volumes:
  timescaledb_data:
  redis_data:
EOF
```

### Nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml
        application/rss+xml
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Upstream backend
    upstream backend {
        least_conn;
        server backend:8000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name api.arc-labs.com;

        # Let's Encrypt ACME challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Redirect all other traffic to HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name api.arc-labs.com;

        # SSL configuration
        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss://api.arc-labs.com" always;

        # WebSocket
        location /ws/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 86400;
            proxy_send_timeout 86400;

            # WebSocket specific
            proxy_set_header Sec-WebSocket-Protocol $http_sec_websocket_protocol;
        }

        # API endpoints with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            limit_req_status 429;

            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Port $server_port;

            proxy_connect_timeout 30s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;

            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
        }

        # Auth endpoints with stricter rate limiting
        location /api/v1/auth/login {
            limit_req zone=login burst=5 nodelay;
            limit_req_status 429;

            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/v1/auth/refresh {
            limit_req zone=login burst=10 nodelay;
            limit_req_status 429;

            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check (no rate limiting)
        location /health {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            access_log off;
        }

        # Metrics endpoint (internal only)
        location /metrics {
            allow 10.0.0.0/8;
            allow 172.16.0.0/12;
            allow 192.168.0.0/16;
            deny all;

            proxy_pass http://backend;
            proxy_set_header Host $host;
        }

        # Default proxy
        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Frontend server (optional, if not using Vercel)
    server {
        listen 443 ssl http2;
        server_name app.arc-labs.com;

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        root /var/www/frontend;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### GitHub Actions CI/CD
```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install poetry
      - run: cd backend && poetry install
      - run: cd backend && poetry run pytest

  build-and-push:
    needs: [lint-and-test, test-backend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ghcr.io/arc-labs/backend:${{ github.sha }},ghcr.io/arc-labs/backend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-frontend:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./frontend

  deploy-backend:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/arc-labs
            docker-compose pull
            docker-compose up -d
            docker image prune -f
```

### Secrets Management
```bash
# GitHub Secrets Required
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VPS_HOST
VPS_USER
VPS_SSH_KEY
SECRET_KEY
DB_PASSWORD
```

### SSL Certificates (Let's Encrypt)
```bash
# Initial setup
certbot --nginx -d api.arc-labs.com

# Auto-renewal
echo "0 0,12 * * * root certbot renew --quiet" > /etc/cron.d/certbot
```

## Environments

### Development
- Frontend: Vercel Preview Deployment (auto on PR)
- Backend: Local Docker Compose
- Database: Local SQLite

### Staging
- Frontend: Vercel Preview (develop branch)
- Backend: VPS (staging subdomain)
- Database: TimescaleDB on VPS

### Production
- Frontend: Vercel Production (main branch)
- Backend: VPS (main branch)
- Database: TimescaleDB on VPS

## Scaling Plan

### Phase 1 (MVP)
- Single VPS with Docker Compose
- SQLite for development
- TimescaleDB on same VPS

### Phase 2 (Growth)
- Separate TimescaleDB VPS
- Redis on separate VPS
- Multiple backend replicas behind Nginx
- PgBouncer for connection pooling

### Phase 3 (Scale)
- Kubernetes cluster (k3s or managed)
- Multiple backend pods
- TimescaleDB multi-node
- Redis Cluster
- External load balancer

## Cost Estimate

| Component | Monthly Cost |
|-----------|-------------|
| VPS (Hetzner CX42) | €30.52 |
| Domain (arc-labs.com) | €1 |
| Vercel (Pro) | $20 |
| Monitoring (self-hosted) | $0 |
| Backups (S3/Wasabi) | $2 |
| **Total** | **~€55/month** |

## Disaster Recovery

### Backup Strategy
- **TimescaleDB**: WAL-G continuous archiving to S3/Wasabi
- **Application config**: GitOps (in Git)
- **Secrets**: 1Password / Bitwarden + GitHub Secrets
- **Docker images**: GHCR (immutable tags)

### Recovery Time Objectives
| Component | RTO | RPO |
|-----------|-----|-----|
| Backend | 15 min | 0 |
| Database | 1 hour | 5 min |
| Frontend | 5 min | 0 |

## Consequences

### Positive
- Cost-effective for MVP and growth
- Full control over infrastructure
- Standard tools (Docker, Nginx, PostgreSQL)
- No vendor lock-in
- Clear scaling path

### Negative
- Operational burden (OS updates, security patches)
- No managed Kubernetes (until Phase 3)
- Manual SSL certificate management (mitigated by certbot)
- Single point of failure (single VPS in Phase 1)

## Related ADRs
- ADR 004: Backend Framework
- ADR 007: Local Database
- ADR 008: Timeseries Storage
- ADR 011: Hardware Simulation