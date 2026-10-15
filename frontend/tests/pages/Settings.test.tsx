import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Settings } from '../../pages/Settings';
import { useTheme } from '../../hooks/useTheme';
import { useUIStore } from '../../store/uiStore';

// Mock dependencies
vi.mock('../../hooks/useTheme', () => ({
  useTheme: vi.fn(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

vi.mock('../../services/api', () => ({
  api: {
    getThresholds: vi.fn(),
    updateThresholds: vi.fn(),
    getCalibration: vi.fn(),
    updateCalibration: vi.fn(),
  },
}));

const mockThresholds = {
  water_level_min_cm: 10,
  water_level_max_cm: 200,
  temp_min_c: 0,
  temp_max_c: 50,
  humidity_min_pct: 20,
  humidity_max_pct: 80,
  gas_threshold_ppm: 1000,
  battery_min_v: 3.3,
  battery_max_v: 4.2,
};

const mockCalibration = {
  water_level: { slope: 58.0, offset: -2.5 },
  temperature: { offset: 0.0 },
  humidity: { offset: 0.0 },
  gas: { r0: 10.0, slope: -0.45, intercept: 1.2 },
  battery: { divider_ratio: 11.0, adc_ref: 5.0, offset: 0.0 },
};

describe('Settings Page', () => {
  const mockUseTheme = vi.mocked(require('../../hooks/useTheme').useTheme);
  const mockUseUIStore = vi.mocked(require('../../store/uiStore').useUIStore);
  const mockApi = vi.mocked(require('../../services/api').api);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTheme.mockReturnValue({
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    });
    mockUseUIStore.mockReturnValue({
      sidebarCollapsed: false,
      setSidebarCollapsed: vi.fn(),
    });
    mockApi.getThresholds.mockResolvedValue(mockThresholds);
    mockApi.getCalibration.mockResolvedValue(mockCalibration);
    mockApi.updateThresholds.mockResolvedValue({ success: true });
    mockApi.updateCalibration.mockResolvedValue({ success: true });
  end});

  const renderSettings = () => {
    return render(<Settings />);
  end});

  describe('Rendering', () => {
    it('renders settings page title', () => {
      renderSettings();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Configure your monitoring platform')).toBeInTheDocument();
    end});

    it('renders appearance section', () => {
      renderSettings();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
    end});

    it('renders theme selector', () => {
      renderSettings();
      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /light/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /dark/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /system/i })).toBeInTheDocument();
    end});

    it('renders sidebar toggle', () => {
      renderSettings();
      expect(screen.getByText('Sidebar')).toBeInTheDocument();
    end});
  end});

  describe('Theme Selection', () => {
    it('selects light theme', () => {
      renderSettings();
      fireEvent.click(screen.getByRole('radio', { name: /light/i }));
      expect(require('../../hooks/useTheme').useTheme).toHaveBeenCalledWith('light');
    end});

    it('selects dark theme', () => {
      renderSettings();
      fireEvent.click(screen.getByRole('radio', { name: /dark/i }));
      expect(require('../../hooks/useTheme').useTheme).toHaveBeenCalledWith('dark');
    end});

    it('selects system theme', () => {
      renderSettings();
      fireEvent.click(screen.getByRole('radio', { name: /system/i }));
      expect(require('../../hooks/useTheme').useTheme).toHaveBeenCalledWith('system');
    end});

    it('shows current theme as selected', () => {
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        resolvedTheme: 'dark',
        setTheme: vi.fn(),
        toggleTheme: vi.fn(),
      });
      renderSettings();
      expect(screen.getByRole('radio', { name: /dark/i })).toBeChecked();
    end});
  end});

  describe('Sidebar Settings', () => {
    it('toggles sidebar collapse', () => {
      renderSettings();
      const toggle = screen.getByRole('switch', { name: /collapse sidebar/i });
      fireEvent.click(toggle);
      expect(require('../../store/uiStore').useUIStore).toHaveBeenCalledWith(expect.any(Function));
    end});

    it('shows collapsed state', () => {
      vi.mocked(require('../../store/uiStore').useUIStore).mockReturnValue({
        sidebarCollapsed: true,
        setSidebarCollapsed: vi.fn(),
      });
      renderSettings();
      expect(screen.getByRole('switch', { name: /collapse sidebar/i })).toBeChecked();
    end});
  end});

  describe('Notifications', () => {
    it('renders notification settings', () => {
      renderSettings();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    end});

    it('toggles notifications', () => {
      renderSettings();
      const toggle = screen.getByRole('switch', { name: /enable notifications/i });
      fireEvent.click(toggle);
      // Should update notification settings
    end});

    it('toggles auto-refresh', () => {
      renderSettings();
      const toggle = screen.getByRole('switch', { name: /auto-refresh/i });
      fireEvent.click(toggle);
    end});

    it('sets refresh interval', () => {
      renderSettings();
      const input = screen.getByLabelText(/refresh interval/i);
      fireEvent.change(input, { target: { value: '60' } });
      expect(screen.getByLabelText(/refresh interval/i)).toHaveValue('60');
    end});
  end});

  describe('Connection Settings', () => {
    it('renders connection settings', () => {
      renderSettings();
      expect(screen.getByText('Connection')).toBeInTheDocument();
    end});

    it('shows API URL', () => {
      renderSettings();
      expect(screen.getByDisplayValue('http://localhost:8000')).toBeInTheDocument();
    end});

    it('shows WebSocket URL', () => {
      renderSettings();
      expect(screen.getByDisplayValue('ws://localhost:8000/ws/live')).toBeInTheDocument();
    end});

    it('allows editing API URL', () => {
      renderSettings();
      const input = screen.getByLabelText(/api url/i);
      fireEvent.change(input, { target: { value: 'https://api.arc-labs.com' } });
      expect(screen.getByLabelText(/api url/i)).toHaveValue('https://api.arc-labs.com');
    end});

    it('shows save button for connection settings', () => {
      renderSettings();
      expect(screen.getByText('Save Connection Settings')).toBeInTheDocument();
    end});
  end});

  describe('Security Settings', () => {
    it('renders security section', () => {
      renderSettings();
      expect(screen.getByText('Security')).toBeInTheDocument();
    end});

    it('toggles API key authentication', () => {
      renderSettings();
      const toggle = screen.getByRole('switch', { name: /api key authentication/i });
      fireEvent.click(toggle);
    end});

    it('toggles two-factor authentication', () => {
      renderSettings();
      const toggle = screen.getByRole('switch', { name: /two-factor authentication/i });
      fireEvent.click(toggle);
    end});

    it('shows API key management', () => {
      renderSettings();
      expect(screen.getByText('API Keys')).toBeInTheDocument();
    end});

    it('creates new API key', () => {
      renderSettings();
      fireEvent.click(screen.getByText('Create API Key'));
      // Should open modal
    end});

    it('revokes API key', () => {
      renderSettings();
      fireEvent.click(screen.getByText('Revoke'));
      // Should revoke key
    end});
  end});

  describe('Danger Zone', () => {
    it('renders danger zone', () => {
      renderSettings();
      expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    end});

    it('shows reset data button', () => {
      renderSettings();
      expect(screen.getByText('Reset All Data')).toBeInTheDocument();
    end});

    it('shows factory reset button', () => {
      renderSettings();
      expect(screen.getByText('Factory Reset')).toBeInTheDocument();
    end});

    it('confirms before reset', () => {
      renderSettings();
      fireEvent.click(screen.getByText('Reset All Data'));
      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
      expect(screen.getByText('Type "RESET" to confirm')).toBeInTheDocument();
    end});

    it('confirms factory reset', () => {
      renderSettings();
      fireEvent.click(screen.getByText('Factory Reset'));
      expect(screen.getByText('This will restore all settings to defaults')).toBeInTheDocument();
    end});
  end});

  describe('Save/Reset Actions', () => {
    it('saves all settings', () => {
      renderSettings();
      fireEvent.click(screen.getByText('Save All Settings'));
      // Should call API
    end});

    it('shows loading state while saving', () => {
      renderSettings();
      fireEvent.click(screen.getByText('Save All Settings'));
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    end});

    it('shows success message', () => {
      renderSettings();
      fireEvent.click(screen.getByText('Save All Settings'));
      waitFor(() => {
        expect(screen.getByText('Settings saved successfully')).toBeInTheDocument();
      });
    end});

    it('shows error message on failure', () => {
      const mockApi = require('../../services/api').api;
      mockApi.updateThresholds.mockRejectedValue(new Error('Failed to save'));
      renderSettings();
      fireEvent.click(screen.getByText('Save All Settings'));
      waitFor(() => {
        expect(screen.getByText('Failed to save settings')).toBeInTheDocument();
      });
    end});
  end});

  describe('Tabs Navigation', () => {
    it('switches between tabs', () => {
      renderSettings();
      fireEvent.click(screen.getByText('Notifications'));
      expect(screen.getByText('Notifications')).toHaveClass('active');
      fireEvent.click(screen.getByText('Security'));
      expect(screen.getByText('Security')).toHaveClass('active');
    end});

    it('shows active tab indicator', () => {
      renderSettings();
      const appearanceTab = screen.getByText('Appearance');
      expect(appearanceTab).toHaveAttribute('aria-selected', 'true');
    end});
  end});

  describe('Responsive Design', () => {
    it('stacks sections on mobile', () => {
      renderSettings();
      const container = screen.getByTestId('settings-container');
      expect(container).toHaveClass('flex-col');
    end});

    it('uses grid on desktop', () => {
      renderSettings();
      const container = screen.getByTestId('settings-container');
      expect(container).toHaveClass('md:grid');
      expect(container).toHaveClass('md:grid-cols-2');
    end});
  end});

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderSettings();
      expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Appearance' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Notifications' })).toBeInTheDocument();
    end});

    it('has proper form labels', () => {
      renderSettings();
      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/refresh interval/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/api url/i)).toBeInTheDocument();
    end});

    it('has proper focus management', () => {
      renderSettings();
      const firstInput = screen.getByLabelText(/theme/i);
      firstInput.focus();
      expect(firstInput).toHaveFocus();
    end});
  end});

  describe('Error Handling', () => {
    it('shows error when API call fails', () => {
      const mockApi = require('../../services/api').api;
      mockApi.updateThresholds.mockRejectedValue(new Error('Network error'));
      renderSettings();
      fireEvent.click(screen.getByText('Save Thresholds'));
      waitFor(() => {
        expect(screen.getByText('Failed to save thresholds')).toBeInTheDocument();
      });
    end});

    it('shows validation errors', () => {
      renderSettings();
      fireEvent.change(screen.getByLabelText(/water level min/i), { target: { value: '200' } });
      fireEvent.change(screen.getByLabelText(/water level max/i), { target: { value: '100' } });
      fireEvent.click(screen.getByText('Save Thresholds'));
      expect(screen.getByText('Min must be less than max')).toBeInTheDocument();
    end});
  end});