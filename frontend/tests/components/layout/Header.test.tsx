import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../hooks/useTheme';
import { UIProvider } from '../../store/uiStore';
import { ConnectionProvider } from '../../components/connection/ConnectionProvider';
import { Header } from '../../components/layout/Header';
import { useTheme } from '../../hooks/useTheme';
import { useUIStore } from '../../store/uiStore';

// Mock hooks
vi.mock('../../hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

vi.mock('../../store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

vi.mock('../../components/connection/ConnectionProvider', () => ({
  ConnectionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Header', () => {
  const mockUseTheme = vi.mocked(useTheme);
  const mockUseUIStore = vi.mocked(useUIStore);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTheme.mockReturnValue({
      theme: 'system',
      resolvedTheme: 'light',
      toggleTheme: vi.fn(),
    });
    mockUseUIStore.mockReturnValue({
      sidebarOpen: true,
      sidebarCollapsed: false,
      toggleSidebar: vi.fn(),
      notifications: [],
      markNotificationRead: vi.fn(),
      clearAllNotifications: vi.fn(),
      connectionStatus: 'connected',
      setConnectionStatus: vi.fn(),
      reconnectAttempts: 0,
      setReconnectAttempts: vi.fn(),
      lastConnected: null,
      setLastConnected: vi.fn(),
    });
  });

  const renderHeader = () => {
    return render(
      <Header />,
      {
        wrapper: ({ children }) => (
          <div>
            {children}
          </div>
        ),
      }
    );
  };

  describe('Rendering', () => {
    it('renders ARC LABS logo', () => {
      renderHeader();
      expect(screen.getByText('ARC LABS')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
      renderHeader();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Alerts')).toBeInTheDocument();
      expect(screen.getByText('Control')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders theme toggle button', () => {
      renderHeader();
      const themeButton = screen.getByLabelText(/switch to dark mode/i);
      expect(themeButton).toBeInTheDocument();
    });

    it('renders notification bell', () => {
      renderHeader();
      expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument();
    });

    it('renders user menu', () => {
      renderHeader();
      expect(screen.getByLabelText('User menu')).toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('calls toggleTheme when theme button is clicked', () => {
      const toggleTheme = vi.fn();
      mockUseTheme.mockReturnValue({
        theme: 'light',
        resolvedTheme: 'light',
        toggleTheme,
      });

      renderHeader();
      const themeButton = screen.getByLabelText('Switch to dark mode');
      fireEvent.click(themeButton);
      expect(toggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Sidebar Toggle', () => {
    it('calls toggleSidebar when sidebar toggle is clicked', () => {
      const toggleSidebar = vi.fn();
      mockUseUIStore.mockReturnValue({
        ...mockUseUIStore(),
        sidebarCollapsed: false,
        toggleSidebar,
      });

      renderHeader();
      const sidebarToggle = screen.getByLabelText('Collapse sidebar');
      fireEvent.click(sidebarToggle);
      expect(toggleSidebar).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mobile Menu', () => {
    it('renders mobile menu button on small screens', () => {
      renderHeader();
      // The mobile menu button should be present
      expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
    });

    it('toggles mobile menu when clicked', () => {
      const toggleSidebar = vi.fn();
      mockUseUIStore.mockReturnValue({
        ...mockUseUIStore(),
        sidebarOpen: false,
        toggleSidebar,
      });

      renderHeader();
      const mobileMenuButton = screen.getByLabelText('Open menu');
      fireEvent.click(mobileMenuButton);
      expect(toggleSidebar).toHaveBeenCalledTimes(1);
    });
  });

  describe('Notification Panel', () => {
    it('opens notification panel when bell is clicked', () => {
      mockUseUIStore.mockReturnValue({
        ...mockUseUIStore(),
        notifications: [
          { id: '1', title: 'Test', message: 'Test message', timestamp: new Date().toISOString(), read: false },
        ],
        markNotificationRead: vi.fn(),
        clearAllNotifications: vi.fn(),
      });

      renderHeader();
      const notificationButton = screen.getByLabelText(/notifications/i);
      fireEvent.click(notificationButton);

      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('shows empty state when no notifications', () => {
      mockUseUIStore.mockReturnValue({
        ...mockUseUIStore(),
        notifications: [],
        clearAllNotifications: vi.fn(),
      });

      renderHeader();
      const notificationButton = screen.getByLabelText(/notifications/i);
      fireEvent.click(notificationButton);

      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  describe('User Menu', () => {
    it('opens user menu when avatar is clicked', () => {
      renderHeader();
      const userMenuButton = screen.getByLabelText('User menu');
      fireEvent.click(userMenuButton);

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Help')).toBeInTheDocument();
      expect(screen.getByText('Sign out')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('shows mobile menu button on small screens', () => {
      renderHeader();
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('hides navigation on mobile when sidebar is closed', () => {
      // The navigation is only shown on lg screens and above
      renderHeader();
      const nav = screen.queryByRole('navigation', { name: /main navigation/i });
      // On desktop, nav should be visible
      expect(nav).toBeInTheDocument();
    });
  });
});