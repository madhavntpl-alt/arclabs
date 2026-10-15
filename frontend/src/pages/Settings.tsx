'use client';

import { motion } from 'motion/react';
import { useTheme } from '../../hooks/useTheme';
import { useUIStore } from '../../store/uiStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Toggle';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { clsx } from 'clsx';
import { Moon, Sun, Monitor, Bell, Shield, Database, Wifi, Palette, Key, Trash2, Download, Upload } from 'lucide-react';

export function Settings() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [wsUrl, setWsUrl] = useState(import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/live');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  return (
    <div className={clsx('space-y-6', sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64')}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Settings</h1>
        <p className="text-secondary-600 dark:text-secondary-400 mt-1">Configure your monitoring platform</p>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <div className="p-5 border-b border-secondary-200 dark:border-secondary-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Appearance</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Customize how the dashboard looks</p>
            </div>
          </div>
          <div className="p-5 space-y-6">
            <div>
              <label className="label">Theme</label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {(['light', 'dark', 'system'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={clsx(
                      'p-4 rounded-lg border-2 transition-all text-center',
                      theme === t
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-700'
                    )}
                  >
                    {t === 'light' && <Sun className="w-6 h-6 mx-auto mb-2" />}
                    {t === 'dark' && <Moon className="w-6 h-6 mx-auto mb-2" />}
                    {t === 'system' && <Monitor className="w-6 h-6 mx-auto mb-2" />}
                    <span className="text-sm font-medium capitalize">{t}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Sidebar</label>
              <div className="mt-2">
                <Toggle
                  checked={sidebarCollapsed}
                  onChange={setSidebarCollapsed}
                  label="Collapse sidebar by default"
                  description="Automatically collapse the sidebar on desktop"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <div className="p-5 border-b border-secondary-200 dark:border-secondary-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Notifications</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Configure alert notifications</p>
            </div>
          </div>
          <div className="p-5 space-y-6">
            <div>
              <Toggle
                checked={notificationsEnabled}
                onChange={setNotificationsEnabled}
                label="Enable notifications"
                description="Receive browser notifications for alerts"
              />
            </div>
            <div>
              <Toggle
                checked={autoRefresh}
                onChange={setAutoRefresh}
                label="Auto-refresh data"
                description="Automatically refresh sensor data"
              />
            </div>
            <div>
              <label className="label">Refresh interval (seconds)</label>
              <Input
                type="number"
                value={refreshInterval}
                onChange={e => setRefreshInterval(parseInt(e.target.value) || 30)}
                min={5}
                max={300}
                className="w-32"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Connection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <div className="p-5 border-b border-secondary-200 dark:border-secondary-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Connection</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">API and WebSocket endpoints</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="label">API URL</label>
              <Input value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="http://localhost:8000" />
            </div>
            <div>
              <label className="label">WebSocket URL</label>
              <Input value={wsUrl} onChange={e => setWsUrl(e.target.value)} placeholder="ws://localhost:8000/ws/live" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>Export Config</Button>
              <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />}>Import Config</Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <div className="p-5 border-b border-secondary-200 dark:border-secondary-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-danger-600 dark:text-danger-400" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Security</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Manage authentication and access</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100">API Key Authentication</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Enable API key authentication for external access</p>
              </div>
              <Toggle checked={false} onChange={() => {}} label="Enabled" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100">Two-Factor Authentication</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Require 2FA for admin access</p>
              </div>
              <Toggle checked={false} onChange={() => {}} label="Enabled" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card className="border-danger-200 dark:border-danger-800">
          <div className="p-5 border-b border-secondary-200 dark:border-secondary-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-danger-600 dark:text-danger-400" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Danger Zone</h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Irreversible actions</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
              <div>
                <h4 className="font-medium text-danger-700 dark:text-danger-300">Reset All Data</h4>
                <p className="text-sm text-danger-600 dark:text-danger-400">Delete all sensor data, events, and alerts. This cannot be undone.</p>
              </div>
              <Button variant="danger" size="sm">Reset Data</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200 dark:border-danger-800">
              <div>
                <h4 className="font-medium text-danger-700 dark:text-danger-300">Factory Reset</h4>
                <p className="text-sm text-danger-600 dark:text-danger-400">Reset all settings to defaults and clear all data. This cannot be undone.</p>
              </div>
              <Button variant="danger" size="sm">Factory Reset</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';