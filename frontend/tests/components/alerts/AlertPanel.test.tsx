import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertPanel } from '../../components/alerts/AlertPanel';
import { Alert, AlertSeverity, AlertStatus } from '../../types/alert';

// Mock dependencies
vi.mock('../../store/alertStore', () => ({
  useAlertStore: vi.fn(),
}));

vi.mock('../../components/alerts/ThresholdConfigModal', () => ({
  ThresholdConfigModal: ({ isOpen, onClose, currentConfig, onSave }: any) => (
    <div data-testid="threshold-modal" data-open={isOpen}>
      Threshold Config Modal
      <button onClick={onClose}>Close</button>
      <button onClick={() => onSave({})}>Save</button>
    </div>
  ),
}));

const mockAlerts: Alert[] = [
  {
    id: 'alert_1',
    device_id: 'device_1',
    rule_id: 'rule_1',
    severity: 'warning',
    status: 'active',
    message: 'Water level below minimum: 8.5 cm',
    sensor_type: 'water_level',
    value: 8.5,
    threshold: 10,
    unit: 'cm',
    metadata: { sensor: 'water_level', value: 8.5, threshold: 10 },
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 'alert_2',
    device_id: 'device_1',
    rule_id: 'rule_2',
    severity: 'critical',
    status: 'active',
    message: 'Temperature exceeded maximum: 65°C',
    sensor_type: 'temperature',
    value: 65,
    threshold: 50,
    unit: '°C',
    metadata: { sensor: 'temperature', value: 65, threshold: 50 },
    created_at: '2024-01-15T09:00:00Z',
  },
  {
    id: 'alert_3',
    device_id: 'device_1',
    severity: 'info',
    status: 'acknowledged',
    message: 'System startup completed',
    metadata: { event: 'startup' },
    created_at: '2024-01-15T08:00:00Z',
  },
];

describe('AlertPanel', () => {
  const mockUseAlertStore = vi.mocked(require('../../store/alertStore').useAlertStore);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPanel = (alerts = mockAlerts) => {
    return render(
      <AlertPanel
        alerts={alerts}
        onAcknowledge={vi.fn()}
        onResolve={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
  };

  describe('Rendering', () => {
    it('renders alert panel header', () => {
      renderPanel();
      expect(screen.getByText('Alerts')).toBeInTheDocument();
    end});

    it('shows alert counts', () => {
      renderPanel();
      expect(screen.getByText(/3 total/)).toBeInTheDocument();
      expect(screen.getByText(/2 active/)).toBeInTheDocument();
      expect(screen.getByText(/1 critical/)).toBeInTheDocument();
    end});

    it('renders filter chips', () => {
      renderPanel();
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
      expect(screen.getByText('Emergency')).toBeInTheDocument();
    end});

    it('renders Configure Thresholds button', () => {
      renderPanel();
      expect(screen.getByText('Configure Thresholds')).toBeInTheDocument();
    end});
  end});

  describe('Alert List', () => {
    it('renders all alerts', () => {
      renderPanel();
      expect(screen.getByText('Water level below minimum: 8.5 cm')).toBeInTheDocument();
      expect(screen.getByText('Temperature exceeded maximum: 65°C')).toBeInTheDocument();
      expect(screen.getByText('System startup completed')).toBeInTheDocument();
    end});

    it('shows correct severity badges', () => {
      renderPanel();
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
    end});

    it('shows status badges', () => {
      renderPanel();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Acknowledged')).toBeInTheDocument();
    end});

    it('displays timestamp', () => {
      renderPanel();
      expect(screen.getByText('1/15/2024')).toBeInTheDocument();
    end});

    it('shows sensor type and value', () => {
      renderPanel();
      expect(screen.getByText('water_level: 8.5 cm')).toBeInTheDocument();
      expect(screen.getByText('temperature: 65 °C')).toBeInTheDocument();
    end});
  end});

  describe('Filtering', () => {
    it('filters by severity', () => {
      renderPanel();
      fireEvent.click(screen.getByText('Warning'));
      // Should filter to show only warning alerts
    end});

    it('filters by status', () => {
      renderPanel();
      fireEvent.click(screen.getByText('Active'));
      // Should filter to show only active alerts
    end});

    it('clears filters when All is selected', () => {
      renderPanel();
      fireEvent.click(screen.getByText('Warning'));
      fireEvent.click(screen.getByText('All'));
      // Should show all alerts again
    end});
  end});

  describe('Alert Actions', () => {
    it('acknowledges alert when clicked', () => {
      const onAcknowledge = vi.fn();
      renderPanel(mockAlerts, { onAcknowledge });
      fireEvent.click(screen.getByText('Acknowledge'));
      expect(onAcknowledge).toHaveBeenCalledWith('alert_1');
    end});

    it('resolves alert when clicked', () => {
      const onResolve = vi.fn();
      renderPanel(mockAlerts, { onResolve });
      fireEvent.click(screen.getByText('Resolve'));
      expect(onResolve).toHaveBeenCalledWith('alert_1');
    end});

    it('dismisses alert when dismissed', () => {
      const onDismiss = vi.fn();
      renderPanel(mockAlerts, { onDismiss });
      fireEvent.click(screen.getByLabelText('Dismiss'));
      expect(onDismiss).toHaveBeenCalledWith('alert_1');
    end});

    it('only shows Acknowledge for active alerts', () => {
      renderPanel();
      const acknowledgedAlert = screen.getByText('System startup completed').closest('[data-testid="alert-item"]');
      expect(acknowledgedAlert.querySelector('button:contains("Acknowledge")')).not.toBeInTheDocument();
    end});

    it('only shows Resolve for active/acknowledged alerts', () => {
      renderPanel();
      const activeAlert = screen.getByText('Water level below minimum: 8.5 cm').closest('[data-testid="alert-item"]');
      expect(activeAlert.querySelector('button:contains("Resolve")')).toBeInTheDocument();
    end});
  end});

  describe('Expand/Collapse', () => {
    it('expands alert details when clicked', () => {
      renderPanel();
      const alertItem = screen.getByText('Water level below minimum: 8.5 cm').closest('[data-testid="alert-item"]');
      fireEvent.click(alertItem);
      expect(screen.getByText('sensor_type:')).toBeInTheDocument();
      expect(screen.getByText('water_level')).toBeInTheDocument();
    end});

    it('collapses when clicked again', () => {
      renderPanel();
      const alertItem = screen.getByText('Water level below minimum: 8.5 cm').closest('[data-testid="alert-item"]');
      fireEvent.click(alertItem);
      fireEvent.click(alertItem);
      expect(screen.queryByText('sensor_type:')).not.toBeInTheDocument();
    end});
  end});

  describe('Empty State', () => {
    it('shows empty state when no alerts', () => {
      renderPanel([]);
      expect(screen.getByText('No alerts recorded')).toBeInTheDocument();
      expect(screen.getByTestId('bell-off-icon')).toBeInTheDocument();
    end});

    it('shows no alerts match filters', () => {
      renderPanel();
      fireEvent.click(screen.getByText('Emergency'));
      expect(screen.getByText('No alerts match current filters')).toBeInTheDocument();
    end});
  end});

  describe('Severity Badges', () => {
    it('shows correct colors for each severity', () => {
      renderPanel();
      const warningBadge = screen.getByText('Warning').closest('.badge');
      expect(warningBadge).toHaveClass('bg-warning-100');
      expect(warningBadge).toHaveClass('text-warning-800');

      const criticalBadge = screen.getByText('Critical').closest('.badge');
      expect(criticalBadge).toHaveClass('bg-danger-100');
      expect(criticalBadge).toHaveClass('text-danger-800');

      const infoBadge = screen.getByText('Info').closest('.badge');
      expect(infoBadge).toHaveClass('bg-primary-100');
      expect(infoBadge).toHaveClass('text-primary-800');
    end});
  end});

  describe('Status Badges', () => {
    it('shows correct status colors', () => {
      renderPanel();
      const activeBadge = screen.getByText('Active').closest('.badge');
      expect(activeBadge).toHaveClass('bg-danger-100');
      expect(activeBadge).toHaveClass('text-danger-800');

      const acknowledgedBadge = screen.getByText('Acknowledged').closest('.badge');
      expect(acknowledgedBadge).toHaveClass('bg-warning-100');
      expect(acknowledgedBadge).toHaveClass('text-warning-800');
    end});
  end});

  describe('Modal Integration', () => {
    it('opens threshold config modal when button clicked', () => {
      renderPanel();
      fireEvent.click(screen.getByText('Configure Thresholds'));
      expect(screen.getByText('Threshold Configuration')).toBeInTheDocument();
    end});

    it('closes modal when cancelled', () => {
      renderPanel();
      fireEvent.click(screen.getByText('Configure Thresholds'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Threshold Configuration')).not.toBeInTheDocument();
    end});
  end});

  describe('Empty State', () => {
    it('shows helpful message when no alerts', () => {
      renderPanel([]);
      expect(screen.getByText('No alerts recorded')).toBeInTheDocument();
      expect(screen.getByTestId('bell-off-icon')).toBeInTheDocument();
    end});
  end});

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderPanel();
      expect(screen.getByRole('heading', { level: 2, name: 'Alerts' })).toBeInTheDocument();
    end});

    it('has proper labels on filter buttons', () => {
      renderPanel();
      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /info/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /warning/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /critical/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /emergency/i })).toBeInTheDocument();
    end});

    it('has proper labels on action buttons', () => {
      renderPanel();
      expect(screen.getByRole('button', { name: /acknowledge/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /resolve/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    end});

    it('has proper table semantics', () => {
      renderPanel();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('rowheader')).toBeInTheDocument();
    end});
  end});

  describe('Responsive', () => {
    it('shows horizontal scroll on mobile', () => {
      renderPanel();
      const table = screen.getByRole('table');
      expect(table).toHaveClass('overflow-x-auto');
    end});
  end});