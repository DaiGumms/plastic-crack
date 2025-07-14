import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Route guard that requires authentication
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = ({
  children,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600'></div>
      </div>
    );
  }

  // Redirect to login if not authenticated, preserving the attempted URL
  if (!isAuthenticated) {
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  return <>{children}</>;
};

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
}

/**
 * Route guard for public pages (like login/register)
 * Optionally redirects authenticated users away from these pages
 */
export const PublicRoute = ({
  children,
  redirectTo = '/',
  redirectIfAuthenticated = true,
}: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600'></div>
      </div>
    );
  }

  // Redirect authenticated users away from public-only pages (like login)
  if (isAuthenticated && redirectIfAuthenticated) {
    // Check if there's a "from" location to redirect back to
    const from = location.state?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

/**
 * Route guard for admin-only pages
 */
export const AdminRoute = ({
  children,
  redirectTo = '/',
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600'></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // Redirect if not admin
  if (user?.role !== 'ADMIN') {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
