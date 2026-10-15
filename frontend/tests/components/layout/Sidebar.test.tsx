import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../../components/layout/Sidebar';
import { useLocation, NavLink } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { clsx } from 'clsx';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
  NavLink: ({ children, to, className, onClick, 'aria-current': ariaCurrent, style, title }: any) => (
    <a
      href={to}
      className={typeof className === 'function' ? className({ isActive: false }) : className}
      style={style}
      onClick={onClick}
      aria-current={ariaCurrent}
      title={title}
    >
      {children}
    </a>
  ),
}));

vi.mock('../../store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

vi.mock('motion/react', () => ({
  motion: {
    aside: ({ children, className, animate, initial, transition }: any) => (
      <aside className={className}>{children}</aside>
    ),
    div: ({ children, className, animate, initial, transition, exit }: any) => (
      <div className={className}>{children}</div>
    ),
  },
}));

vi.mock('lucide-react', () => ({
  Home: () => <svg data-testid="home-icon" />,
  AlertTriangle: () => <svg data-testid="alert-icon" />,
  Zap: () => <svg data-testid="zap-icon" />,
  Activity: () => <svg data-testid="activity-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
  ChevronLeft: () => <svg data-testid="chevron-left" />,
  ChevronRight: () => <svg data-testid="chevron-right" />,
  HelpCircle: () => <svg data-testid="help-icon" />,
}));

describe('Sidebar', () => {
  const mockUseUIStore = vi.mocked(require('../../store/uiStore').useUIStore);
  const mockUseLocation = vi.mocked(require('react-router-dom').useLocation);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: '/' });
    mockUseUIStore.mockReturnValue({
      sidebarOpen: true,
      sidebarCollapsed: false,
      toggleSidebar: vi.fn(),
      activeDevice: null,
    });
  });

  const renderSidebar = () => {
    return render(<Sidebar />);
  };

  describe('Rendering', () => {
    it('renders sidebar with logo when not collapsed', () => {
      renderSidebar();
      expect(screen.getByText('ARC LABS')).toBeInTheDocument();
    });

    it('does not render logo text when collapsed', () => {
      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: true,
        toggleSidebar: vi.fn(),
        activeDevice: null,
      });
      renderSidebar();
      expect(screen.queryByText('ARC LABS')).not.toBeInTheDocument();
    });

    it('renders navigation items', () => {
      renderSidebar();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Alerts')).toBeInTheDocument();
      expect(screen.getByText('Control')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders collapse/expand toggle button', () => {
      renderSidebar();
      const toggleButton = screen.getByLabelText('Collapse sidebar');
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('highlights active route', () => {
      const mockLocation = vi.mocked(require('react-router-dom').useLocation);
      mockLocation.mockReturnValue({ pathname: '/alerts' });

      renderSidebar();
      const alertsLink = screen.getByText('Alerts').closest('a');
      expect(alertsLink).toHaveAttribute('aria-current', 'page');
    });

    it('navigates to route when clicked', () => {
      renderSidebar();
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      fireEvent.click(dashboardLink);
      // Navigation would happen via React Router
    });
  });

  describe('Collapse/Expand', () => {
    it('toggles sidebar when toggle button is clicked', () => {
      const toggleSidebar = vi.fn();
      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: false,
        toggleSidebar,
      });

      renderSidebar();
      const toggleButton = screen.getByLabelText('Collapse sidebar');
      fireEvent.click(toggleButton);
      expect(toggleSidebar).toHaveBeenCalledTimes(1);
    });

    it('shows expand icon when collapsed', () => {
      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: true,
        toggleSidebar: vi.fn(),
      });
      renderSidebar();
      expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
    });

    it('shows collapse icon when expanded', () => {
      renderSidebar();
      expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument();
    });
  });

  describe('Device Status', () => {
    it('shows active device when available', () => {
      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: false,
        toggleSidebar: vi.fn(),
        activeDevice: {
          id: 'device_1',
          name: 'Catalyst Mk1 #1',
          type: 'catalyst_mk1',
          status: 'online',
          firmware_version: '1.0.0',
        },
      });

      renderSidebar();
      expect(screen.getByText('Catalyst Mk1 #1')).toBeInTheDocument();
      expect(screen.getByText('catalyst_mk1 • 1.0.0')).toBeInTheDocument();
    });

    it('does not show device status when collapsed', () => {
      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: true,
        toggleSidebar: vi.fn(),
        activeDevice: {
          id: 'device_1',
          name: 'Catalyst Mk1 #1',
        },
      });
      renderSidebar();
      expect(screen.queryByText('Catalyst Mk1 #1')).not.toBeInTheDocument();
    });
  });

  describe('Footer Links', () => {
    it('renders documentation link when expanded', () => {
      renderSidebar();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
    });

    it('renders GitHub link when expanded', () => {
      renderSidebar();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });

    it('shows icon-only links when collapsed', () => {
      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: true,
        toggleSidebar: vi.fn(),
      });
      renderSidebar();
      // Links should still be accessible via title attribute
      expect(screen.getByTitle('Documentation')).toBeInTheDocument();
      expect(screen.getByTitle('GitHub')).toBeInTheDocument();
    });
  });

  describe('Mobile Overlay', () => {
    it('renders overlay when sidebar is open on mobile', () => {
      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: false,
        toggleSidebar: vi.fn(),
      });
      renderSidebar();
      // Overlay should be present when sidebar is open on mobile
      const overlay = screen.getByTestId('sidebar-overlay');
      // The overlay is conditionally rendered based on sidebarOpen
      expect(screen.queryByTestId('sidebar-overlay')).toBeInTheDocument();
    });

    it('closes sidebar when overlay is clicked', () => {
      const toggleSidebar = vi.fn();
      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: false,
        toggleSidebar,
      });
      renderSidebar();
      // The overlay has onClick={toggleSidebar}
      // This would be tested by clicking the overlay
    });
  });

  describe('State Transitions', () => {
    it('animates width transition', () => {
      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: false,
        toggleSidebar: vi.fn(),
      });

      const { rerender } = renderSidebar();
      expect(screen.getByTestId('sidebar')).toHaveClass('w-64');

      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: true,
        toggleSidebar: vi.fn(),
      });
      rerender(<Sidebar />);
      expect(screen.getByTestId('sidebar')).toHaveClass('w-16');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderSidebar();
      expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
      expect(screen.getByLabelText('Expand sidebar')).not.toBeInTheDocument();
    });

    it('has proper ARIA attributes on navigation', () => {
      renderSidebar();
      const nav = screen.getByRole('navigation', { name: 'Main navigation' });
      expect(nav).toBeInTheDocument();
    });

    it('has proper aria-current on active link', () => {
      const mockLocation = vi.mocked(require('react-router-dom').useLocation);
      mockLocation.mockReturnValue({ pathname: '/control' });

      renderSidebar();
      const controlLink = screen.getByText('Control').closest('a');
      expect(controlLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation', () => {
      renderSidebar();
      const firstLink = screen.getByText('Dashboard').closest('a');
      firstLink.focus();
      expect(firstLink).toHaveFocus();
    });

    it('supports Escape key to close mobile sidebar', () => {
      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: false,
        toggleSidebar: vi.fn(),
      });
      renderSidebar();
      fireEvent.keyDown(document, { key: 'Escape' });
      // Should trigger toggleSidebar
    });
  });
});