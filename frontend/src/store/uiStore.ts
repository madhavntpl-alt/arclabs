import { create } from 'zustand';
import { Alert } from '../types/alert';
import { EventLog } from '../types/event';

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Modals
  modals: Record<string, boolean>;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Notifications
  notifications: Alert[];
  addNotification: (notification: Omit<Alert, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Connection
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error' | 'mock';
  setConnectionStatus: (status: UIState['connectionStatus']) => void;
  reconnectAttempts: number;
  setReconnectAttempts: (attempts: number) => void;
  lastConnected: string | null;
  setLastConnected: (timestamp: string | null) => void;

  // Events
  events: EventLog[];
  addEvent: (event: EventLog) => void;
  setEvents: (events: EventLog[]) => void;

  // Serial
  serialStatus: Record<string, any>;
  setSerialStatus: (status: Record<string, any>) => void;

  // Loading
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Toasts
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Theme
  theme: 'system',
  setTheme: (theme) => set({ theme }),

  // Sidebar
  sidebarOpen: true,
  sidebarCollapsed: false,
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Modals
  modals: {},
  openModal: (id) => set(state => ({ modals: { ...state.modals, [id]: true } })),
  closeModal: (id) => set(state => {
    const newModals = { ...state.modals };
    delete newModals[id];
    return { modals: newModals };
  }),
  closeAllModals: () => set({ modals: {} }),

  // Notifications
  notifications: [],
  addNotification: (notification) => set(state => ({
    notifications: [
      { ...notification, id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, timestamp: new Date().toISOString() },
      ...state.notifications,
    ].slice(0, 50)
  })),
  removeNotification: (id) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  markNotificationRead: (id) => set(state => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  clearAllNotifications: () => set({ notifications: [] }),

  // Connection
  connectionStatus: 'disconnected',
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  reconnectAttempts: 0,
  setReconnectAttempts: (attempts) => set({ reconnectAttempts: attempts }),
  lastConnected: null,
  setLastConnected: (timestamp) => set({ lastConnected: timestamp }),

  // Events
  events: [],
  addEvent: (event) => set(state => ({
    events: [event, ...state.events].slice(0, 1000)
  })),
  setEvents: (events) => set({ events }),

  // Serial
  serialStatus: {},
  setSerialStatus: (status) => set({ serialStatus: status }),

  // Loading
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  // Toasts
  toasts: [],
  addToast: (toast) => set(state => ({
    toasts: [
      { ...toast, id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` },
      ...state.toasts,
    ].slice(0, 10)
  })),
  removeToast: (id) => set(state => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
}));

export default useUIStore;