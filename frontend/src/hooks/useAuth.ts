import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Authentication hook that provides auth state and actions
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    checkAuthStatus,
  } = useAuthStore();

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    clearError,

    // Computed values
    isAdmin: user?.role === 'ADMIN',
    isEmailVerified: user?.isEmailVerified ?? false,
  };
};

/**
 * Hook for checking if user has specific permissions
 */
export const usePermissions = () => {
  const { user } = useAuthStore();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // For now, only admin has all permissions
    // This can be extended later with a proper permission system
    if (user.role === 'ADMIN') return true;

    // Add specific permission checks here
    switch (permission) {
      case 'profile.edit':
        return true; // All authenticated users can edit their own profile
      case 'profile.delete':
        return true; // All authenticated users can delete their own account
      default:
        return false;
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER';

  return {
    hasPermission,
    isAdmin,
    isUser,
  };
};
