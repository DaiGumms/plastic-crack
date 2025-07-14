import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for screenshots
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('login page visual consistency', async ({ page }) => {
    await page.goto('/login');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('login-page.png');
  });

  test('registration page visual consistency', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('register-page.png');
  });

  test('dashboard visual consistency', async ({ page }) => {
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

    await page.addInitScript(() => {
      localStorage.setItem('auth-token', 'mock-jwt-token');
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for dynamic content to load
    await page.waitForSelector('[data-testid="user-profile-section"]');

    await expect(page).toHaveScreenshot('dashboard-page.png');
  });

  test('form validation error states', async ({ page }) => {
    await page.goto('/login');

    // Trigger validation errors
    await page.getByTestId('login-button').click();

    // Wait for error messages to appear
    await page.waitForSelector('text=/email is required/i');

    await expect(page).toHaveScreenshot('login-validation-errors.png');
  });

  test('responsive mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('login-mobile.png');

    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('register-mobile.png');
  });

  test('dark mode consistency', async ({ page }) => {
    // Enable dark mode (if implemented)
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('login-dark-mode.png');
  });

  test('loading states visual consistency', async ({ page }) => {
    // Mock slow API response to capture loading state
    await page.route('**/api/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/login');

    // Fill form and submit
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-button').click();

    // Capture loading state
    await page.waitForSelector('[data-testid="loading-spinner"]');
    await expect(page).toHaveScreenshot('login-loading-state.png');
  });

  test('error message display consistency', async ({ page }) => {
    // Mock error response
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Invalid credentials',
        }),
      });
    });

    await page.goto('/login');

    // Submit invalid credentials
    await page.getByTestId('email-input').fill('wrong@example.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('login-button').click();

    // Wait for error message
    await page.waitForSelector('text=/invalid credentials/i');

    await expect(page).toHaveScreenshot('login-error-message.png');
  });

  test('component hover states', async ({ page }) => {
    await page.goto('/login');

    // Hover over button to show hover state
    await page.getByTestId('login-button').hover();

    await expect(page).toHaveScreenshot('button-hover-state.png');
  });

  test('focus states accessibility', async ({ page }) => {
    await page.goto('/login');

    // Tab through form to show focus states
    await page.keyboard.press('Tab'); // Focus email input
    await expect(page).toHaveScreenshot('email-input-focused.png');

    await page.keyboard.press('Tab'); // Focus password input
    await expect(page).toHaveScreenshot('password-input-focused.png');

    await page.keyboard.press('Tab'); // Focus submit button
    await expect(page).toHaveScreenshot('submit-button-focused.png');
  });

  test('cross-browser rendering comparison', async ({ page, browserName }) => {
    await page.goto('/dashboard');

    // Mock authentication for all browsers
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

    await page.addInitScript(() => {
      localStorage.setItem('auth-token', 'mock-jwt-token');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="user-profile-section"]');

    // Browser-specific screenshots
    await expect(page).toHaveScreenshot(`dashboard-${browserName}.png`);
  });
});
