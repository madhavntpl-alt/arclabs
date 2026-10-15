import { useState, useEffect, useCallback } from 'react';

interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

const DB_NAME = 'arc-labs-offline';
const STORE_NAME = 'action-queue';
const DB_VERSION = 1;

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB');
    };

    request.onsuccess = () => {
      setDb(request.result);
      loadQueue();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadQueue = useCallback(async () => {
    if (!db) return;

    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      setQueue(request.result);
    };
  }, [db]);

  const addToQueue = useCallback(async (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>) => {
    if (!db) return;

    const queuedAction: QueuedAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.add(queuedAction);

    transaction.oncomplete = () => {
      setQueue(prev => [...prev, queuedAction]);
    };

    if (!isOnline) {
      console.log('[OfflineQueue] Action queued for later:', queuedAction);
    } else {
      processQueue();
    }
  }, [db, isOnline]);

  const removeFromQueue = useCallback(async (id: string) => {
    if (!db) return;

    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);

    transaction.oncomplete = () => {
      setQueue(prev => prev.filter(a => a.id !== id));
    };
  }, [db]);

  const processQueue = useCallback(async () => {
    if (!isOnline || queue.length === 0) return;

    for (const action of queue) {
      try {
        // Send the action to the server
        const response = await fetch('/api/offline/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action),
        });

        if (response.ok) {
          await removeFromQueue(action.id);
        } else if (action.retries >= action.maxRetries) {
          console.error('[OfflineQueue] Max retries reached for:', action.id);
          await removeFromQueue(action.id);
        } else {
          // Increment retries
          const transaction = db?.transaction(STORE_NAME, 'readwrite');
          if (transaction) {
            const store = transaction.objectStore(STORE_NAME);
            const getRequest = store.get(action.id);
            getRequest.onsuccess = () => {
              const updated = { ...getRequest.result, retries: getRequest.result.retries + 1 };
              store.put(updated);
            };
          }
        }
      } catch (error) {
        console.error('[OfflineQueue] Failed to process action:', action.id, error);
      }
    }
  }, [isOnline, queue, db, removeFromQueue]);

  const clearQueue = useCallback(async () => {
    if (!db) return;

    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();

    transaction.oncomplete = () => {
      setQueue([]);
    };
  }, [db]);

  return {
    isOnline,
    queue,
    queueLength: queue.length,
    addToQueue,
    removeFromQueue,
    processQueue,
    clearQueue,
  };
}

export default useOfflineQueue;