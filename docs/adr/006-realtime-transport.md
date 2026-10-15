# ADR 006: Real-time Transport

## Status
Accepted

## Context
The ARC LABS frontend needs real-time updates for sensor readings, alerts, device status, and events. We need to choose a transport mechanism between the backend and frontend.

## Decision
We will use **WebSocket (native WebSocket API)** over a single persistent connection with automatic reconnection, heartbeat, and topic-based subscription.

## Rationale

### WebSocket
- **True bidirectional** - server can push without polling
- **Low latency** - no HTTP overhead after handshake
- **Native browser API** - no extra libraries needed
- **Single connection** - multiplex multiple message types
- **Binary support** - if needed for future optimization
- **Wide support** - all modern browsers, proxies

### Over Alternatives

#### Server-Sent Events (SSE)
- **Pros**: Simpler, automatic reconnection, HTTP/2 multiplexing
- **Cons**: Unidirectional (server→client only), no binary, Safari connection limits

#### Long Polling
- **Pros**: Works everywhere, simple
- **Cons**: High latency, high server load, connection overhead

#### WebRTC Data Channels
- **Pros**: P2P, low latency
- **Cons**: Complex signaling, NAT traversal, overkill

#### MQTT over WebSocket
- **Pros**: Pub/sub, QoS, retained messages
- **Cons**: Extra broker, more complexity, overkill for single device

## Architecture

```
┌─────────────┐                    ┌─────────────┐
│  FRONTEND   │                    │   BACKEND   │
│  (React)    │                    │  (FastAPI)  │
│             │                    │             │
│  ┌─────────┐│                    │  ┌─────────┐│
│  │useWebSocket│◄─────────────────►│Connection││
│  └─────────┘│   WebSocket        │  Manager  ││
│      │      │                    │      │    ││
│      ▼      │                    │      ▼    ││
│  ┌─────────┐│                    │  ┌─────────┐│
│  │Stores   ││                    │  Services ││
│  │(Zustand)││                    │  (Alert,  ││
│  └─────────┘│                    │  Auto, etc)│
│             │                    └─────────┘│
└─────────────┘                    └─────────────┘
```

## Connection Lifecycle

### Connection
1. Frontend creates `WebSocket` to `ws://host/ws/live`
2. Backend accepts, adds to `ConnectionManager`
3. Backend sends `device_status` and recent `sensor_readings`
4. Frontend subscribes to topics

### Heartbeat
- **Interval**: 30 seconds
- **Client → Server**: `{"type": "ping"}`
- **Server → Client**: `{"type": "heartbeat", "payload": {"timestamp": "...", "server_time": "..."}}`
- **Timeout**: 2 missed heartbeats = disconnect

### Reconnection
- **Strategy**: Exponential backoff (1s, 2s, 4s, 8s, max 30s)
- **Max attempts**: 10 (then show "Connection lost" UI)
- **Jitter**: ±500ms to prevent thundering herd
- **State recovery**: Re-subscribe to topics, request missed data

### Topics (Subscription)
```json
// Client → Server
{"type": "subscribe", "payload": {"topics": ["sensor_readings", "alerts", "events"]}}

// Server → Client (confirmation)
{"type": "subscribed", "payload": {"topics": ["sensor_readings", "alerts", "events"]}}
```

| Topic | Description | Frequency |
|-------|-------------|-----------|
| `sensor_readings` | Live sensor data | ~10 Hz |
| `alerts` | New/updated alerts | Event-driven |
| `events` | Event log entries | Event-driven |
| `device_status` | Device online/offline | 10s / event |

## Message Format

### Client → Server
```json
{"type": "ping", "payload": {}}
{"type": "subscribe", "payload": {"topics": ["sensor_readings", "alerts"]}}
{"type": "unsubscribe", "payload": {"topics": ["events"]}}
```

### Server → Client
```json
// Sensor Reading
{"type": "sensor_reading", "payload": {"sensor_type": "water_level", "value": 45.2, "unit": "cm", "timestamp": "2024-01-15T10:30:00Z", "status": "normal"}}

// Alert
{"type": "alert", "payload": {"id": "alert_1", "severity": "warning", "message": "Water level low", "sensor": "water_level", "value": 8.5, "threshold": 10, "timestamp": "2024-01-15T10:30:00Z"}}

// Event
{"type": "event", "payload": {"id": "evt_1", "event_type": "threshold_exceeded", "severity": "warning", "message": "Water level below minimum", "timestamp": "2024-01-15T10:30:00Z"}}

// Device Status
{"type": "device_status", "payload": {"device_id": "catalyst-mk1-001", "status": "online", "uptime_seconds": 3600, "free_heap": 1234}}

// Command Acknowledgment
{"type": "command_ack", "payload": {"command_id": "cmd_123", "success": true, "message": "Pump activated for 30s"}}

// Heartbeat
{"type": "heartbeat", "payload": {"timestamp": "2024-01-15T10:30:00Z", "server_time": "2024-01-15T10:30:00.001Z"}}
```

## Connection Management

### Frontend (React)
```typescript
// hooks/useWebSocket.ts
const { status, send, subscribe } = useWebSocket({
  url: WS_URL,
  onSensorReading: setSensorReadings,
  onAlert: addAlert,
  onEvent: addEvent,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
})
```

### Backend (FastAPI)
```python
# app/websocket/manager.py
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[WebSocket, Set[str]] = {}
        self.topic_subscriptions: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[websocket] = set()
        return websocket

    def disconnect(self, websocket):
        for topic in self.active_connections.get(websocket, set()):
            self.topic_subscriptions[topic].discard(websocket)
        self.active_connections.pop(websocket, None)

    async def subscribe(self, websocket, topics: list):
        for topic in topics:
            self.active_connections[websocket].add(topic)
            self.topic_subscriptions.setdefault(topic, set()).add(websocket)

    async def unsubscribe(self, websocket, topics: list):
        for topic in topics:
            self.active_connections[websocket].discard(topic)
            self.topic_subscriptions[topic].discard(websocket)

    async def broadcast(self, topic: str, message: Dict[str, Any]):
        for ws in self.topic_subscriptions.get(topic, set()):
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(ws)

    async def broadcast_to_all(self, message: Dict[str, Any]):
        for ws in list(self.active_connections.keys()):
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(ws)

    def get_connection_count(self) -> int:
        return len(self.active_connections)

    def get_topic_subscriber_count(self, topic: str) -> int:
        return len(self.topic_subscriptions.get(topic, set()))
```

## Scalability

### Single Device (Current)
- One backend instance
- Direct WebSocket to device
- Simple, sufficient for MVP

### Multiple Devices (Future)
- Redis pub/sub for cross-instance messaging
- Sticky sessions or shared connection state
- Device registry for routing

## Security

### Authentication (Future)
- JWT in connection handshake
- Token in query string or header
- Validate before `accept()`

### Authorization
- Topic-based permissions
- Device-scoped access

### Rate Limiting
- Max 100 messages/second per connection
- Max 10 subscriptions per connection

## Proxy/Load Balancer Config

### Nginx
```nginx
location /ws/live {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

### Cloudflare
- Enable "WebSockets" in Network tab
- Disable "Rocket Loader" for WebSocket paths

## Monitoring

### Metrics
- `websocket_connections_active` - gauge
- `websocket_messages_sent_total` - counter
- `websocket_messages_received_total` - counter
- `websocket_connection_duration_seconds` - histogram
- `websocket_reconnect_total` - counter

### Health Check
- `GET /health/websocket` returns connection count
- WebSocket ping/pong for liveness

## Consequences

### Positive
- True real-time with minimal latency
- Single connection for all real-time data
- Native browser API, no extra deps
- Automatic reconnection with backoff
- Topic-based filtering reduces bandwidth

### Negative
- More complex than polling
- Connection state management
- Proxy/load balancer config required
- Mobile browser background limitations

## Related ADRs
- ADR 003: State Management (WebSocket integration)
- ADR 004: Backend Framework (FastAPI WebSocket support)
- ADR 005: Serial Protocol (device communication)