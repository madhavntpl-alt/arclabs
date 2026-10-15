import { useLocation, NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Home, AlertTriangle, Zap, Activity, Settings, Thermometer, Droplet, Wind, Battery, AlertCircle, HelpCircle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Control', href: '/control', icon: Zap },
  { name: 'Events', href: '/events', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, activeDevice } = useUIStore();

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-700 transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
        animate={{ width: sidebarCollapsed ? 64 : 256 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        aria-label="Sidebar navigation"
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-200 dark:border-secondary-700">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 transition-opacity duration-200">
              ARC LABS
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className={clsx(
              'p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors',
              sidebarCollapsed && 'ml-auto'
            )}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Main navigation">
          {navigation.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  'overflow-hidden',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 dark:text-secondary-400 dark:hover:text-secondary-100 dark:hover:bg-secondary-800'
                )}
                style={{ width: sidebarCollapsed ? '100%' : 'auto' }}
                aria-current={isActive ? 'page' : undefined}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className={clsx('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600 dark:text-primary-400')} aria-hidden="true" />
                {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Device selector (when not collapsed) */}
        {!sidebarCollapsed && activeDevice && (
          <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary-50 dark:bg-primary-900/30">
              <div className="w-2 h-2 rounded-full bg-success-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300 truncate">
                  {activeDevice.name}
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400 truncate">
                  {activeDevice.type} • {activeDevice.firmware_version}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
          {!sidebarCollapsed ? (
            <div className="space-y-2">
              <a
                href="https://docs.arc-labs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                <span>Documentation</span>
              </a>
              <a
                href="https://github.com/arc-labs/monitoring"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                <span>GitHub</span>
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <a
                href="https://docs.arc-labs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                title="Documentation"
              >
                <HelpCircle className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/arc-labs/monitoring"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                title="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: sidebarCollapsed ? 0 : 1 }}
        exit={{ opacity: 0 }}
        onClick={toggleSidebar}
        aria-hidden="true"
      />
    </>
  );
}

export default Sidebar;