import { useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Sun, Moon, Bell, Settings, HelpCircle, ChevronDown, LogOut, User, Home, AlertTriangle, Zap, Activity, Settings as SettingsIcon, Thermometer, Droplet, Wind, Battery, AlertCircle, Bell as BellIcon, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useUIStore } from '../../store/uiStore';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Control', href: '/control', icon: Zap },
  { name: 'Events', href: '/events', icon: Activity },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

const sensorIcons = {
  water_level: Droplet,
  temperature: Thermometer,
  humidity: Droplet,
  gas: Wind,
  battery: Battery,
};

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { sidebarOpen, toggleSidebar, notifications, markNotificationRead, clearAllNotifications } = useUIStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-lg border-b border-secondary-200 dark:border-secondary-700">
      {/* Mobile menu button */}
      <div className="lg:hidden px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">ARC LABS</h1>
        </div>

        <div className="w-10" />
      </div>

      {/* Main header */}
      <div className="hidden lg:flex lg:items-center lg:justify-between lg:px-6 lg:py-3">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">ARC LABS</h1>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navigation.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 dark:text-secondary-400 dark:hover:text-secondary-100 dark:hover:bg-secondary-800'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={showNotifications}
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-96 bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-elevated overflow-hidden"
                >
                  <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
                    <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => { clearAllNotifications(); setShowNotifications(false); }}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-secondary-500 dark:text-secondary-400">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 10).map(notification => (
                        <button
                          key={notification.id}
                          onClick={() => { markNotificationRead(notification.id); }}
                          className={clsx(
                            'w-full p-3 text-left hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors',
                            !notification.read && 'bg-primary-50/50 dark:bg-primary-900/20'
                          )}
                        >
                          <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">{notification.title}</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{notification.message}</p>
                          <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                  {notifications.length > 10 && (
                    <div className="p-3 border-t border-secondary-200 dark:border-secondary-700 text-center">
                      <a href="/events" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                        View all notifications
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              aria-expanded={showUserMenu}
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <ChevronDown className="w-4 h-4 text-secondary-500" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-elevated overflow-hidden"
                >
                  <div className="p-3 border-b border-secondary-200 dark:border-secondary-700">
                    <p className="font-medium text-secondary-900 dark:text-secondary-100">User Name</p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">user@arc-labs.com</p>
                  </div>
                  <nav className="py-1">
                    <button className="w-full px-3 py-2 text-left text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Help
                    </button>
                  </nav>
                  <div className="p-2 border-t border-secondary-200 dark:border-secondary-700">
                    <button
                      onClick={() => { /* logout logic */ }}
                      className="w-full px-3 py-2 text-left text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-secondary-900 z-50 lg:hidden shadow-elevated"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
                <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">ARC LABS</h1>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navigation.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 dark:text-secondary-400 dark:hover:text-secondary-100 dark:hover:bg-secondary-800'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}