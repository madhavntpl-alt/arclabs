# ADR 002: Styling Approach

## Status
Accepted

## Context
We need a consistent, maintainable styling approach for the ARC LABS frontend that supports theming, responsive design, and rapid development.

## Decision
We will use **Tailwind CSS** with a **design token system** generated from the design-system skill, custom CSS variables for theming, and **CSS Modules** only for component-scoped animations.

## Rationale

### Tailwind CSS
- **Utility-first** eliminates context switching between HTML and CSS
- **Design tokens** map directly to Tailwind config (colors, spacing, typography)
- **Responsive design** built-in with mobile-first utilities
- **Dark mode** via `dark:` variant and CSS variables
- **Bundle size** - only used utilities included in production
- **Consistent with design-system skill output**

### CSS Variables for Theming
- **Dynamic theming** - switch themes without rebuild
- **CSS custom properties** for colors, spacing, shadows
- **Browser native** - no build step required for theme changes
- **Fallback values** for progressive enhancement

### Design Token System
- **Single source of truth** from design-system skill
- **Generated** `design-tokens.css` with all tokens
- **Semantic naming** - `--color-primary-500`, not `--color-blue-500`
- **Version controlled** - tokens in repo, regenerated on design changes

## Implementation

### Tailwind Config
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          // ... generated from tokens
        },
      },
      spacing: {
        // ... generated from tokens
      },
    },
  },
}
```

### CSS Variables (design-tokens.css)
```css
:root {
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --spacing-4: 1rem;
  --shadow-card: 0 0 0 1px rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.1);
  --radius-lg: 0.5rem;
  --transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dark {
  --color-primary-500: #60a5fa;
  --shadow-card: 0 0 0 1px rgba(255,255,255,0.05), 0 1px 3px 0 rgba(0,0,0,0.3);
}
```

### Component Usage
```tsx
// Good: Tailwind utilities
<div className="card p-6 hover:shadow-elevated transition-shadow duration-200">

// Good: CSS variables for dynamic values
<div style={{ boxShadow: `var(--shadow-${severity})` }}>

// Avoid: Inline styles for static values
<div style={{ padding: '1.5rem', backgroundColor: '#white' }}>
```

## Animations

### Tailwind Animations
- Use `animate-*` utilities for simple animations
- Custom keyframes in `animations.css` for complex sequences

### Motion/React for Complex Animations
- Layout animations (shared layout transitions)
- Gesture animations (drag, hover)
- Scroll-triggered animations
- Exit animations (AnimatePresence)

## Consequences

### Positive
- Rapid UI development with consistent styling
- Dynamic theming without rebuild
- Design-token-driven consistency
- Small production CSS bundle
- Mobile-first responsive by default

### Negative
- Learning curve for utility-first approach
- HTML can become verbose (mitigated by component abstraction)
- CSS variables not supported in IE11 (not supported anyway)

## Migration Strategy
1. Generate initial tokens from design-system skill
2. Configure Tailwind with token mappings
3. Create base components (Button, Card, Input) using tokens
4. Build pages using base components
4. Add dark mode support
5. Implement animations with Motion/React

## Related ADRs
- ADR 001: Frontend Framework
- ADR 003: State Management
- ADR 009: Authentication (theme preference storage)