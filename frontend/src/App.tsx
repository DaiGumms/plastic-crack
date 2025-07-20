import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { Layout } from './components/layout/Layout';
import { NotificationContainer } from './components/ui/NotificationContainer';
import { ProtectedRoute, PublicRoute } from './components/auth/RouteGuards';
import PerformanceMonitor from './components/PerformanceMonitor';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { OfflineIndicator } from './components/error/OfflineHandler';

// Pages
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { BetaInterestPage } from './pages/BetaInterestPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CollectionDetailPage } from './pages/CollectionDetailPage';
import ModelsPage from './pages/ModelsPage';
import UploadTestingPage from './pages/UploadTestingPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <PerformanceMonitor />
          <OfflineIndicator />
          <Router>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path='/' element={<HomePage />} />
                <Route path='/beta-interest' element={<BetaInterestPage />} />
                <Route path='/user/:userId' element={<PublicProfilePage />} />
                <Route path='/test-upload' element={<UploadTestingPage />} />

                {/* Authentication Routes */}
                <Route
                  path='/auth/login'
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path='/auth/register'
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path='/auth/reset-password'
                  element={
                    <PublicRoute redirectIfAuthenticated={false}>
                      <ResetPasswordPage />
                    </PublicRoute>
                  }
                />
                {/* Legacy routes for backward compatibility */}
                <Route
                  path='/login'
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path='/register'
                  element={
                    <PublicRoute>
                      <RegisterPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path='/reset-password'
                  element={
                    <PublicRoute redirectIfAuthenticated={false}>
                      <ResetPasswordPage />
                    </PublicRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path='/dashboard'
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/profile'
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path='/collections' element={<CollectionsPage />} />
                <Route
                  path='/collections/:id'
                  element={<CollectionDetailPage />}
                />
                <Route
                  path='/models'
                  element={
                    <ProtectedRoute>
                      <ModelsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/settings'
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route - will be implemented later */}
                <Route
                  path='*'
                  element={
                    <div className='text-center py-12'>
                      <h1 className='text-2xl font-bold text-gray-900'>
                        Page Not Found
                      </h1>
                    </div>
                  }
                />
              </Routes>
              <NotificationContainer />
            </Layout>
          </Router>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
