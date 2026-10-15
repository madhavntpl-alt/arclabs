import { useOfflineQueue } from '../hooks/useOfflineQueue';

export function initializeOfflineQueue() {
  // This function is called during app initialization
  // The actual offline queue is managed by useOfflineQueue hook
  console.log('[OfflineQueue] Initialization complete');
}

export function registerOfflineAction(type: string, payload: any, options: { maxRetries?: number } = {}) {
  // This would be used by components to queue actions when offline
  // The actual queue is managed by useOfflineQueue hook
  console.log('[OfflineQueue] Action registered:', type, payload);
}

export default { initializeOfflineQueue, registerOfflineAction };