# Frontend Implementation Plan - User Management & Homepage

## Current State Analysis

Based on the existing codebase, we have:

### Frontend Stack
- **React 19.1.0** with TypeScript
- **Vite** for build tooling
- **React Router** v7.6.3 for routing
- **TanStack Query** for API state management
- **Zustand** for client state management
- **React Hook Form** + **Zod** for form handling
- **Tailwind CSS** for styling
- **Headless UI** + **Heroicons** for UI components

### Backend APIs Available
- **Authentication endpoints** in `/api/auth/*`
- **User management endpoints** in `/api/v1/users/*`
- **Profile image upload** functionality already implemented

## Implementation Plan

### Phase 1: Core Infrastructure Setup (Days 1-2)

#### 1.1 Update Routing Structure
- Extend existing routing to include all user management routes
- Add route guards for protected pages
- Implement redirect logic for authenticated/unauthenticated users

#### 1.2 Enhanced Layout Components
- Update existing `Layout.tsx` to handle different page types (public vs authenticated)
- Create responsive navigation that adapts based on auth state
- Implement footer component for public pages

#### 1.3 Authentication State Management
- Extend existing Zustand store for comprehensive auth state
- Implement token refresh logic
- Add logout functionality across tabs
- Create authentication hooks

### Phase 2: Authentication Pages (Days 3-5)

#### 2.1 Login Page (`/login`)
- Create login form with email/username and password
- Implement form validation using React Hook Form + Zod
- Add OAuth button placeholders (implement integration later)
- Add "Remember Me" functionality
- Implement redirect logic after successful login

#### 2.2 Registration Page (`/register`)
- Create registration form with comprehensive validation
- Add password strength indicator
- Implement real-time username/email availability checking
- Add terms of service acceptance
- Implement email verification flow

#### 2.3 Password Reset Flow
- Create forgot password page
- Implement reset password page with token validation
- Add success/error messaging
- Handle edge cases (expired tokens, invalid requests)

### Phase 3: User Profile Management (Days 6-8)

#### 3.1 Profile Page (`/profile`)
- Create profile view/edit interface
- Implement avatar upload with existing backend endpoint
- Add profile information editing
- Create privacy settings panel
- Add profile preview functionality

#### 3.2 Account Settings (`/settings`)
- Create tabbed settings interface
- Implement password change functionality
- Add email change with verification
- Create notification preferences
- Add account deletion with confirmation

#### 3.3 Public Profile View
- Create public profile pages for other users
- Implement privacy controls (show/hide based on settings)
- Add follow/unfollow functionality preparation

### Phase 4: Homepage Development (Days 9-11)

#### 4.1 Landing Page Design
- Create modern, responsive homepage with hero section
- Add beta interest registration form
- Implement footer with basic navigation
- Create compelling closed beta messaging

#### 4.2 SEO and Performance
- Implement meta tags and structured data
- Add Open Graph and Twitter Card support
- Optimize images and assets
- Implement lazy loading for non-critical sections

#### 4.3 Beta Registration System
- Create beta interest form
- Implement email validation and storage
- Add confirmation messaging
- Create beta feature preview content

### Phase 5: Polish and Testing (Days 12-14)

#### 5.1 Error Handling
- Implement comprehensive error boundaries
- Add user-friendly error messages
- Create offline state handling
- Add loading states for all async operations

#### 5.2 Basic Accessibility
- Implement keyboard navigation
- Add basic ARIA labels
- Ensure focus management
- Test with screen readers

#### 5.3 Testing
- Write unit tests for all components
- Add integration tests for auth flows
- Implement E2E tests for critical paths
- Performance testing and optimization

## Detailed Component Specifications

### Authentication Components

#### LoginForm Component
```typescript
interface LoginFormProps {
  onSuccess?: (user: User) => void;
  redirectTo?: string;
}

interface LoginFormData {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}
```

**Features:**
- Email/username input with validation
- Password input with show/hide toggle
- Remember me checkbox
- Form validation with real-time feedback
- Loading state during submission
- Error display for failed attempts

#### RegisterForm Component
```typescript
interface RegisterFormProps {
  onSuccess?: (user: User) => void;
}

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
  acceptTerms: boolean;
}
```

**Features:**
- All form fields with comprehensive validation
- Password strength indicator
- Real-time username availability checking
- Terms of service checkbox
- Email verification flow initiation

### Beta Registration Components

#### BetaInterestForm Component
```typescript
interface BetaInterestFormProps {
  onSuccess?: () => void;
}

interface BetaInterestFormData {
  email: string;
  name?: string;
  interests?: string[];
}
```

**Features:**
- Email input with validation
- Optional name field
- Optional interest selection
- Duplicate registration handling
- Success confirmation messaging

### Profile Components

#### ProfileForm Component
```typescript
interface ProfileFormProps {
  user: User;
  onUpdate?: (updatedUser: User) => void;
  isEditing?: boolean;
}

interface ProfileFormData {
  displayName: string;
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  website: string;
}
```

#### AvatarUpload Component
```typescript
interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload?: (avatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}
```

**Features:**
- Drag and drop file upload
- Image preview and cropping
- Progress indicator
- Error handling for file size/type
- Remove avatar functionality

### Homepage Components

#### HeroSection Component
```typescript
interface HeroSectionProps {
  onBetaSignUpClick?: () => void;
  onLearnMoreClick?: () => void;
}
```

#### BetaRegistrationSection Component
```typescript
interface BetaRegistrationSectionProps {
  onRegistrationComplete?: (email: string) => void;
}
```

## API Integration Strategy

### Authentication Hooks

#### useAuth Hook
```typescript
interface UseAuthReturn {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
```

#### useProfile Hook
```typescript
interface UseProfileReturn {
  profile: UserProfile | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  removeAvatar: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
```

### Query Keys Structure
```typescript
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  users: {
    profile: (userId: string) => ['users', 'profile', userId] as const,
    settings: ['users', 'settings'] as const,
  },
  beta: {
    interest: ['beta', 'interest'] as const,
  },
} as const;
```

## Styling and Design System

### Color Palette
```css
:root {
  /* Primary Colors - Warhammer-inspired */
  --color-primary-50: #f0f9ff;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  
  /* Secondary Colors - Gold accents */
  --color-secondary-400: #fbbf24;
  --color-secondary-500: #f59e0b;
  --color-secondary-600: #d97706;
  
  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}
```

### Component Variants
- **Button variants**: primary, secondary, outline, ghost, danger
- **Input variants**: default, error, success
- **Card variants**: default, elevated, outlined
- **Badge variants**: default, success, warning, error

## Security Considerations

### Frontend Security Implementation

#### Token Management
- Store JWT tokens in secure localStorage (upgrade to HTTPOnly cookies later)
- Implement automatic token refresh
- Clear tokens on logout/error
- Validate token expiration client-side

#### Input Sanitization
- Use React's built-in XSS protection
- Sanitize user-generated content for display
- Validate all form inputs on both client and server

#### Route Protection
- Implement route guards for protected pages
- Redirect unauthenticated users appropriately
- Handle permission-based access control

## Performance Optimization

### Bundle Optimization
- Implement route-based code splitting
- Lazy load non-critical components
- Optimize image assets with proper formats
- Use tree shaking for unused code elimination

### Caching Strategy
- Cache API responses with TanStack Query
- Implement optimistic updates for better UX
- Use service worker for offline capabilities
- Cache static assets with proper headers

### Loading States
- Skeleton loaders for content areas
- Spinner for form submissions
- Progressive image loading
- Lazy loading for below-the-fold content

## Accessibility Implementation

### WCAG Basic Compliance
- Proper heading hierarchy (h1-h6)
- Alt text for all images
- Keyboard navigation support
- Focus management for modals/forms
- Basic ARIA labels
- Color contrast ratios > 3:1 (basic compliance)

### Testing Tools
- **axe-core** for automated accessibility testing
- **React Testing Library** for component testing
- **Lighthouse** for performance and accessibility audits
- Manual testing with keyboard navigation

## Success Metrics and KPIs

### User Experience Metrics
- **Page Load Time**: < 3 seconds (LCP)
- **Registration Completion Rate**: > 80%
- **Login Success Rate**: > 95%
- **Profile Completion Rate**: > 70%

### Technical Metrics
- **Bundle Size**: < 250KB gzipped
- **Core Web Vitals**: All green scores
- **Error Rate**: < 1%
- **Accessibility Score**: > 95%

### Business Metrics
- **Beta Interest Conversion Rate**: > 20%
- **Beta Registration to Login**: > 60%
- **User Retention**: > 50% return within 7 days
- **Feature Adoption**: > 50% complete profile setup

## Next Steps

1. **Review and approve** this implementation plan
2. **Set up development environment** for the new branch
3. **Create project board** with tasks broken down by phase
4. **Begin Phase 1 implementation** starting with routing and infrastructure
5. **Establish testing and review processes** for quality assurance

This plan provides a comprehensive roadmap for implementing both the User Management frontend and the homepage, ensuring we meet all functional requirements while maintaining high standards for performance, accessibility, and user experience.
