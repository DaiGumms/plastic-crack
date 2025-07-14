import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Plastic Crack/);

    // Check all form fields are present
    await expect(page.getByTestId('firstName-input')).toBeVisible();
    await expect(page.getByTestId('lastName-input')).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('confirmPassword-input')).toBeVisible();
    await expect(page.getByTestId('register-button')).toBeVisible();

    // Check for login link
    await expect(page.getByTestId('login-link')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Click register button without filling form
    await page.getByTestId('register-button').click();

    // Check for validation errors
    await expect(page.getByText(/first name is required/i)).toBeVisible();
    await expect(page.getByText(/last name is required/i)).toBeVisible();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should validate password confirmation', async ({ page }) => {
    // Fill form with mismatched passwords
    await page.getByTestId('firstName-input').fill('John');
    await page.getByTestId('lastName-input').fill('Doe');
    await page.getByTestId('email-input').fill('john.doe@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('confirmPassword-input').fill('different456');

    await page.getByTestId('register-button').click();

    // Check for password mismatch error
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('should handle successful registration', async ({ page }) => {
    // Mock successful registration API response
    await page.route('**/api/auth/register', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 1,
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
          },
          token: 'mock-jwt-token',
        }),
      });
    });

    // Fill valid registration form
    await page.getByTestId('firstName-input').fill('John');
    await page.getByTestId('lastName-input').fill('Doe');
    await page.getByTestId('email-input').fill('john.doe@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('confirmPassword-input').fill('password123');

    // Submit form
    await page.getByTestId('register-button').click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should handle registration error', async ({ page }) => {
    // Mock failed registration API response
    await page.route('**/api/auth/register', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Email already exists',
        }),
      });
    });

    // Fill registration form
    await page.getByTestId('firstName-input').fill('John');
    await page.getByTestId('lastName-input').fill('Doe');
    await page.getByTestId('email-input').fill('existing@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('confirmPassword-input').fill('password123');

    // Submit form
    await page.getByTestId('register-button').click();

    // Should show error message
    await expect(page.getByText(/email already exists/i)).toBeVisible();
    // Should stay on register page
    await expect(page).toHaveURL(/\/register/);
  });

  test('should navigate to login page', async ({ page }) => {
    // Click login link
    await page.getByTestId('login-link').click();

    // Check navigation to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Fill form with invalid email
    await page.getByTestId('firstName-input').fill('John');
    await page.getByTestId('lastName-input').fill('Doe');
    await page.getByTestId('email-input').fill('invalid-email');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('confirmPassword-input').fill('password123');

    await page.getByTestId('register-button').click();

    // Check for email validation error
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    // Fill form with weak password
    await page.getByTestId('firstName-input').fill('John');
    await page.getByTestId('lastName-input').fill('Doe');
    await page.getByTestId('email-input').fill('john.doe@example.com');
    await page.getByTestId('password-input').fill('123');
    await page.getByTestId('confirmPassword-input').fill('123');

    await page.getByTestId('register-button').click();

    // Check for password strength error
    await expect(page.getByText(/password.*too short/i)).toBeVisible();
  });
});
