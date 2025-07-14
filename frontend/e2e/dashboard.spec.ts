import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/verify', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 1,
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
          },
        }),
      });
    });

    // Set auth token in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('auth-token', 'mock-jwt-token');
    });

    await page.goto('/dashboard');
  });

  test('should display dashboard correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Dashboard.*Plastic Crack/);

    // Check welcome message
    await expect(page.getByText(/welcome.*test/i)).toBeVisible();

    // Check main dashboard elements
    await expect(page.getByTestId('user-profile-section')).toBeVisible();
    await expect(page.getByTestId('dashboard-actions')).toBeVisible();
  });

  test('should show user information', async ({ page }) => {
    // Check user name is displayed
    await expect(page.getByText('Test User')).toBeVisible();

    // Check user email is displayed
    await expect(page.getByText('test@example.com')).toBeVisible();
  });

  test('should have functional navigation header', async ({ page }) => {
    // Check header is present
    await expect(page.getByTestId('main-header')).toBeVisible();

    // Check logo/brand
    await expect(page.getByTestId('app-logo')).toBeVisible();

    // Check user menu
    await expect(page.getByTestId('user-menu')).toBeVisible();
  });

  test('should handle logout functionality', async ({ page }) => {
    // Mock logout API
    await page.route('**/api/auth/logout', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Click user menu
    await page.getByTestId('user-menu').click();

    // Click logout button
    await page.getByTestId('logout-button').click();

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users', async ({ page }) => {
    // Clear authentication
    await page.evaluate(() => {
      localStorage.removeItem('auth-token');
    });

    // Mock unauthenticated response
    await page.route('**/api/auth/verify', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Unauthorized',
        }),
      });
    });

    // Try to access dashboard
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display loading state initially', async ({ page }) => {
    // Mock slow auth verification
    await page.route('**/api/auth/verify', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 1,
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
          },
        }),
      });
    });

    await page.goto('/dashboard');

    // Should show loading state initially
    await expect(page.getByTestId('loading-spinner')).toBeVisible();

    // Should eventually show dashboard content
    await expect(page.getByText(/welcome.*test/i)).toBeVisible();
    await expect(page.getByTestId('loading-spinner')).not.toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Dashboard should still be functional
    await expect(page.getByTestId('main-header')).toBeVisible();
    await expect(page.getByText(/welcome.*test/i)).toBeVisible();

    // Mobile menu should work
    const userMenu = page.getByTestId('user-menu');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await expect(page.getByTestId('logout-button')).toBeVisible();
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/auth/verify', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Server error',
        }),
      });
    });

    await page.goto('/dashboard');

    // Should show error message or redirect to login
    await expect(page).toHaveURL(/\/(login|error)/);
  });
});
