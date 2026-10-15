import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Dashboard } from '../../pages/Dashboard';
import { useSensorStore } from '../../store/sensorStore';
import { useDeviceStore } from '../../store/deviceStore';
import { useUIStore } from '../../store/uiStore';
import { SensorType } from '../../constants/sensor-types';

// Mock stores
vi.mock('../../store/sensorStore', () => ({
  useSensorStore: vi.fn(),
}));

vi.mock('../../store/deviceStore', () => ({
  useDeviceStore: vi.fn(),
}));

vi.mock('../../store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

// Mock components
vi.mock('../../components/sensors/WaterLevelCard', () => ({
  WaterLevelCard: ({ value, status, threshold, trend, trendValue, onClick }: any) => (
    <div data-testid="water-level-card" data-value={value} data-status={status}>
      Water Level: {value} cm
    </div>
  ),
}));

vi.mock('../../components/sensors/TempHumidityCard', () => ({
  TempHumidityCard: ({ temperature, humidity, tempStatus, humidityStatus, tempThreshold, humidityThreshold, onClick }: any) => (
    <div data-testid="temp-humidity-card">
      Temp: {temperature}°C, Humidity: {humidity}%
    </div>
  ),
}));

vi.mock('../../components/sensors/GasCard', () => ({
  GasCard: ({ value, status, threshold, trend, trendValue, onClick }: any) => (
    <div data-testid="gas-card" data-value={value}>
      Gas: {value} ppm
    </div>
  ),
}));

vi.mock('../../components/sensors/BatteryCard', () => ({
  BatteryCard: ({ value, status, threshold, charging, onClick }: any) => (
    <div data-testid="battery-card" data-value={value}>
      Battery: {value}V
    </div>
  ),
}));

vi.mock('../../components/graphs/SensorGraph', () => ({
  SensorGraph: ({ data, sensorType, unit, height, showArea, showMinMax, threshold }: any) => (
    <div data-testid="sensor-graph" data-sensor-type={sensorType} data-height={height}>
      Graph for {sensorType}
    </div>
  ),
}));

vi.mock('../../components/graphs/TimeRangeSelector', () => ({
  TimeRangeSelector: ({ value, onChange, className }: any) => (
    <select data-testid="time-range-selector" value={value} onChange={e => onChange(e.target.value, '1m')} className={className}>
      <option value="1h">1 Hour</option>
      <option value="6h">6 Hours</option>
      <option value="24h">24 Hours</option>
      <option value="7d">7 Days</option>
      <option value="30d">30 Days</option>
    </select>
  ),
}));

import { SensorType, SENSOR_TYPE_INFO } from '../../constants/sensor-types';

describe('Dashboard', () => {
  const mockUseSensorStore = vi.mocked(require('../../store/sensorStore').useSensorStore);
  const mockUseDeviceStore = vi.mocked(require('../../store/deviceStore').useDeviceStore);
  const mockUseUIStore = vi.mocked(require('../../store/uiStore').useUIStore);

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseSensorStore.mockReturnValue({
      readings: new Map(),
      getReading: vi.fn((type: SensorType) => {
        const readings: Record<SensorType, any> = {
          water_level: { sensor_type: 'water_level', value: 45.2, unit: 'cm', timestamp: new Date().toISOString(), status: 'normal', thresholds: { min: 10, max: 200 } },
          temperature: { sensor_type: 'temperature', value: 23.5, unit: '°C', timestamp: new Date().toISOString(), status: 'normal', thresholds: { min: 0, max: 50 } },
          humidity: { sensor_type: 'humidity', value: 65, unit: '%', timestamp: new Date().toISOString(), status: 'normal', thresholds: { min: 20, max: 80 } },
          gas: { sensor_type: 'gas', value: 450, unit: 'ppm', timestamp: new Date().toISOString(), status: 'normal', thresholds: { max: 1000 } },
          battery: { sensor_type: 'battery', value: 3.85, unit: 'V', timestamp: new Date().toISOString(), status: 'normal', thresholds: { min: 3.3, max: 4.2 } },
        };
        return readings[type];
      }),
      getHistory: vi.fn((type: SensorType) => [
        { timestamp: new Date().toISOString(), min: 40, max: 50, avg: 45, count: 10 },
      ]),
    });

    mockUseDeviceStore.mockReturnValue({
      devices: new Map([
        ['device_1', {
          id: 'device_1',
          name: 'Catalyst Mk1 #1',
          type: 'catalyst_mk1',
          status: 'online',
          last_seen: new Date().toISOString(),
          firmware_version: '1.0.0',
          hardware_version: '1.0',
          sensors: ['water_level', 'temperature', 'humidity', 'gas', 'battery'],
          actuators: ['pump', 'valve'],
          config: {},
          metrics: { uptime_seconds: 3600, free_heap: 1234, messages_received: 18000, messages_sent: 150, errors: 0 },
        }],
      ]),
      activeDevice: {
        id: 'device_1',
        name: 'Catalyst Mk1 #1',
        type: 'catalyst_mk1',
        status: 'online',
        last_seen: new Date().toISOString(),
        firmware_version: '1.0.0',
        hardware_version: '1.0',
        sensors: ['water_level', 'temperature', 'humidity', 'gas', 'battery'],
        actuators: ['pump', 'valve'],
        config: {},
        metrics: { uptime_seconds: 3600, free_heap: 1234, messages_received: 18000, messages_sent: 150, errors: 0 },
      },
      getDevice: vi.fn(),
      getAllDevices: vi.fn(),
      getOnlineDevices: vi.fn(),
      setActiveDevice: vi.fn(),
      setSelectedDeviceId: vi.fn(),
    });

    mockUseUIStore.mockReturnValue({
      sidebarOpen: true,
      sidebarCollapsed: false,
      toggleSidebar: vi.fn(),
      setSidebarOpen: vi.fn(),
      setSidebarCollapsed: vi.fn(),
    });
  end});

  const renderDashboard = () => {
    return render(<Dashboard />);
  end});

  describe('Rendering', () => {
    it('renders dashboard title', () => {
      renderDashboard();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Real-time monitoring overview')).toBeInTheDocument();
    end});

    it('renders time range selector', () => {
      renderDashboard();
      expect(screen.getByTestId('time-range-selector')).toBeInTheDocument();
    end});

    it('renders all sensor cards', () => {
      renderDashboard();
      expect(screen.getByTestId('water-level-card')).toBeInTheDocument();
      expect(screen.getByTestId('temp-humidity-card')).toBeInTheDocument();
      expect(screen.getByTestId('gas-card')).toBeInTheDocument();
      expect(screen.getByTestId('battery-card')).toBeInTheDocument();
    end});

    it('renders sensor graphs', () => {
      renderDashboard();
      expect(screen.getByTestId('sensor-graph')).toHaveLength(5);
    end});

    it('renders device status when device is active', () => {
      renderDashboard();
      expect(screen.getByText('Catalyst Mk1 #1')).toBeInTheDocument();
      expect(screen.getByText('catalyst_mk1 • 1.0.0')).toBeInTheDocument();
    end});
  end});

  describe('Sensor Cards', () => {
    it('displays water level card with correct value', () => {
      renderDashboard();
      expect(screen.getByText('45.2')).toBeInTheDocument();
      expect(screen.getByText('cm')).toBeInTheDocument();
    end});

    it('displays temperature and humidity', () => {
      renderDashboard();
      expect(screen.getByText('23.5')).toBeInTheDocument();
      expect(screen.getByText('°C')).toBeInTheDocument();
      expect(screen.getByText('65')).toBeInTheDocument();
      expect(screen.getByText('%')).toBeInTheDocument();
    end});

    it('displays gas level', () => {
      renderDashboard();
      expect(screen.getByText('450')).toBeInTheDocument();
      expect(screen.getByText('ppm')).toBeInTheDocument();
    end});

    it('displays battery voltage', () => {
      renderDashboard();
      expect(screen.getByText('3.85')).toBeInTheDocument();
      expect(screen.getByText('V')).toBeInTheDocument();
    end});
  end});

  describe('Graphs', () => {
    it('renders water level graph', () => {
      renderDashboard();
      const waterGraph = screen.getByTestId('sensor-graph').closest('[data-sensor-type="water_level"]');
      expect(waterGraph).toBeInTheDocument();
    end});

    it('renders temperature graph', () => {
      renderDashboard();
      const tempGraph = screen.getByTestId('sensor-graph').closest('[data-sensor-type="temperature"]');
      expect(tempGraph).toBeInTheDocument();
    end});

    it('renders humidity graph', () => {
      renderDashboard();
      const humidityGraph = screen.getByTestId('sensor-graph').closest('[data-sensor-type="humidity"]');
      expect(humidityGraph).toBeInTheDocument();
    end});

    it('renders gas graph', () => {
      renderDashboard();
      const gasGraph = screen.getByTestId('sensor-graph').closest('[data-sensor-type="gas"]');
      expect(gasGraph).toBeInTheDocument();
    end});

    it('renders battery graph', () => {
      renderDashboard();
      const batteryGraph = screen.getByTestId('sensor-graph').closest('[data-sensor-type="battery"]');
      expect(batteryGraph).toBeInTheDocument();
    end});
  end});

  describe('Time Range Selector', () => {
    it('updates time range when changed', () => {
      renderDashboard();
      const selector = screen.getByTestId('time-range-selector');
      fireEvent.change(selector, { target: { value: '6h' } });
      expect(screen.getByTestId('time-range-selector')).toHaveValue('6h');
    end});

    it('updates chart interval when time range changes', () => {
      renderDashboard();
      const selector = screen.getByTestId('time-range-selector');
      fireEvent.change(selector, { target: { value: '6h' } });
      // The interval should be updated via onChange callback
    end});
  end});

  describe('Device Status', () => {
    it('shows device online status', () => {
      renderDashboard();
      expect(screen.getByText('Online')).toBeInTheDocument();
    end});

    it('shows uptime', () => {
      renderDashboard();
      expect(screen.getByText(/Uptime:/)).toBeInTheDocument();
    end});

    it('shows free heap', () => {
      renderDashboard();
      expect(screen.getByText(/Free Heap:/)).toBeInTheDocument();
    end});

    it('shows firmware version', () => {
      renderDashboard();
      expect(screen.getByText('Firmware 1.0.0')).toBeInTheDocument();
    end});
  end});

  describe('Animations', () => {
    it('animates sensor cards on mount', () => {
      renderDashboard();
      const cards = screen.getAllByTestId(/card$/i);
      cards.forEach(card => {
        expect(card).toHaveClass('animate-in');
      });
    end});

    it('animates graphs on mount', () => {
      renderDashboard();
      const graphs = screen.getAllByTestId('sensor-graph');
      graphs.forEach(graph => {
        expect(graph).toHaveClass('animate-in');
      });
    end});
  end});

  describe('Responsive Layout', () => {
    it('shows 5 columns on large screens', () => {
      renderDashboard();
      const grid = screen.getByTestId('sensor-grid');
      expect(grid).toHaveClass('lg:grid-cols-5');
    end});

    it('shows 2 columns on small screens', () => {
      renderDashboard();
      const grid = screen.getByTestId('sensor-grid');
      expect(grid).toHaveClass('sm:grid-cols-2');
    end});

    it('shows 1 column on mobile', () => {
      renderDashboard();
      const grid = screen.getByTestId('sensor-grid');
      expect(grid).toHaveClass('grid-cols-1');
    end});
  end});

  describe('Error Handling', () => {
    it('handles missing sensor data gracefully', () => {
      vi.mocked(require('../../store/sensorStore').useSensorStore).mockReturnValue({
        readings: new Map(),
        getReading: vi.fn().mockReturnValue(undefined),
        getHistory: vi.fn().mockReturnValue([]),
      });

      renderDashboard();
      expect(screen.getByText('--')).toBeInTheDocument();
    end});

    it('handles missing device gracefully', () => {
      vi.mocked(require('../../store/deviceStore').useDeviceStore).mockReturnValue({
        devices: new Map(),
        activeDevice: null,
        getDevice: vi.fn(),
        getAllDevices: vi.fn(),
        getOnlineDevices: vi.fn(),
        setActiveDevice: vi.fn(),
        setSelectedDeviceId: vi.fn(),
      });

      renderDashboard();
      expect(screen.queryByText('Catalyst Mk1 #1')).not.toBeInTheDocument();
    end});
  end});

  describe('Sidebar Integration', () => {
    it('applies correct margin when sidebar is expanded', () => {
      renderDashboard();
      const main = screen.getByRole('main');
      expect(main).toHaveClass('lg:ml-64');
    end});

    it('applies correct margin when sidebar is collapsed', () => {
      vi.mocked(require('../../store/uiStore').useUIStore).mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: true,
        toggleSidebar: vi.fn(),
        setSidebarOpen: vi.fn(),
        setSidebarCollapsed: vi.fn(),
      });

      renderDashboard();
      const main = screen.getByRole('main');
      expect(main).toHaveClass('lg:ml-16');
    end});
  end});