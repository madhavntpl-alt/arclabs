import { create } from 'zustand';
import { Alert, AlertSeverity, AlertStatus } from '../types/alert';

interface AlertState {
  alerts: Alert[];
  activeCount: number;
  unacknowledgedCount: number;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  removeAlert: (id: string) => void;
  acknowledgeAlert: (id: string, acknowledgedBy: string) => void;
  resolveAlert: (id: string, resolvedBy: string) => void;
  dismissAlert: (id: string) => void;
  getAlerts: (filters?: { severity?: AlertSeverity; status?: AlertStatus; deviceId?: string }) => Alert[];
  clearResolved: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  activeCount: 0,
  unacknowledgedCount: 0,

  addAlert: (alert) => {
    set(state => {
      const exists = state.alerts.some(a => a.id === alert.id);
      if (exists) return state;

      const newAlerts = [alert, ...state.alerts].slice(0, 500);
      return {
        alerts: newAlerts,
        activeCount: newAlerts.filter(a => a.status === 'active').length,
        unacknowledgedCount: newAlerts.filter(a => a.status === 'active').length,
      };
    });
  },

  updateAlert: (id, updates) => {
    set(state => {
      const newAlerts = state.alerts.map(a => a.id === id ? { ...a, ...updates } : a);
      return {
        alerts: newAlerts,
        activeCount: newAlerts.filter(a => a.status === 'active').length,
        unacknowledgedCount: newAlerts.filter(a => a.status === 'active').length,
      };
    });
  },

  removeAlert: (id) => {
    set(state => {
      const newAlerts = state.alerts.filter(a => a.id !== id);
      return {
        alerts: newAlerts,
        activeCount: newAlerts.filter(a => a.status === 'active').length,
        unacknowledgedCount: newAlerts.filter(a => a.status === 'active').length,
      };
    });
  },

  acknowledgeAlert: (id, acknowledgedBy) => {
    get().updateAlert(id, {
      status: 'acknowledged',
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: acknowledgedBy,
    });
  },

  resolveAlert: (id, resolvedBy) => {
    get().updateAlert(id, {
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
    });
  },

  dismissAlert: (id) => {
    get().removeAlert(id);
  },

  getAlerts: (filters) => {
    const { alerts } = get();
    return alerts.filter(alert => {
      if (filters?.severity && alert.severity !== filters.severity) return false;
      if (filters?.status && alert.status !== filters.status) return false;
      if (filters?.deviceId && alert.device_id !== filters.deviceId) return false;
      return true;
    });
  },

  clearResolved: () => {
    set(state => {
      const newAlerts = state.alerts.filter(a => a.status !== 'resolved' && a.status !== 'suppressed');
      return {
        alerts: newAlerts,
        activeCount: newAlerts.filter(a => a.status === 'active').length,
        unacknowledgedCount: newAlerts.filter(a => a.status === 'active').length,
      };
    });
  },
}));

export default useAlertStore;