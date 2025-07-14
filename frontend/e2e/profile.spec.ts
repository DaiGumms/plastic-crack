import { test, expect } from '@playwright/test';

const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  bio: 'Test bio',
  avatarUrl: null,
  isEmailVerified: true,
  role: 'USER',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

test.describe('User Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Set E2E bypass flag and mock user data
    await page.addInitScript(user => {
      // @ts-expect-error - E2E testing bypass flag
      window.__E2E_BYPASS_AUTH__ = true;

      // Set up the zustand auth store with proper structure for components that check it
      window.localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user: user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
          version: 0,
        })
      );
    }, mockUser);

    // Mock API calls
    await page.route('**/api/v1/users/profile', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockUser,
          }),
        });
      } else if (route.request().method() === 'PUT') {
        const updateData = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { ...mockUser, ...updateData },
          }),
        });
      }
    });

    // Go directly to profile page
    await page.goto('/profile');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display user profile information', async ({ page }) => {
    // Check that profile page loads
    await expect(page.locator('h1')).toContainText('User Profile');

    // Check user information is displayed
    await expect(page.locator('[data-testid="display-name"]')).toContainText(
      'Test User'
    );
    await expect(
      page.locator('[data-testid="firstName-input"] input')
    ).toHaveValue('Test');
    await expect(
      page.locator('[data-testid="lastName-input"] input')
    ).toHaveValue('User');
    await expect(page.locator('[data-testid="email-input"] input')).toHaveValue(
      'test@example.com'
    );
    await expect(
      page.locator('[data-testid="bio-input"] textarea')
    ).toHaveValue('Test bio');

    // Check that fields are disabled by default
    await expect(
      page.locator('[data-testid="firstName-input"] input')
    ).toBeDisabled();
    await expect(
      page.locator('[data-testid="lastName-input"] input')
    ).toBeDisabled();
    await expect(page.locator('[data-testid="email-input"]')).toBeDisabled();
    await expect(page.locator('[data-testid="bio-input"]')).toBeDisabled();

    // Check edit button is present
    await expect(page.locator('[data-testid="edit-button"]')).toBeVisible();
  });

  test('should enable editing mode when edit button is clicked', async ({
    page,
  }) => {
    await page.goto('/profile');

    // Click edit button
    await page.click('[data-testid="edit-button"]');

    // Check that fields are now enabled
    await expect(page.locator('[data-testid="firstName-input"]')).toBeEnabled();
    await expect(page.locator('[data-testid="lastName-input"]')).toBeEnabled();
    await expect(page.locator('[data-testid="email-input"]')).toBeEnabled();
    await expect(page.locator('[data-testid="bio-input"]')).toBeEnabled();

    // Check that save and cancel buttons are present
    await expect(page.locator('[data-testid="save-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="cancel-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="edit-button"]')).not.toBeVisible();
  });

  test('should cancel editing and restore original values', async ({
    page,
  }) => {
    await page.goto('/profile');

    // Click edit button
    await page.click('[data-testid="edit-button"]');

    // Modify some fields
    await page.fill('[data-testid="firstName-input"]', 'Modified');
    await page.fill('[data-testid="bio-input"]', 'Modified bio');

    // Click cancel button
    await page.click('[data-testid="cancel-button"]');

    // Check that original values are restored
    await expect(page.locator('[data-testid="firstName-input"]')).toHaveValue(
      'Test'
    );
    await expect(page.locator('[data-testid="bio-input"]')).toHaveValue(
      'Test bio'
    );

    // Check that fields are disabled again
    await expect(
      page.locator('[data-testid="firstName-input"]')
    ).toBeDisabled();
    await expect(page.locator('[data-testid="edit-button"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/profile');

    // Click edit button
    await page.click('[data-testid="edit-button"]');

    // Clear required fields
    await page.fill('[data-testid="firstName-input"]', '');
    await page.fill('[data-testid="lastName-input"]', '');

    // Try to save
    await page.click('[data-testid="save-button"]');

    // Check that error message is displayed
    await expect(page.locator('[data-testid="error-alert"]')).toContainText(
      'First name is required'
    );
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/profile');

    // Click edit button
    await page.click('[data-testid="edit-button"]');

    // Enter invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email');

    // Try to save
    await page.click('[data-testid="save-button"]');

    // Check that error message is displayed
    await expect(page.locator('[data-testid="error-alert"]')).toContainText(
      'Invalid email format'
    );
  });

  test('should validate bio length', async ({ page }) => {
    await page.goto('/profile');

    // Click edit button
    await page.click('[data-testid="edit-button"]');

    // Enter bio that's too long
    const longBio = 'a'.repeat(501);
    await page.fill('[data-testid="bio-input"]', longBio);

    // Try to save
    await page.click('[data-testid="save-button"]');

    // Check that error message is displayed
    await expect(page.locator('[data-testid="error-alert"]')).toContainText(
      'Bio must be 500 characters or less'
    );
  });

  test('should successfully update profile', async ({ page }) => {
    // Mock successful profile update
    await page.route('**/api/v1/users/profile', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          json: {
            id: '1',
            email: 'updated@example.com',
            firstName: 'Updated',
            lastName: 'Name',
            bio: 'Updated bio',
            avatarUrl: null,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
          },
        });
      }
    });

    await page.goto('/profile');

    // Click edit button
    await page.click('[data-testid="edit-button"]');

    // Update fields
    await page.fill('[data-testid="firstName-input"]', 'Updated');
    await page.fill('[data-testid="lastName-input"]', 'Name');
    await page.fill('[data-testid="email-input"]', 'updated@example.com');
    await page.fill('[data-testid="bio-input"]', 'Updated bio');

    // Save changes
    await page.click('[data-testid="save-button"]');

    // Check that success message is displayed
    await expect(page.locator('[data-testid="success-alert"]')).toContainText(
      'Profile updated successfully!'
    );

    // Check that fields are disabled again
    await expect(
      page.locator('[data-testid="firstName-input"]')
    ).toBeDisabled();
    await expect(page.locator('[data-testid="edit-button"]')).toBeVisible();

    // Check that display name is updated
    await expect(page.locator('[data-testid="display-name"]')).toContainText(
      'Updated Name'
    );
  });

  test('should handle avatar upload', async ({ page }) => {
    // Mock successful avatar upload
    await page.route('**/api/v1/users/avatar', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          json: {
            id: '1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            bio: 'Test bio',
            avatarUrl: 'https://example.com/avatar.jpg',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
          },
        });
      }
    });

    await page.goto('/profile');

    // Check that avatar upload button is present
    await expect(
      page.locator('[data-testid="avatar-upload-button"]')
    ).toBeVisible();

    // Create a test file and upload
    const fileContent = Buffer.from('fake image content');
    await page.setInputFiles('[data-testid="avatar-upload-input"]', {
      name: 'avatar.jpg',
      mimeType: 'image/jpeg',
      buffer: fileContent,
    });

    // Check that success message is displayed
    await expect(page.locator('[data-testid="success-alert"]')).toContainText(
      'Avatar updated successfully!'
    );
  });

  test('should display user initials when no avatar', async ({ page }) => {
    await page.goto('/profile');

    // Check that avatar shows initials
    const avatar = page.locator('[data-testid="user-avatar"]');
    await expect(avatar).toContainText('TU'); // Test User initials
  });

  test('should display bio character counter', async ({ page }) => {
    await page.goto('/profile');

    // Click edit button
    await page.click('[data-testid="edit-button"]');

    // Check initial character count
    await expect(page.locator('text=8/500 characters')).toBeVisible();

    // Type more text and check counter updates
    await page.fill(
      '[data-testid="bio-input"]',
      'This is a longer bio with more characters'
    );
    await expect(page.locator('text=42/500 characters')).toBeVisible();
  });

  test('should display member since date', async ({ page }) => {
    await page.goto('/profile');

    // Check that member since date is displayed
    await expect(page.getByText('Member since')).toBeVisible();
    await expect(page.getByText('1/1/2024')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/v1/users/profile', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 400,
          json: {
            message: 'Email already exists',
          },
        });
      }
    });

    await page.goto('/profile');

    // Click edit button
    await page.click('[data-testid="edit-button"]');

    // Try to update email to one that already exists
    await page.fill('[data-testid="email-input"]', 'existing@example.com');

    // Save changes
    await page.click('[data-testid="save-button"]');

    // Check that error message is displayed
    await expect(page.locator('[data-testid="error-alert"]')).toContainText(
      'Email already exists'
    );
  });
});
