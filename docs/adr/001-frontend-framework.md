# ADR 001: Frontend Framework Selection

## Status
Accepted

## Context
We need to choose a frontend framework for the ARC LABS monitoring dashboard. The dashboard requires real-time sensor visualization, alert management, control interfaces, and responsive design for desktop and mobile.

## Decision
We will use **React 18 with TypeScript, Vite, and Tailwind CSS**.

## Rationale

### React 18
- **Mature ecosystem** with extensive component libraries
- **Concurrent features** (Suspense, useTransition) for smooth UX
- **Strong TypeScript support** with excellent type inference
- **Large talent pool** for hiring and community support
- **React Query (TanStack Query)** for server state management
- **Zustand** for lightweight client state

### Vite
- **Fast HMR** for development velocity
- **Native ES modules** - no bundling in dev
- **Optimized production builds** with Rollup
- **TypeScript native support**
- **Plugin ecosystem** for Tailwind, React, etc.

### Tailwind CSS
- **Utility-first** - rapid UI development
- **Design tokens** map directly to Tailwind config (colors, spacing, typography)
- **Dark mode** via `dark:` variant and CSS variables
- **Responsive design** built-in with mobile-first utilities
- **Bundle size** - only used utilities included in production
- **Consistent with design-system skill output**

### TypeScript
- **Type safety** across frontend/backend boundary
- **Shared types** with backend via `@arc-labs/shared` package
- **IDE support** - autocomplete, refactoring
- **Catch bugs early** - compile-time error detection

## Alternatives Considered

### Vue 3 + Nuxt 3
- **Pros**: Excellent DX, Composition API, Vue Query
- **Cons**: Smaller ecosystem, fewer React-compatible component libraries

### SvelteKit
- **Pros**: Compiler-based, minimal runtime, great performance
- **Cons**: Smaller ecosystem, less mature tooling, fewer developers

### Next.js
- **Pros**: Full-stack, SSR/SSG, App Router
- **Cons**: Overkill for SPA dashboard, heavier bundle, Vercel lock-in

### SolidJS
- **Pros**: Fine-grained reactivity, no VDOM, fast
- **Cons**: Smaller ecosystem, less mature, fewer developers

## Consequences

### Positive
- Fast development with Vite HMR
- Type-safe API contracts with shared types
- Consistent design with Tailwind
- Real-time updates with React Query + WebSocket
- Mobile-responsive by default

### Negative
- Learning curve for team members new to React/Tailwind
- Bundle size larger than Svelte/Solid (mitigated by code splitting)
- React Query adds dependency (justified by features)

## Implementation Notes

- Use `@arc-labs/shared` for shared TypeScript types
- React Query for server state, Zustand for client state
- Motion/React for animations
- Recharts for sensor visualizations
- PWA support via Vite plugin
- ESLint + Prettier + Husky for code quality

## Related ADRs
- ADR 002: Styling Approach
- ADR 003: State Management
- ADR 006: Real-time Transport