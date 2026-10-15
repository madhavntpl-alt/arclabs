import { Github, Twitter, Link } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-4">ARC LABS</h3>
            <p className="text-secondary-600 dark:text-secondary-400 text-sm mb-4 max-w-md">
              Environmental monitoring platform for hydroponic and aquaponic systems.
              Real-time sensors, automated control, and intelligent alerting.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/arc-labs/monitoring"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/arc_labs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://arc-labs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label="Website"
              >
                <Link className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/dashboard" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Dashboard</a></li>
              <li><a href="/alerts" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Alerts</a></li>
              <li><a href="/control" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Control</a></li>
              <li><a href="/events" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Events</a></li>
              <li><a href="/settings" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Settings</a></li>
              <li><a href="/calibration" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Calibration</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://docs.arc-labs.com" target="_blank" rel="noopener noreferrer" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Documentation</a></li>
              <li><a href="https://github.com/arc-labs/monitoring/issues" target="_blank" rel="noopener noreferrer" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Report Issue</a></li>
              <li><a href="https://github.com/arc-labs/monitoring/discussions" target="_blank" rel="noopener noreferrer" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Discussions</a></li>
              <li><a href="/changelog" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Changelog</a></li>
              <li><a href="/api" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">API Reference</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-secondary-200 dark:border-secondary-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              © {currentYear} ARC LABS. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/privacy" className="text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</a>
              <a href="/license" className="text-secondary-500 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">License (MIT)</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;