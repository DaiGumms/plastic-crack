import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
  });

  test('should display login form correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Plastic Crack/);

    // Check login form elements are present
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();

    // Check for "Register" link
    await expect(page.getByTestId('register-link')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Click login button without filling form
    await page.getByTestId('login-button').click();

    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Fill invalid email
    await page.getByTestId('email-input').fill('invalid-email');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-button').click();

    // Check for email validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    // Click register link
    await page.getByTestId('register-link').click();

    // Check navigation to register page
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByTestId('register-form')).toBeVisible();
  });

  test('should handle login flow with mock data', async ({ page }) => {
    // Mock the login API response
    await page.route('**/api/auth/login', async route => {
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
          token: 'mock-jwt-token',
        }),
      });
    });

    // Fill valid login credentials
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');

    // Submit form
    await page.getByTestId('login-button').click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should handle login error', async ({ page }) => {
    // Mock failed login API response
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

    // Fill login credentials
    await page.getByTestId('email-input').fill('wrong@example.com');
    await page.getByTestId('password-input').fill('wrongpassword');

    // Submit form
    await page.getByTestId('login-button').click();

    // Should show error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByTestId('password-input');
    const toggleButton = page.getByTestId('password-toggle');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle again to hide password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
