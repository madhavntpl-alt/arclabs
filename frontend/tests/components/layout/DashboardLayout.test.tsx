import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useUIStore } from '../../store/uiStore';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}));

vi.mock('../../store/uiStore', () => ({
  useUIStore: vi.fn(),
}));

vi.mock('../../components/layout/Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('../../components/layout/Sidebar', () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar</aside>,
}));

vi.mock('../../components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

describe('DashboardLayout', () => {
  const mockUseUIStore = vi.mocked(require('../../store/uiStore').useUIStore);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUIStore.mockReturnValue({
      sidebarOpen: true,
      sidebarCollapsed: false,
      toggleSidebar: vi.fn(),
      setSidebarOpen: vi.fn(),
      setSidebarCollapsed: vi.fn(),
    });
  });

  const renderLayout = () => {
    return render(<DashboardLayout />);
  };

  describe('Rendering', () => {
    it('renders header', () => {
      renderLayout();
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('renders sidebar', () => {
      renderLayout();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('renders footer', () => {
      renderLayout();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders outlet content', () => {
      renderLayout();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
  });

  describe('Sidebar State', () => {
    it('applies expanded sidebar classes when not collapsed', () => {
      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: false,
        toggleSidebar: vi.fn(),
        setSidebarOpen: vi.fn(),
        setSidebarCollapsed: vi.fn(),
      });

      renderLayout();
      const main = screen.getByRole('main');
      expect(main).toHaveClass('lg:pl-64');
    });

    it('applies collapsed sidebar classes when collapsed', () => {
      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: true,
        toggleSidebar: vi.fn(),
        setSidebarOpen: vi.fn(),
        setSidebarCollapsed: vi.fn(),
      });

      renderLayout();
      const main = screen.getByRole('main');
      expect(main).toHaveClass('lg:pl-16');
    });
  });

  describe('Responsive Classes', () => {
    it('applies correct margin classes based on sidebar state', () => {
      mockUseUIStore.mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: false,
        toggleSidebar: vi.fn(),
        setSidebarOpen: vi.fn(),
        setSidebarCollapsed: vi.fn(),
      });

      renderLayout();
      const main = screen.getByRole('main');
      expect(main).toHaveClass('lg:ml-64');
      expect(main).not.toHaveClass('lg:ml-16');

      vi.mocked(require('../../store/uiStore').useUIStore).mockReturnValue({
        sidebarOpen: true,
        sidebarCollapsed: true,
        toggleSidebar: vi.fn(),
        setSidebarOpen: vi.fn(),
        setSidebarCollapsed: vi.fn(),
      });

      renderLayout();
      const mainCollapsed = screen.getByRole('main');
      expect(mainCollapsed).toHaveClass('lg:ml-16');
      expect(mainCollapsed).not.toHaveClass('lg:ml-64');
    });
  });

  describe('Structure', () => {
    it('has correct flex structure', () => {
      renderLayout();
      const container = screen.getByTestId('dashboard-layout');
      expect(container).toHaveClass('min-h-screen');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('flex-col');
    });

    it('has main content area with correct classes', () => {
      renderLayout();
      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex-1');
      expect(main).toHaveClass('p-4');
      expect(main).toHaveClass('lg:p-6');
      expect(main).toHaveClass('transition-all');
      expect(main).toHaveClass('duration-300');
    });

    it('main has id for accessibility', () => {
      renderLayout();
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Integration with Stores', () => {
    it('subscribes to sidebarCollapsed from uiStore', () => {
      const mockStore = {
        sidebarOpen: true,
        sidebarCollapsed: false,
        toggleSidebar: vi.fn(),
        setSidebarOpen: vi.fn(),
        setSidebarCollapsed: vi.fn(),
      };
      mockUseUIStore.mockReturnValue(mockStore);

      renderLayout();

      // Verify the store was accessed
      expect(require('../../store/uiStore').useUIStore).toHaveBeenCalled();
    });
  });
});