import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAppStore } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import { tokenRefreshService } from '../../services/tokenRefreshService';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDarkMode } = useAppStore();
  const location = useLocation();

  // Initialize authentication status on app load
  useAuth();

  // Start token refresh service
  React.useEffect(() => {
    tokenRefreshService.start();

    return () => {
      tokenRefreshService.stop();
    };
  }, []);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Determine if we should show header/footer based on route
  const isAuthPage = ['/login', '/register', '/reset-password'].includes(
    location.pathname
  );
  const shouldShowFooter = !isAuthPage;

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900 flex flex-col'>
      {!isAuthPage && <Header />}
      <main className={isAuthPage ? '' : 'flex-1'}>{children}</main>
      {shouldShowFooter && <Footer />}
    </div>
  );
};
