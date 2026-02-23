import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from './AppSidebar';
import { IntegratedNotificationBell } from '@/components/common/IntegratedNotificationBell';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex w-full h-screen bg-background">
      {/* Sidebar Component */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-[280px]">
        {/* Header Bar */}
        <header className="sticky top-0 z-40 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-full items-center justify-between px-6">
            <div className="text-foreground font-semibold">
              Welcome, {user.name}
            </div>
            <IntegratedNotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
