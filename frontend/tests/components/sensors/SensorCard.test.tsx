import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SensorCard } from '../../components/sensors/SensorCard';
import { SensorType } from '../../constants/sensor-types';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
  },
}));

vi.mock('clsx', () => ({
  clsx: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('SensorCard', () => {
  const baseProps = {
    sensorType: 'water_level' as SensorType,
    value: 45.2,
    unit: 'cm',
    status: 'normal' as const,
    threshold: { min: 10, max: 200 },
    label: 'Water Level',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderCard = (props = {}) => {
    return render(<SensorCard {...baseProps} {...props} />);
  };

  describe('Rendering', () => {
    it('renders sensor label', () => {
      renderCard();
      expect(screen.getByText('Water Level')).toBeInTheDocument();
    });

    it('renders value with correct formatting', () => {
      renderCard({ value: 45.2 });
      expect(screen.getByText('45.2')).toBeInTheDocument();
    });

    it('renders unit', () => {
      renderCard({ unit: 'cm' });
      expect(screen.getByText('cm')).toBeInTheDocument();
    });

    it('renders status indicator', () => {
      renderCard({ status: 'normal' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('renders trend indicator', () => {
      renderCard({ trend: 'up', trendValue: 2.5 });
      expect(screen.getByText('↑')).toBeInTheDocument();
      expect(screen.getByText('+2.5%')).toBeInTheDocument();
    });
  });

  describe('Status Colors', () => {
    it('shows green for normal status', () => {
      renderCard({ status: 'normal' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('shows amber for warning status', () => {
      renderCard({ status: 'warning' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-amber-500');
    });

    it('shows red for critical status', () => {
      renderCard({ status: 'critical' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-red-500');
    });

    it('shows gray for unknown status', () => {
      renderCard({ status: 'unknown' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-gray-400');
    });
  });

  describe('Threshold Visualization', () => {
    it('shows threshold bar', () => {
      renderCard({ threshold: { min: 10, max: 200 } });
      const thresholdBar = screen.getByTestId('threshold-bar');
      expect(thresholdBar).toBeInTheDocument();
    });

    it('shows min/max labels', () => {
      renderCard({ threshold: { min: 10, max: 200 } });
      expect(screen.getByText('Min: 10cm')).toBeInTheDocument();
      expect(screen.getByText('Max: 200cm')).toBeInTheDocument();
    });

    it('shows only max when no min', () => {
      renderCard({ threshold: { max: 1000 } });
      expect(screen.getByText('Max: 1000ppm')).toBeInTheDocument();
      expect(screen.queryByText('Min:')).not.toBeInTheDocument();
    });
  });

  describe('Sensor Type Specific', () => {
    it('renders water level icon', () => {
      renderCard({ sensorType: 'water_level' });
      expect(screen.getByTestId('water-icon')).toBeInTheDocument();
    });

    it('renders temperature icon', () => {
      renderCard({ sensorType: 'temperature' });
      expect(screen.getByTestId('thermometer-icon')).toBeInTheDocument();
    });

    it('renders humidity icon', () => {
      renderCard({ sensorType: 'humidity' });
      expect(screen.getByTestId('droplet-icon')).toBeInTheDocument();
    });

    it('renders gas icon', () => {
      renderCard({ sensorType: 'gas' });
      expect(screen.getByTestId('wind-icon')).toBeInTheDocument();
    });

    it('renders battery icon', () => {
      renderCard({ sensorType: 'battery' });
      expect(screen.getByTestId('battery-icon')).toBeInTheDocument();
    });
  end});

  describe('Color Coding', () => {
    it('uses blue for water level', () => {
      renderCard({ sensorType: 'water_level' });
      const iconContainer = screen.getByTestId('water-icon').parentElement;
      expect(iconContainer).toHaveStyle({ backgroundColor: 'rgb(59, 130, 246)' });
    });

    it('uses red for temperature', () => {
      renderCard({ sensorType: 'temperature' });
      const iconContainer = screen.getByTestId('thermometer-icon').parentElement;
      expect(iconContainer).toHaveStyle({ backgroundColor: 'rgb(239, 68, 68)' });
    });

    it('uses cyan for humidity', () => {
      renderCard({ sensorType: 'humidity' });
      expect(screen.getByTestId('droplet-icon').parentElement).toHaveStyle({ backgroundColor: 'rgb(6, 182, 212)' });
    });

    it('uses amber for gas', () => {
      renderCard({ sensorType: 'gas' });
      expect(screen.getByTestId('wind-icon').parentElement).toHaveStyle({ backgroundColor: 'rgb(245, 158, 11)' });
    });

    it('uses green for battery', () => {
      renderCard({ sensorType: 'battery' });
      expect(screen.getByTestId('battery-icon').parentElement).toHaveStyle({ backgroundColor: 'rgb(34, 197, 94)' });
    });
  });

  describe('Interactivity', () => {
    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      renderCard({ onClick });
      fireEvent.click(screen.getByTestId('sensor-card'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('has cursor pointer when onClick provided', () => {
      renderCard({ onClick: vi.fn() });
      expect(screen.getByTestId('sensor-card')).toHaveStyle({ cursor: 'pointer' });
    });

    it('does not have cursor pointer when no onClick', () => {
      renderCard();
      expect(screen.getByTestId('sensor-card')).not.toHaveStyle({ cursor: 'pointer' });
    });
  end});

  describe('Trend Indicators', () => {
    it('shows up arrow for up trend', () => {
      renderCard({ trend: 'up', trendValue: 5.2 });
      expect(screen.getByText('↑')).toBeInTheDocument();
      expect(screen.getByText('+5.2%')).toBeInTheDocument();
      expect(screen.getByText('↑')).toHaveClass('text-green-600');
    });

    it('shows down arrow for down trend', () => {
      renderCard({ trend: 'down', trendValue: 3.1 });
      expect(screen.getByText('↓')).toBeInTheDocument();
      expect(screen.getByText('-3.1%')).toBeInTheDocument();
      expect(screen.getByText('↓')).toHaveClass('text-red-600');
    });

    it('shows right arrow for stable', () => {
      renderCard({ trend: 'stable' });
      expect(screen.getByText('→')).toBeInTheDocument();
      expect(screen.getByText('0.0%')).toBeInTheDocument();
      expect(screen.getByText('→')).toHaveClass('text-gray-500');
    });
  end});

  describe('Null Value Handling', () => {
    it('shows -- when value is null', () => {
      renderCard({ value: null });
      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('shows -- when value is undefined', () => {
      renderCard({ value: undefined });
      expect(screen.getByText('--')).toBeInTheDocument();
    });
  end});

  describe('Animations', () => {
    it('has entrance animation', () => {
      renderCard();
      const card = screen.getByTestId('sensor-card');
      expect(card).toHaveClass('animate-in');
    });
  end});

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderCard({ label: 'Water Level Sensor' });
      const card = screen.getByTestId('sensor-card');
      expect(card).toHaveAttribute('aria-label', 'Water Level Sensor');
    });

    it('status indicator has aria-label', () => {
      renderCard({ status: 'warning' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveAttribute('aria-label', 'Sensor status: warning');
    });
  end});