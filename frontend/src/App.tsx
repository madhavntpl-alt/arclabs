import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Alerts } from './pages/Alerts';
import { Control } from './pages/Control';
import { Events } from './pages/Events';
import { Settings } from './pages/Settings';
import { Calibration } from './pages/Calibration';
import { ConnectionProvider } from './components/connection/ConnectionProvider';
import { ThemeProvider } from './hooks/useTheme';
import { Toaster } from './components/ui/Toaster';

function App() {
  return (
    <ThemeProvider>
      <ConnectionProvider>
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 transition-colors duration-300">
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="control" element={<Control />} />
              <Route path="events" element={<Events />} />
              <Route path="settings" element={<Settings />} />
              <Route path="calibration" element={<Calibration />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </ConnectionProvider>
    </ThemeProvider>
  );
}

export default App;