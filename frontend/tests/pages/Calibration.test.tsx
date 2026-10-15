import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Calibration } from '../../pages/Calibration';
import { SensorType, SENSOR_TYPE_INFO, DEFAULT_THRESHOLDS } from '../../constants';
import { useUIStore } from '../../store/uiStore';
import { api } from '../../services/api';

// Mock dependencies
vi.mock('../../store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

vi.mock('../../services/api', () => ({
  api: {
    getCalibration: vi.fn(),
    updateCalibration: vi.fn(),
  }),
});

const mockCalibration = {
  water_level: { slope: 58.0, offset: -2.5 },
  temperature: { offset: 0.0 },
  humidity: { offset: 0.0 },
  gas: { r0: 10.0, slope: -0.45, intercept: 1.2 },
  battery: { divider_ratio: 11.0, adc_ref: 5.0, offset: 0.0 },
};

const calibrationSensors = [
  { type: 'water_level' as SensorType, label: 'Water Level', icon: 'droplet', unit: 'cm', fields: ['slope', 'offset'] },
  { type: 'temperature' as SensorType, label: 'Temperature', icon: 'thermometer', unit: '°C', fields: ['offset'] },
  { type: 'humidity' as SensorType, label: 'Humidity', icon: 'droplet', unit: '%', fields: ['offset'] },
  { type: 'gas' as SensorType, label: 'Gas (Air Quality)', icon: 'wind', unit: 'ppm', fields: ['r0', 'slope', 'intercept'] },
  { type: 'battery' as SensorType, label: 'Battery', icon: 'battery', unit: 'V', fields: ['divider_ratio', 'adc_ref', 'offset'] },
];

describe('Calibration Page', () => {
  const mockUseUIStore = vi.mocked(require('../../store/uiStore').useUIStore);
  const mockApi = vi.mocked(require('../../services/api').api);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUIStore.mockReturnValue({
      sidebarCollapsed: false,
      setSidebarCollapsed: vi.fn(),
    });
    mockApi.getCalibration.mockResolvedValue(mockCalibration);
    mockApi.updateCalibration.mockResolvedValue({ success: true });
  end});

  const renderCalibration = () => {
    return render(<Calibration />);
  end});

  describe('Rendering', () => {
    it('renders calibration page title', () => {
      renderCalibration();
      expect(screen.getByText('Calibration')).toBeInTheDocument();
      expect(screen.getByText('Calibrate sensors for accurate readings')).toBeInTheDocument();
    end});

    it('renders sensor selector tabs', () => {
      renderCalibration();
      calibrationSensors.forEach(sensor => {
        expect(screen.getByText(sensor.label)).toBeInTheDocument();
      end});
    end});

    it('highlights active sensor', () => {
      renderCalibration();
      const waterLevelTab = screen.getByText('Water Level');
      expect(waterLevelTab).toHaveClass('bg-primary-600');
      expect(waterLevelTab).toHaveClass('text-white');
    end});

    it('shows export/import buttons', () => {
      renderCalibration();
      expect(screen.getByText('Export Calibration')).toBeInTheDocument();
      expect(screen.getByText('Import Calibration')).toBeInTheDocument();
      expect(screen.getByText('Save All')).toBeInTheDocument();
    end});
  end});

  describe('Sensor Selection', () => {
    it('switches active sensor when clicked', () => {
      renderCalibration();
      fireEvent.click(screen.getByText('Temperature'));
      expect(screen.getByText('Temperature')).toHaveClass('bg-primary-600');
    end});

    it('shows correct calibration fields for each sensor', () => {
      renderCalibration();
      // Water level should show slope and offset
      expect(screen.getByLabelText('Slope')).toBeInTheDocument();
      expect(screen.getByLabelText('Offset')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Gas (Air Quality)'));
      expect(screen.getByLabelText('R0')).toBeInTheDocument();
      expect(screen.getByLabelText('Slope')).toBeInTheDocument();
      expect(screen.getByLabelText('Intercept')).toBeInTheDocument();
    end});
  end});

  describe('Calibration Form', () => {
    it('shows current calibration values', () => {
      renderCalibration();
      expect(screen.getByDisplayValue('58')).toBeInTheDocument(); // slope
      expect(screen.getByDisplayValue('-2.5')).toBeInTheDocument(); // offset
    end});

    it('updates calibration values', () => {
      renderCalibration();
      fireEvent.change(screen.getByLabelText('Slope'), { target: { value: '58.5' } });
      expect(screen.getByLabelText('Slope')).toHaveValue('58.5');
    end});

    it('validates numeric input', () => {
      renderCalibration();
      fireEvent.change(screen.getByLabelText('Slope'), { target: { value: 'abc' } });
      expect(screen.getByLabelText('Slope')).toHaveValue('abc'); // Input allows any text but validation happens on submit
    end});

    it('shows unit for each field', () => {
      renderCalibration();
      expect(screen.getByText('cm')).toBeInTheDocument(); // water level unit
      expect(screen.getByText('°C')).toBeInTheDocument(); // temperature unit
    end});

    it('shows last calibrated timestamp', () => {
      renderCalibration();
      // Should show last calibrated time if available
    end});
  end});

  describe('Calibration Actions', () => {
    it('calibrates sensor when button clicked', async () => {
      renderCalibration();
      fireEvent.click(screen.getByText('Calibrate'));
      await waitFor(() => {
        expect(require('../../services/api').api.updateCalibration).toHaveBeenCalled();
      });
    end});

    it('shows loading state during calibration', () => {
      renderCalibration();
      fireEvent.click(screen.getByText('Calibrate'));
      expect(screen.getByText('Calibrating...')).toBeInTheDocument();
    end});

    it('shows success message on calibration', async () => {
      renderCalibration();
      fireEvent.click(screen.getByText('Calibrate'));
      await waitFor(() => {
        expect(screen.getByText('Calibration saved')).toBeInTheDocument();
      });
    end});

    it('shows error on calibration failure', async () => {
      const mockApi = require('../../services/api').api;
      mockApi.updateCalibration.mockRejectedValue(new Error('Calibration failed'));
      renderCalibration();
      fireEvent.click(screen.getByText('Calibrate'));
      await waitFor(() => {
        expect(screen.getByText('Calibration failed')).toBeInTheDocument();
      });
    end});

    it('resets to defaults', () => {
      renderCalibration();
      fireEvent.click(screen.getByText('Reset to Default'));
      // Should reset to default values
    end});
  end});

  describe('Live Calibration', () => {
    it('shows known reference value input', () => {
      renderCalibration();
      expect(screen.getByLabelText('Known Reference Value')).toBeInTheDocument();
    end});

    it('enters known value', () => {
      renderCalibration();
      fireEvent.change(screen.getByLabelText('Known Reference Value'), { target: { value: '50' } });
      expect(screen.getByLabelText('Known Reference Value')).toHaveValue('50');
    end});

    it('calibrates with known value', () => {
      renderCalibration();
      fireEvent.change(screen.getByLabelText('Known Reference Value'), { target: { value: '50' } });
      fireEvent.click(screen.getByText('Calibrate'));
      await waitFor(() => {
        expect(require('../../services/api').api.updateCalibration).toHaveBeenCalledWith(
          expect.objectContaining({
            water_level: expect.objectContaining({ offset: expect.any(Number) }),
          })
        );
      });
    end});
  end});

  describe('Save/Export/Import', () => {
    it('saves all calibration', () => {
      renderCalibration();
      fireEvent.click(screen.getByText('Save All'));
      expect(require('../../services/api').api.updateCalibration).toHaveBeenCalledWith(
        expect.objectContaining(mockCalibration)
      );
    end});

    it('exports calibration to file', () => {
      renderCalibration();
      fireEvent.click(screen.getByText('Export Calibration'));
      // Should trigger download
    end});

    it('imports calibration from file', () => {
      renderCalibration();
      fireEvent.click(screen.getByText('Import Calibration'));
      // Should open file picker
    end});

    it('validates imported calibration', () => {
      renderCalibration();
      // Mock file input
      const file = new File(['{"water_level":{"slope":58,"offset":-2.5}}'], 'calibration.json', { type: 'application/json' });
      const input = screen.getByLabelText(/import/i);
      fireEvent.change(input, { target: { files: [file] } });
      // Should validate and show preview
    end});
  end});

  describe('Calibration Instructions', () => {
    it('shows instructions for each sensor', () => {
      renderCalibration();
      fireEvent.click(screen.getByText('Temperature'));
      expect(screen.getByText('Place sensor in ice bath (0°C) and boiling water (100°C)')).toBeInTheDocument();
    end});

    it('shows water level calibration steps', () => {
      renderCalibration();
      fireEvent.click(screen.getByText('Water Level'));
      expect(screen.getByText('Fill tank to known level')).toBeInTheDocument();
      expect(screen.getByText('Measure actual distance')).toBeInTheDocument();
    end});

    it('shows gas sensor calibration steps', () => {
      renderCalibration();
      fireEvent.click(screen.getByText('Gas (Air Quality)'));
      expect(screen.getByText('Expose to clean air for R0')).toBeInTheDocument();
      expect(screen.getByText('Expose to known gas concentration')).toBeInTheDocument();
    end});
  end});

  describe('Validation', () => {
    it('validates numeric inputs', () => {
      renderCalibration();
      fireEvent.change(screen.getByLabelText('Slope'), { target: { value: 'abc' } });
      fireEvent.click(screen.getByText('Save All'));
      expect(screen.getByText('Slope must be a number')).toBeInTheDocument();
    end});

    it('validates range for offset', () => {
      renderCalibration();
      fireEvent.change(screen.getByLabelText('Offset'), { target: { value: '100' } });
      fireEvent.click(screen.getByText('Save All'));
      expect(screen.getByText('Offset must be between')).toBeInTheDocument();
    end});

    it('validates divider ratio for battery', () => {
      renderCalibration();
      fireEvent.click(screen.getByText('Battery'));
      fireEvent.change(screen.getByLabelText('Divider Ratio'), { target: { value: '0' } });
      fireEvent.click(screen.getByText('Save All'));
      expect(screen.getByText('Divider ratio must be greater than 1')).toBeInTheDocument();
    end});
  end});

  describe('Calibration History', () => {
    it('shows last calibrated timestamp', () => {
      renderCalibration();
      expect(screen.getByText('Last calibrated')).toBeInTheDocument();
    end});

    it('shows who calibrated', () => {
      renderCalibration();
      expect(screen.getByText('Calibrated by')).toBeInTheDocument();
    end});
  end});

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      renderCalibration();
      expect(screen.getByLabelText('Slope')).toBeInTheDocument();
      expect(screen.getByLabelText('Offset')).toBeInTheDocument();
      expect(screen.getByLabelText('Known Reference Value')).toBeInTheDocument();
    end});

    it('has proper field descriptions', () => {
      renderCalibration();
      expect(screen.getByText('Slope multiplier for raw ADC value')).toBeInTheDocument();
      expect(screen.getByText('Zero offset in cm')).toBeInTheDocument();
    end});

    it('has proper error messages', () => {
      renderCalibration();
      fireEvent.change(screen.getByLabelText('Slope'), { target: { value: '-1' } });
      fireEvent.click(screen.getByText('Save All'));
      expect(screen.getByText('Slope must be positive')).toBeInTheDocument();
    end});
  end});