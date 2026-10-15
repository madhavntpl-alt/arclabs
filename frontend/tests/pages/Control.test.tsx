import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Control } from '../../pages/Control';
import { useDeviceStore } from '../../store/deviceStore';
import { useUIStore } from '../../store/uiStore';

// Mock dependencies
vi.mock('../../store/deviceStore', () => ({
  useDeviceStore: vi.fn(),
}));

vi.mock('../../store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

vi.mock('../../components/control/ControlPanel', () => ({
  ControlPanel: ({ pumpState, valveState, automationEnabled, onPumpToggle, onValveToggle, onAutomationToggle, pumpDuration, onPumpDurationChange }: any) => (
    <div data-testid="control-panel">
      <div data-testid="pump-state">{pumpState ? 'ON' : 'OFF'}</div>
      <div data-testid="valve-state">{valveState ? 'OPEN' : 'CLOSED'}</div>
      <div data-testid="automation-enabled">{automationEnabled ? 'ON' : 'OFF'}</div>
      <button data-testid="pump-toggle" onClick={() => onPumpToggle(!pumpState)}>
        {pumpState ? 'Stop Pump' : 'Start Pump'}
      </button>
      <button data-testid="valve-toggle" onClick={() => onValveToggle(!valveState)}>
        {valveState ? 'Close Valve' : 'Open Valve'}
      </button>
      <label>
        <input
          type="checkbox"
          checked={automationEnabled}
          onChange={(e) => onAutomationToggle(e.target.checked)}
        />
        Automation
      </label>
      <input
        type="number"
        data-testid="pump-duration"
        value={pumpDuration}
        onChange={(e) => onPumpDurationChange(parseInt(e.target.value))}
      />
    </div>
  ),
}));

vi.mock('../../components/control/AutomationRules', () => ({
  AutomationRules: ({ rules, onCreate, onUpdate, onDelete, onToggle, onDuplicate, onTest }: any) => (
    <div data-testid="automation-rules">
      <button data-testid="create-rule-btn" onClick={() => onCreate({})}>Create Rule</button>
      {rules.map((rule: any) => (
        <div key={rule.id} data-testid={`rule-${rule.id}`}>
          <span>{rule.name}</span>
          <button onClick={() => onToggle(rule.id, !rule.enabled)}>
            {rule.enabled ? 'Disable' : 'Enable'}
          </button>
          <button onClick={() => onUpdate(rule)}>Edit</button>
          <button onClick={() => onDelete(rule.id)}>Delete</button>
          <button onClick={() => onDuplicate(rule.id)}>Duplicate</button>
          <button onClick={() => onTest(rule.id)}>Test</button>
        </div>
      )}
    </div>
  ),
}));

vi.mock('../../components/control/PumpOverride', () => ({
  PumpOverride: ({ isRunning, remainingTime, defaultDuration, onStart, onStop, onDurationChange }: any) => (
    <div data-testid="pump-override">
      <div data-testid="pump-running">{isRunning ? 'RUNNING' : 'STOPPED'}</div>
      <div data-testid="remaining-time">{remainingTime || 0}s</div>
      <input
        data-testid="duration-input"
        type="number"
        value={defaultDuration}
        onChange={(e) => onDurationChange(parseInt(e.target.value))}
      />
      <button data-testid="start-pump" onClick={onStart} disabled={isRunning}>
        Start Pump
      </button>
      <button data-testid="stop-pump" onClick={onStop} disabled={!isRunning}>
        Stop Pump
      </button>
      <button data-testid="extend-pump" onClick={() => { onStart(defaultDuration); }} disabled={!isRunning}>
        Extend
      </button>
    </div>
  ),
}));

vi.mock('../../components/control/RuleBuilder', () => ({
  RuleBuilder: ({ initialRule, onSave, onCancel }: any) => (
    <div data-testid="rule-builder">
      <input
        data-testid="rule-name"
        value={initialRule?.name || ''}
        onChange={(e) => { /* mock */ }}
      />
      <select data-testid="rule-logic" value={initialRule?.logic || 'AND'} onChange={e => { /* mock */ }}>
        <option value="AND">AND</option>
        <option value="OR">OR</option>
      </select>
      <button data-testid="add-condition-btn" onClick={() => { /* mock */ }}>Add Condition</button>
      <button data-testid="add-action-btn" onClick={() => { /* mock */ }}>Add Action</button>
      <button data-testid="save-rule" onClick={onSave}>Save</button>
      <button data-testid="cancel-rule" onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('Control Page', () => {
  const mockUseDeviceStore = vi.mocked(require('../../store/deviceStore').useDeviceStore);
  const mockUseUIStore = vi.mocked(require('../../store/uiStore').useUIStore);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeviceStore.mockReturnValue({
      devices: [
        { id: 'device_1', name: 'Catalyst Mk1 #1', type: 'catalyst_mk1', status: 'online' },
      ],
      getOnlineDevices: vi.fn().mockReturnValue([
        { id: 'device_1', name: 'Catalyst Mk1 #1', type: 'catalyst_mk1', status: 'online' },
      ]),
      activeDevice: { id: 'device_1', name: 'Catalyst Mk1 #1', type: 'catalyst_mk1', status: 'online' },
    });
    mockUseUIStore.mockReturnValue({
      sidebarCollapsed: false,
      sidebarOpen: true,
      toggleSidebar: vi.fn(),
    });
  end});

  const renderControl = () => {
    return render(<Control />);
  end});

  describe('Rendering', () => {
    it('renders control page title', () => {
      renderControl();
      expect(screen.getByText('Control')).toBeInTheDocument();
      expect(screen.getByText('Manual control and automation rules')).toBeInTheDocument();
    end});

    it('renders device selector', () => {
      renderControl();
      expect(screen.getByText('Catalyst Mk1 #1')).toBeInTheDocument();
    end});

    it('renders manual control panel', () => {
      renderControl();
      expect(screen.getByTestId('control-panel')).toBeInTheDocument();
    end});

    it('renders automation rules section', () => {
      renderControl();
      expect(screen.getByText('Automation Rules')).toBeInTheDocument();
    end});
  end});

  describe('Device Selection', () => {
    it('shows device dropdown', () => {
      renderControl();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    end});

    it('shows device status', () => {
      renderControl();
      expect(screen.getByText('Online')).toBeInTheDocument();
    end});
  end});

  describe('Manual Control', () => {
    it('shows pump state', () => {
      renderControl();
      expect(screen.getByTestId('pump-state')).toHaveTextContent('OFF');
    end});

    it('toggles pump on', () => {
      renderControl();
      fireEvent.click(screen.getByTestId('pump-toggle'));
      expect(screen.getByTestId('pump-state')).toHaveTextContent('ON');
    end});

    it('toggles valve', () => {
      renderControl();
      fireEvent.click(screen.getByTestId('valve-toggle'));
      expect(screen.getByTestId('valve-state')).toHaveTextContent('OPEN');
    end});

    it('toggles automation', () => {
      renderControl();
      const checkbox = screen.getByRole('checkbox', { name: /automation/i });
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    end});

    it('sets pump duration', () => {
      renderControl();
      const input = screen.getByTestId('pump-duration');
      fireEvent.change(input, { target: { value: '60' } });
      expect(input).toHaveValue('60');
    end});
  end});

  describe('Automation Rules', () => {
    it('renders existing rules', () => {
      renderControl();
      expect(screen.getByTestId('automation-rules')).toBeInTheDocument();
    end});

    it('creates new rule', () => {
      renderControl();
      fireEvent.click(screen.getByTestId('create-rule-btn'));
      expect(screen.getByTestId('rule-builder')).toBeInTheDocument();
    end});

    it('edits existing rule', () => {
      renderControl();
      fireEvent.click(screen.getByText('Edit'));
      expect(screen.getByTestId('rule-builder')).toBeInTheDocument();
    end});

    it('deletes rule', () => {
      renderControl();
      fireEvent.click(screen.getByText('Delete'));
      // Should show confirmation
    end});

    it('duplicates rule', () => {
      renderControl();
      fireEvent.click(screen.getByText('Duplicate'));
      // Should create duplicate
    end});

    it('tests rule', () => {
      renderControl();
      fireEvent.click(screen.getByText('Test'));
      // Should run test
    end});

    it('toggles rule enabled state', () => {
      renderControl();
      fireEvent.click(screen.getByText('Disable'));
      // Rule should be disabled
    end});
  end});

  describe('Rule Builder', () => {
    it('renders rule builder modal', () => {
      renderControl();
      fireEvent.click(screen.getByTestId('create-rule-btn'));
      expect(screen.getByTestId('rule-builder')).toBeInTheDocument();
    end});

    it('sets rule name', () => {
      renderControl();
      fireEvent.click(screen.getByTestId('create-rule-btn'));
      fireEvent.change(screen.getByTestId('rule-name'), { target: { value: 'Test Rule' } });
      expect(screen.getByTestId('rule-name')).toHaveValue('Test Rule');
    end});

    it('sets priority', () => {
      renderControl();
      fireEvent.click(screen.getByTestId('create-rule-btn'));
      fireEvent.change(screen.getByTestId('rule-priority'), { target: { value: '20' } });
      expect(screen.getByTestId('rule-priority')).toHaveValue('20');
    end});

    it('selects logic', () => {
      renderControl();
      fireEvent.click(screen.getByTestId('create-rule-btn'));
      fireEvent.change(screen.getByTestId('rule-logic'), { target: { value: 'OR' } });
      expect(screen.getByTestId('rule-logic')).toHaveValue('OR');
    end});

    it('sets cooldown', () => {
      renderControl();
      fireEvent.click(screen.getByTestId('create-rule-btn'));
      fireEvent.change(screen.getByTestId('cooldown'), { target: { value: '120' } });
      expect(screen.getByTestId('cooldown')).toHaveValue('120');
    end});

    it('adds condition', () => {
      renderControl();
      fireEvent.click(screen.getByTestId('create-rule-btn'));
      fireEvent.click(screen.getByTestId('add-condition-btn'));
      // Should add condition row
    end});

    it('adds action', () => {
      renderControl();
      fireEvent.click(screen.getByTestId('create-rule-btn'));
      fireEvent.click(screen.getByTestId('add-action-btn'));
      // Should add action row
    end});

    it('saves rule', () => {
      const onSave = vi.fn();
      render(<Control />);
      fireEvent.click(screen.getByTestId('create-rule-btn'));
      fireEvent.click(screen.getByTestId('save-rule'));
      // Should call onSave
    end});

    it('cancels rule creation', () => {
      const onCancel = vi.fn();
      renderControl();
      fireEvent.click(screen.getByTestId('create-rule-btn'));
      fireEvent.click(screen.getByTestId('cancel-rule'));
      expect(onCancel).toHaveBeenCalled();
    end});
  end});

  describe('Pump Override', () => {
    it('shows pump running state', () => {
      renderControl();
      // Pump override should show running state
    end});

    it('starts pump with duration', () => {
      renderControl();
      fireEvent.click(screen.getByTestId('start-pump'));
      // Pump should start
    end});

    it('stops pump', () => {
      renderControl();
      fireEvent.click(screen.getByTestId('stop-pump'));
      // Pump should stop
    end});

    it('extends pump runtime', () => {
      renderControl();
      fireEvent.click(screen.getByText('Extend'));
      // Should extend pump runtime
    end});

    it('sets custom duration', () => {
      renderControl();
      const input = screen.getByTestId('duration-input');
      fireEvent.change(input, { target: { value: '120' } });
      expect(input).toHaveValue('120');
    end});

    it('shows remaining time', () => {
      renderControl();
      expect(screen.getByTestId('remaining-time')).toBeInTheDocument();
    end});

    it('shows confirmation when extending', () => {
      renderControl();
      fireEvent.click(screen.getByText('Extend'));
      // Should show confirmation modal
    end});
  end});

  describe('Tabs', () => {
    it('switches between Manual and Automation tabs', () => {
      renderControl();
      fireEvent.click(screen.getByText('Automation Rules'));
      expect(screen.getByTestId('automation-rules')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Manual Control'));
      expect(screen.getByTestId('control-panel')).toBeInTheDocument();
    end});
  end});

  describe('Responsive', () => {
    it('adapts layout on mobile', () => {
      renderControl();
      const container = screen.getByTestId('control-page');
      expect(container).toHaveClass('lg:ml-64');
    end});

    it('collapses sidebar on mobile', () => {
      renderControl();
      // Mobile layout should stack vertically
    end});
  end});

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderControl();
      expect(screen.getByLabelText('Select device')).toBeInTheDocument();
      expect(screen.getByLabelText('Pump duration')).toBeInTheDocument();
    end});

    it('has proper ARIA attributes', () => {
      renderControl();
      const pumpToggle = screen.getByTestId('pump-toggle');
      expect(pumpToggle).toHaveAttribute('aria-pressed', 'false');
    end});

    it('supports keyboard navigation', () => {
      renderControl();
      const pumpToggle = screen.getByTestId('pump-toggle');
      pumpToggle.focus();
      expect(pumpToggle).toHaveFocus();
    end});
  end});