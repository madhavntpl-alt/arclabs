const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  // Sensors
  async getSensors(): Promise<any[]> {
    return this.request('/api/v1/sensors');
  }

  async getSensor(sensorType: string): Promise<any> {
    return this.request(`/api/v1/sensors/${sensorType}`);
  }

  async getSensorHistory(
    sensorType: string,
    params: { start?: string; end?: string; interval?: string; limit?: number } = {}
  ): Promise<any> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value);
    });
    return this.request(`/api/v1/sensors/history?sensor_type=${sensorType}&${searchParams}`);
  }

  // Devices
  async getDevices(): Promise<any[]> {
    return this.request('/api/v1/devices');
  }

  async getDevice(deviceId: string): Promise<any> {
    return this.request(`/api/v1/devices/${deviceId}`);
  }

  // Control
  async controlPump(action: 'on' | 'off' | 'toggle', durationSeconds?: number): Promise<any> {
    return this.request('/api/v1/control/pump', {
      method: 'POST',
      body: JSON.stringify({ action, duration_seconds: durationSeconds }),
    });
  }

  async controlRelay(relay: number, state: boolean): Promise<any> {
    return this.request('/api/v1/control/relay', {
      method: 'POST',
      body: JSON.stringify({ relay, state }),
    });
  }

  async emergencyStop(): Promise<any> {
    return this.request('/api/v1/control/emergency_stop', {
      method: 'POST',
    });
  }

  // Configuration
  async getThresholds(): Promise<any> {
    return this.request('/api/v1/config/thresholds');
  }

  async updateThresholds(config: any): Promise<any> {
    return this.request('/api/v1/config/thresholds', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getCalibration(): Promise<any> {
    return this.request('/api/v1/config/calibration');
  }

  async updateCalibration(config: any): Promise<any> {
    return this.request('/api/v1/config/calibration', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // Automation Rules
  async getRules(params: { enabled?: boolean; limit?: number; offset?: number } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    return this.request(`/api/v1/rules?${searchParams}`);
  }

  async getRule(ruleId: string): Promise<any> {
    return this.request(`/api/v1/rules/${ruleId}`);
  }

  async createRule(rule: any): Promise<any> {
    return this.request('/api/v1/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  async updateRule(ruleId: string, rule: any): Promise<any> {
    return this.request(`/api/v1/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(rule),
    });
  }

  async deleteRule(ruleId: string): Promise<any> {
    return this.request(`/api/v1/rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  async testRule(ruleId: string): Promise<any> {
    return this.request(`/api/v1/rules/${ruleId}/test`, {
      method: 'POST',
    });
  }

  // Events
  async getEvents(params: {
    event_type?: string;
    severity?: string;
    device_id?: string;
    start?: string;
    end?: string;
    limit?: number;
    offset?: number;
    sort?: string;
    search?: string;
  } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    return this.request(`/api/v1/events?${searchParams}`);
  }

  async getEventStats(): Promise<any> {
    return this.request('/api/v1/events/stats');
  }

  // Health
  async getHealth(): Promise<any> {
    return this.request('/health');
  }

  async getSerialHealth(): Promise<any> {
    return this.request('/health/serial');
  }
}

export const api = new ApiClient(API_URL);

export default api;