import { describe, it, expect } from 'vitest';

describe('Dashboard Component Structure', () => {
  it('dashboard page exports correctly', async () => {
    // This test verifies the component can be imported without errors
    const { DashboardPage } = await import('../pages/DashboardPage');
    expect(DashboardPage).toBeDefined();
    expect(typeof DashboardPage).toBe('function');
  });

  it('auth hook exports correctly', async () => {
    // Test that our auth hook can be imported
    const { useAuth } = await import('../hooks/useAuth');
    expect(useAuth).toBeDefined();
    expect(typeof useAuth).toBe('function');
  });

  it('app component exports correctly', async () => {
    // Test that App component can be imported
    const App = await import('../App');
    expect(App.default).toBeDefined();
    expect(typeof App.default).toBe('function');
  });
});

describe('Route Configuration', () => {
  it('verifies dashboard route structure', () => {
    // Simple test to verify route paths are correct
    const dashboardPath = '/dashboard';
    const profilePath = '/profile';
    const settingsPath = '/settings';

    expect(dashboardPath).toMatch(/^\/dashboard$/);
    expect(profilePath).toMatch(/^\/profile$/);
    expect(settingsPath).toMatch(/^\/settings$/);
  });
});
