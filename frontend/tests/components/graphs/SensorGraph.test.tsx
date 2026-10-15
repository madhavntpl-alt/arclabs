import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SensorGraph } from '../../components/graphs/SensorGraph';
import { SensorType } from '../../constants/sensor-types';

// Mock Recharts
vi.mock('recharts', () => ({
  LineChart: ({ children, data, width, height, margin }: any) => (
    <div data-testid="line-chart" data-width={width} data-height={height}>
      {children}
    </div>
  ),
  AreaChart: ({ children, data, width, height, margin }: any) => (
    <div data-testid="area-chart" data-width={width} data-height={height}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke, strokeWidth, dot, activeDot, isAnimationActive, animationDuration, animationEasing, name }: any) => (
    <div data-testid={`line-${dataKey}`} data-stroke={stroke} data-name={name} />
  ),
  Area: ({ dataKey, fill, stroke, strokeWidth, isAnimationActive, animationDuration, animationEasing }: any) => (
    <div data-testid={`area-${dataKey}`} data-fill={fill} />
  ),
  Bar: ({ dataKey, fill, strokeWidth, isAnimationActive, animationDuration, animationEasing, name }: any) => (
    <div data-testid={`bar-${dataKey}`} data-name={name} />
  ),
  XAxis: ({ dataKey, tick, axisLine, tickLine, interval }: any) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),
  YAxis: ({ tick, axisLine, tickLine, domain, orientation }: any) => (
    <div data-testid="y-axis" />
  ),
  CartesianGrid: ({ strokeDasharray, stroke, vertical }: any) => (
    <div data-testid="cartesian-grid" data-vertical={vertical} />
  ),
  Tooltip: ({ content, formatter }: any) => (
    <div data-testid="tooltip" data-formatter={!!formatter} />
  ),
  Legend: ({ }: any) => <div data-testid="legend" />,
  ResponsiveContainer: ({ children, width, height }: any) => (
    <div style={{ width, height }} data-testid="responsive-container">
      {children}
    </div>
  ),
  ComposedChart: ({ children, data, margin }: any) => (
    <div data-testid="composed-chart">{children}</div>
  ),
}));

import { SensorType, SENSOR_TYPE_INFO } from '../../constants/sensor-types';

describe('SensorGraph', () => {
  const baseProps = {
    data: [
      { timestamp: '2024-01-15T10:00:00Z', value: 45.2 },
      { timestamp: '2024-01-15T10:01:00Z', value: 45.5 },
      { timestamp: '2024-01-15T10:02:00Z', value: 44.8 },
    ],
    sensorType: 'water_level' as SensorType,
    unit: 'cm',
    height: 300,
    showArea: true,
    showMinMax: false,
    threshold: { min: 10, max: 200 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderGraph = (props = {}) => {
    return render(<SensorGraph {...baseProps} {...props} />);
  };

  describe('Rendering', () => {
    it('renders chart container', () => {
      renderGraph();
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('renders chart title with sensor icon', () => {
      renderGraph({ sensorType: 'water_level' });
      expect(screen.getByText('Water Level (cm)')).toBeInTheDocument();
      expect(screen.getByTestId('sensor-icon')).toBeInTheDocument();
    });

    it('renders sensor type label', () => {
      renderGraph({ sensorType: 'temperature' });
      expect(screen.getByText('Temperature (°C)')).toBeInTheDocument();
    });

    it('renders threshold indicators when provided', () => {
      renderGraph({ threshold: { min: 10, max: 200 } });
      expect(screen.getByText('Min: 10')).toBeInTheDocument();
      expect(screen.getByText('Max: 200')).toBeInTheDocument();
    });
  });

  describe('Chart Types', () => {
    it('renders AreaChart when showArea is true', () => {
      renderGraph({ showArea: true });
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('renders ComposedChart when showArea is false', () => {
      renderGraph({ showArea: false });
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('renders Line for sensor data', () => {
      renderGraph({ showArea: false });
      expect(screen.getByTestId('line-value')).toBeInTheDocument();
    });

    it('renders Area for sensor data', () => {
      renderGraph({ showArea: true });
      expect(screen.getByTestId('area-value')).toBeInTheDocument();
    });

    it('renders min/max lines when showMinMax is true', () => {
      renderGraph({ showMinMax: true, data: baseProps.data.map(d => ({ ...d, min: d.value - 2, max: d.value + 2, avg: d.value })) });
      expect(screen.getByTestId('line-max')).toBeInTheDocument();
      expect(screen.getByTestId('line-min')).toBeInTheDocument();
      expect(screen.getByTestId('line-avg')).toBeInTheDocument();
    });
  end});

  describe('Threshold Visualization', () => {
    it('renders min threshold area', () => {
      renderGraph({ threshold: { min: 10 } });
      expect(screen.getByTestId('threshold-min')).toBeInTheDocument();
    });

    it('renders max threshold area', () => {
      renderGraph({ threshold: { max: 200 } });
      expect(screen.getByTestId('threshold-max')).toBeInTheDocument();
    });

    it('renders both min and max threshold areas', () => {
      renderGraph({ threshold: { min: 10, max: 200 } });
      expect(screen.getByTestId('threshold-min')).toBeInTheDocument();
      expect(screen.getByTestId('threshold-max')).toBeInTheDocument();
    });

    it('uses correct colors for thresholds', () => {
      renderGraph({ threshold: { min: 10, max: 200 } });
      const minArea = screen.getByTestId('threshold-min');
      const maxArea = screen.getByTestId('threshold-max');
      expect(minArea).toHaveStyle({ fill: 'rgba(245, 158, 11, 0.2)' });
      expect(maxArea).toHaveStyle({ fill: 'rgba(239, 68, 68, 0.2)' });
    end});
  end});

  describe('Animation', () => {
    it('animates when animate is true', () => {
      renderGraph({ animate: true });
      const chart = screen.getByTestId('area-chart');
      expect(chart).toHaveAttribute('data-animation-duration', '1000');
    end});

    it('does not animate when animate is false', () => {
      renderGraph({ animate: false });
      const chart = screen.getByTestId('area-chart');
      expect(chart).not.toHaveAttribute('data-animation-duration');
    end});
  });

  describe('Responsive Container', () => {
    it('uses ResponsiveContainer with correct dimensions', () => {
      renderGraph({ height: 400 });
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveAttribute('style', expect.stringContaining('width'));
      expect(container).toHaveAttribute('style', expect.stringContaining('height'));
    end});
  end});

  describe('Tooltip', () => {
    it('renders custom tooltip', () => {
      renderGraph();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('displays sensor value in tooltip', () => {
      renderGraph();
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute('data-formatter', 'true');
    end});
  end});

  describe('Legend', () => {
    it('shows legend when multiple data series', () => {
      renderGraph({
        showMinMax: true,
        data: baseProps.data.map(d => ({ ...d, min: d.value - 2, max: d.value + 2, avg: d.value })),
      });
      expect(screen.getByTestId('legend')).toBeInTheDocument();
    end});

    it('hides legend when single series', () => {
      renderGraph({ showMinMax: false });
      expect(screen.queryByTestId('legend')).not.toBeInTheDocument();
    end});
  end});

  describe('Data Processing', () => {
    it('formats timestamps correctly', () => {
      renderGraph({
        data: [{ timestamp: '2024-01-15T10:30:00Z', value: 45.2 }],
      });
      // The XAxis should format the timestamp
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    end});

    it('handles empty data', () => {
      renderGraph({ data: [] });
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    end});

    it('handles missing data points', () => {
      renderGraph({
        data: [
          { timestamp: '2024-01-15T10:00:00Z', value: 45.2 },
          { timestamp: '2024-01-15T10:02:00Z', value: null },
          { timestamp: '2024-01-15T10:03:00Z', value: 46.1 },
        ],
      });
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    end});
  end});

  describe('Threshold Lines', () => {
    it('renders min threshold line', () => {
      renderGraph({ threshold: { min: 10 } });
      expect(screen.getByTestId('threshold-min')).toBeInTheDocument();
    end});

    it('renders max threshold line', () => {
      renderGraph({ threshold: { max: 200 } });
      expect(screen.getByTestId('threshold-max')).toBeInTheDocument();
    end});

    it('renders threshold line with correct style', () => {
      renderGraph({ threshold: { min: 10, max: 200 } });
      const minLine = screen.getByTestId('threshold-min');
      expect(minLine).toHaveAttribute('stroke', '#f59e0b');
      expect(minLine).toHaveAttribute('stroke-dasharray', '5 5');
    end});
  end});

  describe('Custom Tooltip', () => {
    it('renders custom tooltip with sensor info', () => {
      renderGraph({ sensorType: 'temperature' });
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toBeInTheDocument();
    end});

    it('displays min/max/avg in tooltip when available', () => {
      renderGraph({
        data: [
          { timestamp: '2024-01-15T10:00:00Z', value: 20, min: 19, max: 21, avg: 20.5 },
        ],
      });
      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveTextContent('Min: 19');
      expect(tooltip).toHaveTextContent('Max: 21');
      expect(tooltip).toHaveTextContent('Avg: 20.5');
    end});
  end});

  describe('Animation', () => {
    it('animates area drawing on mount', () => {
      renderGraph({ animate: true });
      const area = screen.getByTestId('area-value');
      expect(area).toHaveAttribute('data-animation-duration', '1000');
    end});

    it('animates line drawing on mount', () => {
      renderGraph({ showArea: false, animate: true });
      const line = screen.getByTestId('line-value');
      expect(line).toHaveAttribute('data-animation-duration', '1000');
    end});
  end});

  describe('Responsive', () => {
    it('uses ResponsiveContainer', () => {
      renderGraph();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    end});

    it('passes width and height to ResponsiveContainer', () => {
      renderGraph({ height: 400 });
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '400px' });
    end});
  end});

  describe('Sensor Types', () => {
    it('uses correct color for water level', () => {
      renderGraph({ sensorType: 'water_level' });
      const line = screen.getByTestId('line-value');
      expect(line).toHaveAttribute('stroke', '#00D4AA');
    end});

    it('uses correct color for temperature', () => {
      renderGraph({ sensorType: 'temperature' });
      const line = screen.getByTestId('line-value');
      expect(line).toHaveAttribute('stroke', '#FF6B35');
    end});

    it('uses correct color for humidity', () => {
      renderGraph({ sensorType: 'humidity' });
      const line = screen.getByTestId('line-value');
      expect(line).toHaveAttribute('stroke', '#06b6d4');
    end});

    it('uses correct color for gas', () => {
      renderGraph({ sensorType: 'gas' });
      const line = screen.getByTestId('line-value');
      expect(line).toHaveAttribute('stroke', '#FFD600');
    end});

    it('uses correct color for battery', () => {
      renderGraph({ sensorType: 'battery' });
      const line = screen.getByTestId('line-value');
      expect(line).toHaveAttribute('stroke', '#22c55e');
    end});
  end});