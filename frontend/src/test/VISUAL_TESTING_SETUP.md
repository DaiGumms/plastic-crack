# Visual Regression Testing Setup

## Current Implementation Status

### ❌ Storybook Installation Blocked

**Issue**: Current Storybook versions (8.x) don't support Vite 7.x

- Our project uses Vite 7.0.4
- Storybook 8.6.14 supports up to Vite 6.x
- Storybook 9.x has peer dependency conflicts

**Solution**: Wait for Storybook 9.x to stabilize or downgrade Vite (not recommended)

### ✅ Alternative Visual Testing Approaches

## 1. Percy Integration (Ready to Implement)

### Installation

```bash
npm install --save-dev @percy/cli @percy/playwright
```

### Configuration

Create `percy.config.js`:

```javascript
module.exports = {
  version: 2,
  discovery: {
    allowedHostnames: ['localhost'],
  },
  static: {
    path: 'dist',
    url: 'http://localhost:5173',
  },
};
```

### Usage with Playwright

```javascript
// e2e/visual.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('visual regression tests', async ({ page }) => {
  await page.goto('/login');
  await percySnapshot(page, 'Login Page');

  await page.goto('/register');
  await percySnapshot(page, 'Register Page');

  // Mock authenticated state
  await page.addInitScript(() => {
    localStorage.setItem('auth-token', 'mock-token');
  });

  await page.goto('/dashboard');
  await percySnapshot(page, 'Dashboard');
});
```

## 2. Playwright Visual Comparisons (Implemented)

### Built-in Screenshot Testing

```javascript
// Already available in our E2E tests
test('visual consistency', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveScreenshot('login-page.png');

  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

### Configuration in `playwright.config.ts`

```javascript
use: {
  // Enable screenshot comparisons
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

## 3. Manual Component Visual Testing

### Simple Component Gallery

Create visual test pages for components:

```typescript
// src/test/visual/ComponentGallery.tsx
export const ComponentGallery = () => (
  <div style={{ padding: '20px' }}>
    <h1>Component Gallery</h1>

    <section>
      <h2>Buttons</h2>
      <SimpleButton variant="primary">Primary Button</SimpleButton>
      <SimpleButton variant="secondary">Secondary Button</SimpleButton>
    </section>

    <section>
      <h2>Form States</h2>
      <input placeholder="Normal input" />
      <input placeholder="Error state" style={{ borderColor: 'red' }} />
    </section>
  </div>
);
```

## 4. Future Storybook Implementation

### When Storybook Supports Vite 7

```bash
# Future installation when compatible
npm install --save-dev @storybook/react-vite@latest
npx storybook@latest init
```

### Story Examples

```javascript
// stories/LoginForm.stories.tsx
export default {
  title: 'Components/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
  },
};

export const Default = {};
export const WithError = {
  args: {
    error: 'Invalid credentials',
  },
};
export const Loading = {
  args: {
    isLoading: true,
  },
};
```

## Current Implementation Plan

### Phase 1: Playwright Visual Testing ✅

- [x] E2E tests with screenshot capabilities
- [x] Visual regression detection
- [x] Cross-browser testing

### Phase 2: Percy Integration (Recommended Next)

1. Install Percy CLI
2. Configure Percy project
3. Add visual snapshots to E2E tests
4. Set up CI/CD integration

### Phase 3: Component Gallery (Manual)

1. Create visual test pages
2. Document component variations
3. Manual visual review process

### Phase 4: Storybook (Future)

1. Wait for Vite 7 compatibility
2. Install Storybook
3. Create component stories
4. Integrate with Percy/Chromatic

## Benefits of Each Approach

### Playwright Visual Testing

- ✅ Already implemented
- ✅ Full page context
- ✅ User interaction testing
- ❌ Limited to full pages

### Percy Integration

- ✅ Cloud-based visual diffing
- ✅ Team collaboration
- ✅ CI/CD integration
- ✅ Historical comparisons
- ❌ Requires account setup

### Storybook + Chromatic

- ✅ Component isolation
- ✅ Design system documentation
- ✅ Interactive development
- ✅ Automated visual testing
- ❌ Currently incompatible with our stack

## Recommended Next Steps

1. **Immediate**: Use Playwright's built-in visual testing
2. **Short-term**: Add Percy integration for enhanced visual diffing
3. **Medium-term**: Create manual component gallery
4. **Long-term**: Migrate to Storybook when Vite 7 is supported

## Visual Testing Checklist

### Page-Level Testing ✅

- [x] Login page rendering
- [x] Registration page rendering
- [x] Dashboard layout
- [x] Error states
- [x] Loading states

### Component-Level Testing (Planned)

- [ ] Form components in various states
- [ ] Button variations
- [ ] Navigation components
- [ ] Modal dialogs
- [ ] Loading spinners

### Responsive Testing (Planned)

- [ ] Mobile viewport testing
- [ ] Tablet viewport testing
- [ ] Desktop variations
- [ ] Component reflow testing

### Cross-Browser Testing ✅

- [x] Chromium rendering
- [x] Firefox rendering
- [x] WebKit rendering
