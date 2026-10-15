import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConnectionStatus } from '../../components/connection/ConnectionStatus';
import { ReconnectingIndicator } from '../../components/connection/ReconnectingIndicator';
import { useConnection } from '../../components/connection/ConnectionProvider';
import { useUIStore } from '../../store/uiStore';

// Mock dependencies
vi.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: vi.fn(),
}));

vi.mock('../../store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

describe('ConnectionStatus', () => {
  const mockUseWebSocket = vi.mocked(require('../../hooks/useWebSocket').useWebSocket);
  const mockUseUIStore = vi.mocked(require('../../store/uiStore').useUIStore);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWebSocket.mockReturnValue({
      status: 'connected',
      latency: 45,
      messagesPerSecond: 5.2,
      send: vi.fn(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      ping: vi.fn(),
    });
    mockUseUIStore.mockReturnValue({
      connectionStatus: 'connected',
      setConnectionStatus: vi.fn(),
      reconnectAttempts: 0,
      setReconnectAttempts: vi.fn(),
      lastConnected: new Date().toISOString(),
      setLastConnected: vi.fn(),
    });
  });

  const renderStatus = (props = {}) => {
    return render(
      <ConnectionStatus
        status="connected"
        deviceName="Catalyst Mk1 #1"
        lastConnected={new Date().toISOString()}
        reconnectAttempts={0}
        maxReconnectAttempts={10}
        latency={45}
        messagesPerSecond={5.2}
        showDetails={true}
        {...props}
      />
    );
  });

  describe('Rendering', () => {
    it('renders connected status', () => {
      renderStatus({ status: 'connected' });
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
    });

    it('renders connecting status', () => {
      renderStatus({ status: 'connecting' });
      expect(screen.getByText('Connecting')).toBeInTheDocument();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });

    it('renders disconnected status', () => {
      renderStatus({ status: 'disconnected' });
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
      expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
    });

    it('renders error status', () => {
      renderStatus({ status: 'error' });
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    });

    it('renders mock status', () => {
      renderStatus({ status: 'mock' });
      expect(screen.getByText('Mock Mode')).toBeInTheDocument();
      expect(screen.getByTestId('wifi-1-icon')).toBeInTheDocument();
    });
  });

  describe('Device Info', () => {
    it('shows device name', () => {
      renderStatus({ deviceName: 'Catalyst Mk1 #1' });
      expect(screen.getByText('Catalyst Mk1 #1')).toBeInTheDocument();
    });

    it('shows last connected time', () => {
      const timestamp = new Date('2024-01-15T10:30:00Z').toISOString();
      renderStatus({ lastConnected: timestamp });
      expect(screen.getByText('Last:')).toBeInTheDocument();
    });

    it('shows latency', () => {
      renderStatus({ latency: 45 });
      expect(screen.getByText('45ms')).toBeInTheDocument();
    });

    it('shows messages per second', () => {
      renderStatus({ messagesPerSecond: 5.2 });
      expect(screen.getByText('5.2/s')).toBeInTheDocument();
    });
  });

  describe('Reconnection Indicator', () => {
    it('shows reconnecting indicator when connecting', () => {
      renderStatus({ status: 'connecting', reconnectAttempts: 3, maxReconnectAttempts: 10 });
      expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
      expect(screen.getByText('Attempt 3 of 10')).toBeInTheDocument();
    });

    it('shows progress bar', () => {
      renderStatus({ status: 'connecting', reconnectAttempts: 5, maxReconnectAttempts: 10 });
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('shows retry button', () => {
      renderStatus({ status: 'disconnected', onRetry: vi.fn() });
      const retryButton = screen.getByText('Retry Now');
      expect(retryButton).toBeInTheDocument();
    });

    it('calls onRetry when clicked', () => {
      const onRetry = vi.fn();
      renderStatus({ status: 'disconnected', onRetry });
      const retryButton = screen.getByText('Retry Now');
      fireEvent.click(screen.getByText('Retry Now'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dismiss', () => {
    it('shows dismiss button', () => {
      renderStatus({ status: 'disconnected', onDismiss: vi.fn() });
      expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
    });

    it('calls onDismiss when clicked', () => {
      const onDismiss = vi.fn();
      renderStatus({ status: 'disconnected', onDismiss });
      fireEvent.click(screen.getByLabelText('Dismiss'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Progress Bar', () => {
    it('shows progress at top', () => {
      renderStatus({ status: 'connecting', reconnectAttempts: 2, maxReconnectAttempts: 10 });
      const progressBar = screen.getByTestId('reconnect-progress');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle({ width: '20%' });
    });
  });

  describe('Status Colors', () => {
    it('uses green for connected', () => {
      renderStatus({ status: 'connected' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('uses amber for connecting', () => {
      renderStatus({ status: 'connecting' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-amber-500');
    });

    it('uses red for disconnected', () => {
      renderStatus({ status: 'disconnected' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-red-500');
    });

    it('uses red for error', () => {
      renderStatus({ status: 'error' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-red-600');
    });

    it('uses blue for mock', () => {
      renderStatus({ status: 'mock' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-blue-500');
    });
  });

  describe('Animations', () => {
    it('pulses when connected', () => {
      renderStatus({ status: 'connected' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('animate-pulse');
    });

    it('spins when connecting', () => {
      renderStatus({ status: 'connecting' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('animate-spin');
    });

    it('pulses when error', () => {
      renderStatus({ status: 'error' });
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('animate-pulse');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderStatus({ status: 'connected' });
      expect(screen.getByTestId('status-indicator')).toHaveAttribute('role', 'status');
      expect(screen.getByTestId('status-indicator')).toHaveAttribute('aria-live', 'polite');
    });

    it('has proper labels for buttons', () => {
      renderStatus({ status: 'disconnected', onDismiss: vi.fn(), onRetry: vi.fn() });
      expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
      expect(screen.getByText('Retry Now')).toBeInTheDocument();
    });
  });
});

describe('ReconnectingIndicator', () => {
  const mockUseUIStore = vi.mocked(require('../../store/uiStore').useUIStore);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(require('../../store/uiStore').useUIStore).mockReturnValue({
      connectionStatus: 'disconnected',
      setConnectionStatus: vi.fn(),
      reconnectAttempts: 3,
      setReconnectAttempts: vi.fn(),
    });
  });

  const renderIndicator = () => {
    return render(
      <ReconnectingIndicator
        attempts={3}
        maxAttempts={10}
        onDismiss={vi.fn()}
        onRetry={vi.fn()}
      />
    );
  });

  describe('Rendering', () => {
    it('renders when connection status is connecting', () => {
      vi.mocked(require('../../store/uiStore').useUIStore).mockReturnValue({
        connectionStatus: 'connecting',
        setConnectionStatus: vi.fn(),
        reconnectAttempts: 3,
        setReconnectAttempts: vi.fn(),
      });
      renderIndicator();
      expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
    });

    it('renders when disconnected', () => {
      vi.mocked(require('../../store/uiStore').useUIStore).mockReturnValue({
        connectionStatus: 'disconnected',
        setConnectionStatus: vi.fn(),
        reconnectAttempts: 5,
        setReconnectAttempts: vi.fn(),
      });
      renderIndicator();
      expect(screen.getByText('Connection Lost')).toBeInTheDocument();
    });

    it('does not render when connected', () => {
      vi.mocked(require('../../store/uiStore').useUIStore).mockReturnValue({
        connectionStatus: 'connected',
        setConnectionStatus: vi.fn(),
        reconnectAttempts: 0,
        setReconnectAttempts: vi.fn(),
      });
      renderIndicator();
      expect(screen.queryByText('Reconnecting')).not.toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('shows progress based on attempts', () => {
      vi.mocked(require('../../store/uiStore').useUIStore).mockReturnValue({
        connectionStatus: 'connecting',
        setConnectionStatus: vi.fn(),
        reconnectAttempts: 5,
        setReconnectAttempts: vi.fn(),
      });
      renderIndicator();
      const progressBar = screen.getByTestId('reconnect-progress');
      expect(progressBar).toHaveStyle({ width: '50%' });
    });
  end;

  describe('Actions', () => {
    it('calls onRetry when Retry Now is clicked', () => {
      const onRetry = vi.fn();
      renderIndicator();
      fireEvent.click(screen.getByText('Retry Now'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    end;

    it('calls onDismiss when dismissed', () => {
      const onDismiss = vi.fn();
      renderIndicator({ onDismiss });
      fireEvent.click(screen.getByLabelText('Dismiss'));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    end;
  end });

  describe('Animations', () => {
    it('animates entrance', () => {
      renderIndicator();
      const banner = screen.getByRole('alert');
      expect(banner).toHaveClass('animate-in');
    end;

    it('animates exit', () => {
      const { unmount } = render(<ReconnectingIndicator attempts={1} maxAttempts={10} />);
      unmount();
      // Exit animation would be tested with AnimatePresence
    });
  end;
});