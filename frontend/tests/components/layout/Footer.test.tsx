import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../../components/layout/Footer';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Github: () => <svg data-testid="github-icon" />,
  Twitter: () => <svg data-testid="twitter-icon" />,
  Link: () => <svg data-testid="link-icon" />,
}));

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderFooter = () => {
    return render(<Footer />);
  };

  describe('Rendering', () => {
    it('renders footer element', () => {
      renderFooter();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('renders brand name', () => {
      renderFooter();
      expect(screen.getByText('ARC LABS')).toBeInTheDocument();
    });

    it('renders tagline', () => {
      renderFooter();
      expect(screen.getByText(/Environmental monitoring platform/)).toBeInTheDocument();
    });

    it('renders current year', () => {
      renderFooter();
      const currentYear = new Date().getFullYear().toString();
      expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('renders product links', () => {
      renderFooter();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Alerts')).toBeInTheDocument();
      expect(screen.getByText('Control')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Calibration')).toBeInTheDocument();
    });

    it('renders resource links', () => {
      renderFooter();
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Report Issue')).toBeInTheDocument();
      expect(screen.getByText('Discussions')).toBeInTheDocument();
      expect(screen.getByText('Changelog')).toBeInTheDocument();
      expect(screen.getByText('API Reference')).toBeInTheDocument();
    });

    it('renders legal links', () => {
      renderFooter();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('License (MIT)')).toBeInTheDocument();
    });
  });

  describe('Social Links', () => {
    it('renders GitHub icon', () => {
      renderFooter();
      expect(screen.getByTestId('github-icon')).toBeInTheDocument();
    });

    it('renders Twitter icon', () => {
      renderFooter();
      expect(screen.getTestId('twitter-icon')).toBeInTheDocument();
    });

    it('renders Website icon', () => {
      renderFooter();
      expect(screen.getTestId('link-icon')).toBeInTheDocument();
    });

    it('has correct href attributes', () => {
      renderFooter();
      const githubLink = screen.getByTestId('github-icon').closest('a');
      expect(githubLink).toHaveAttribute('href', 'https://github.com/arc-labs/monitoring');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Styling', () => {
    it('has correct background colors', () => {
      renderFooter();
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('bg-white');
      expect(footer).toHaveClass('dark:bg-secondary-900');
    });

    it('has border', () => {
      renderFooter();
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('border-secondary-200');
      expect(footer).toHaveClass('dark:border-secondary-700');
    });
  });

  describe('Responsive Layout', () => {
    it('uses grid layout', () => {
      renderFooter();
      const container = screen.getByRole('contentinfo').querySelector('.grid');
      expect(container).toHaveClass('grid');
      expect(container).toHaveClass('md:grid-cols-4');
    });

    it('spans brand across two columns on md', () => {
      renderFooter();
      const brandSection = screen.getByText('ARC LABS').closest('div');
      expect(brandSection).toHaveClass('md:col-span-2');
    });
  });

  describe('Accessibility', () {
    it('has proper landmark role', () => {
      renderFooter();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('external links have proper attributes', () => {
      renderFooter();
      const externalLinks = screen.getAllByRole('link', { name: /github|twitter|website/i });
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('internal links do not have external attributes', () => {
      renderFooter();
      const internalLinks = screen.getAllByRole('link', { name: /dashboard|alerts|control|events|settings|calibration/i });
      internalLinks.forEach(link => {
        expect(link).not.toHaveAttribute('target');
        expect(link).not.toHaveAttribute('rel');
      });
    });
  });

  describe('Styling', () {
    it('has proper padding', () => {
      renderFooter();
      const container = screen.getByRole('contentinfo').querySelector('.max-w-7xl');
      expect(container).toHaveClass('px-4');
      expect(container).toHaveClass('sm:px-6');
      expect(container).toHaveClass('lg:px-8');
      expect(container).toHaveClass('py-8');
    });

    it 'has proper bottom bar styling', () => {
      renderFooter();
      const bottomBar = screen.getByText(/© \d{4} ARC LABS/).closest('div');
      expect(bottomBar).toHaveClass('mt-8');
      expect(bottomBar).toHaveClass('pt-8');
      expect(bottomBar).toHaveClass('border-t');
    });
  });

  describe('Copyright', () => {
    it('displays copyright with current year', () => {
      renderFooter();
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} ARC LABS`))).toBeInTheDocument();
    });

    it('has rights reserved text', () => {
      renderFooter();
      expect(screen.getByText('All rights reserved')).toBeInTheDocument();
    });
  });
});