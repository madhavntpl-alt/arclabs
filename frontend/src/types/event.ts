import {
  EventType,
  EventLog,
  EventMetadata,
  EventQuery,
  EventStats,
  PaginatedEvents,
  createEvent,
  getEventTypeLabel,
  getEventTypeColor,
  EVENT_TYPES,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_COLORS,
} from '@arc-labs/shared';

// Re-export shared types
export type {
  EventType,
  EventLog,
  EventMetadata,
  EventQuery,
  EventStats,
  PaginatedEvents,
};

export { EVENT_TYPES, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS };
export { createEvent, getEventTypeLabel, getEventTypeColor };

// Frontend-specific extensions
export interface EventLogProps {
  events: EventLog[];
  onFilterChange: (filters: EventQuery) => void;
  onDelete?: (id: string) => void;
}