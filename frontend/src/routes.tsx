import { lazy, Suspense } from 'react';
import { LoadingPage } from './components/ui/LoadingPage';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Control = lazy(() => import('./pages/Control'));
const Events = lazy(() => import('./pages/Events'));
const Settings = lazy(() => import('./pages/Settings'));
const Calibration = lazy(() => import('./pages/Calibration'));

export const routes = [
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingPage />}>
        <Dashboard />
      </Suspense>
    ),
  },
  {
    path: '/alerts',
    element: (
      <Suspense fallback={<LoadingPage />}>
        <Alerts />
      </Suspense>
    ),
  },
  {
    path: '/control',
    element: (
      <Suspense fallback={<LoadingPage />}>
        <Control />
      </Suspense>
    ),
  },
  {
    path: '/events',
    element: (
      <Suspense fallback={<LoadingPage />}>
        <Events />
      </Suspense>
    ),
  },
  {
    path: '/settings',
    element: (
      <Suspense fallback={<LoadingPage />}>
        <Settings />
      </Suspense>
    ),
  },
  {
    path: '/calibration',
    element: (
      <Suspense fallback={<LoadingPage />}>
        <Calibration />
      </Suspense>
    ),
  },
];

export default routes;