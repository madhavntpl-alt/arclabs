import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useUIStore } from '../../store/uiStore';
import { clsx } from 'clsx';

export function DashboardLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className={clsx('flex flex-1', sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64')}>
        <Sidebar />
        <main
          className={clsx(
            'flex-1 p-4 lg:p-6 transition-all duration-300',
            sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          )}
          id="main-content"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default DashboardLayout;