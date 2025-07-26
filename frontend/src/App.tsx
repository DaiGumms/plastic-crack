import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { PublicProfilePage } from './pages/PublicProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CollectionDetailPage } from './pages/CollectionDetailPage';
import ModelsPage from './pages/ModelsPage';
import UploadTestingPage from './pages/UploadTestingPage';
import { PriceTrackingPage } from './pages/PriceTrackingPage';
import { AIFeaturesPage } from './pages/AIFeaturesPage';
import { HelpMentorshipPage } from './pages/HelpMentorshipPage';
import { BattleReportsGamingPage } from './pages/BattleReportsGamingPage';
import { WishlistSystemPage } from './pages/WishlistSystemPage';
import { PaintingSystemPage } from './pages/PaintingSystemPage';
import { MobileAppPage } from './pages/MobileAppPage';

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
                <Route path='/mobile-app' element={<MobileAppPage />} />
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
                  element={<Navigate to='/settings' replace />}
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
                <Route
                  path='/price-tracking'
                  element={
                    <ProtectedRoute>
                      <PriceTrackingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/ai-features'
                  element={
                    <ProtectedRoute>
                      <AIFeaturesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/help-mentorship'
                  element={
                    <ProtectedRoute>
                      <HelpMentorshipPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/battle-reports'
                  element={
                    <ProtectedRoute>
                      <BattleReportsGamingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/wishlist'
                  element={
                    <ProtectedRoute>
                      <WishlistSystemPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/painting'
                  element={
                    <ProtectedRoute>
                      <PaintingSystemPage />
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
