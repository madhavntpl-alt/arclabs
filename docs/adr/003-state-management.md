# ADR 003: State Management Strategy

## Status
Accepted

## Context
The ARC LABS frontend needs to manage multiple types of state: real-time sensor data, user preferences, UI state, alerts, device status, and form data. We need a clear separation between server state and client state.

## Decision
We will use a **dual-state architecture**:
- **TanStack Query (React Query)** for server state (API data, caching, synchronization)
- **Zustand** for client state (UI state, user preferences, ephemeral data)
- **React Context** only for truly global providers (Theme, Connection)

## Rationale

### TanStack Query for Server State
- **Automatic caching** - deduplication, stale-while-revalidate
- **Background refetching** - fresh data without user action
- **Deduplication** - multiple components requesting same data = single request
- **Pagination/infinite scroll** built-in
- **Mutation handling** - optimistic updates, rollback, invalidation
- **DevTools** for debugging query state
- **WebSocket integration** for real-time updates

### Zustand for Client State
- **Minimal boilerplate** - no providers, no reducers
- **TypeScript first** - excellent inference
- **Middleware support** - persist, devtools, immer
- **Small bundle** (~1KB)
- **Flexible** - atoms, slices, or single store

### React Context (Minimal)
- Only for providers that don't change often
- ThemeProvider, ConnectionProvider
- Avoid for frequently changing data

## State Classification

### Server State (TanStack Query)
| Data | Query Key | Stale Time | Invalidation |
|------|-----------|------------|--------------|
| Sensor readings | `['sensors']` | 5s | WebSocket push |
| Sensor history | `['sensors', 'history', type]` | 30s | Manual |
| Device status | `['devices']` | 30s | WebSocket push |
| Thresholds | `['config', 'thresholds']` | 60s | Mutation |
| Calibration | `['config', 'calibration']` | 60s | Mutation |
| Automation rules | `['rules']` | 30s | Mutation |
| Events | `['events', filters]` | 30s | WebSocket push |
| Alerts | `['alerts']` | 10s | WebSocket push |

### Client State (Zustand)
| Store | Purpose | Persistence |
|-------|---------|-------------|
| `sensorStore` | Real-time sensor values (WebSocket) | No |
| `alertStore` | Active alerts, acknowledgment state | No |
| `deviceStore` | Selected device, device config | LocalStorage |
| `uiStore` | Theme, sidebar, modals, toasts | LocalStorage (theme) |
| `connectionStore` | WebSocket status, reconnection | No |

### Context Providers
| Provider | Purpose | Updates |
|----------|---------|---------|
| `ThemeProvider` | Dark/light/system theme | Rare |
| `ConnectionProvider` | WebSocket connection state | Frequent (but via Zustand) |

## Data Flow

### Real-time Sensor Data
```
WebSocket → ConnectionManager → onSensorReading → sensorStore (Zustand)
                              → queryClient.setQueryData(['sensors']) → React Query cache
```

### Alert Flow
```
WebSocket → onAlert → alertStore.addAlert() → UI notification
                    → alertStore.getActiveAlerts() → AlertPanel
```

### User Actions
```
User clicks "Start Pump" 
  → controlPump mutation (React Query) 
  → API call 
  → onCommandAck (WebSocket) → sensorStore update
  → queryClient.invalidateQueries(['sensors'])
```

## Implementation Patterns

### TanStack Query Setup
```tsx
// queryClient.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      gcTime: 5 * 60 * 1000,
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})
```

### Zustand Store Pattern
```ts
// store/sensorStore.ts
interface SensorState {
  readings: Map<SensorType, SensorReading>
  setSensorReadings: (readings: SensorReading[]) => void
  getReading: (type: SensorType) => SensorReading | undefined
  getAllReadings: () => SensorReading[]
  addToHistory: (reading: SensorReading) => void
  getHistory: (type: SensorType, limit?: number) => SensorReading[]
  clearHistory: (type?: SensorType) => void
  setMaxHistoryLength: (length: number) => void
}

export const useSensorStore = create<SensorState>()(
  devtools(
    (set) => ({
      readings: new Map(),
      setSensorReadings: (readings) => {
        const newReadings = new Map(state.readings)
        let latest: SensorReading | null = state.latestReading

        readingArray.forEach(reading => {
          newReadings.set(reading.sensor_type, reading)
          latest = reading
        })

        return { readings: newReadings, latestReading: latest }
      }),

      getReading: (type) => {
        return get().readings.get(type)
      },

      getAllReadings: () => {
        return Array.from(get().readings.values())
      },

      addToHistory: (reading) => {
        set(state => {
          const newHistory = new Map(state.history)
          const existing = newHistory.get(reading.sensor_type) || []
          const updated = [reading, ...existing].slice(0, state.maxHistoryLength)
          newHistory.set(reading.sensor_type, updated)
          return { history: newHistory }
        })
      },

      getHistory: (type, limit = 100) => {
        const history = get().history.get(type) || []
        return history.slice(0, limit)
      },

      clearHistory: (type) => {
        set(state => {
          if (type) {
            const newHistory = new Map(state.history)
            newHistory.delete(type)
            return { history: newHistory }
          }
          return { history: new Map() }
        })
      },

      setMaxHistoryLength: (length) => {
        set({ maxHistoryLength: length })
      },
    }),
    { name: 'sensor-store' }
  )
)
```

### WebSocket Integration
```tsx
// hooks/useSensorData.ts
export function useSensorData() {
  const { setSensorReadings } = useSensorStore()
  const queryClient = useQueryClient()

  const { setSensorReadings } = useSensorStore()
  const queryClient = useQueryClient()

  const { status: wsStatus, latency, messagesPerSecond } = useWebSocket({
    url: WS_URL,
    onSensorReading: (reading) => {
      setSensorReadings([reading])
      queryClient.setQueryData(['sensorReadings'], (old: SensorReading[] | undefined) => {
        if (!old) return [reading]
        const exists = old.find(r => r.sensor_type === reading.sensor_type)
        if (exists) {
          return old.map(r => r.sensor_type === reading.sensor_type ? reading : r)
        }
        return [...old, reading]
      })
    },
    onDeviceStatus: (status) => {
      setDeviceStatus(status)
    },
    onAlert: (alert) => {
      addAlert(alert)
    },
    onEvent: (event) => {
      addEvent(event)
    },
  })
```

## Consequences

### Positive
- Clear separation of concerns
- Optimal caching for server state
- Minimal re-renders for client state
- Real-time updates without polling
- Type-safe across all layers
- Easy testing (mock stores, mock queries)

### Negative
- Two state libraries to learn
- Potential confusion about where state lives
- WebSocket updates bypass React Query (intentional for real-time)

## Migration from Redux/Context
- Migrate server state to TanStack Query first
- Migrate UI state to Zustand
- Remove Redux/Context for data fetching
- Keep Context only for providers

## Related ADRs
- ADR 001: Frontend Framework
- ADR 002: Styling Approach
- ADR 006: Real-time Transport
- ADR 009: Authentication (user preferences)