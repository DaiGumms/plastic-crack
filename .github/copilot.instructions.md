# GitHub Copilot Instructions for Plastic Crack

## Project Architecture

**Plastic Crack** is a cross-platform Warhammer collection management application with a monorepo
structure hosted on **Firebase/Google Cloud Platform**:

```
plastic-crack/
├── backend/          # Node.js/Express API (Cloud Run/Cloud Functions)
├── frontend/         # React web app (Firebase Hosting)
├── mobile/          # React Native mobile app (Expo)
├── shared/          # Shared TypeScript types and utilities
└── docs/           # Comprehensive project documentation
```

### Key Technology Stack

- **Backend**: Node.js, Express, Prisma ORM, Cloud SQL (PostgreSQL), Firebase Auth, Cloud Storage
- **Frontend**: React 19, Vite, TypeScript, Material-UI, TanStack Query, Zustand
- **Mobile**: React Native, Expo
- **Infrastructure**: Firebase Hosting, Cloud Run, Cloud SQL, Cloud Storage, Cloud Functions
- **Testing**: Vitest (frontend), Jest (backend), React Testing Library
- **Build**: TypeScript, ESLint, Prettier, npm workspaces

## Critical Development Patterns

### 1. Authentication & Authorization

The project uses **Firebase Authentication** with custom claims for role-based access control:
Hierarchical roles: `USER → MODERATOR → ADMIN → SUPER_ADMIN`

```typescript
// Backend middleware pattern with Firebase Auth
router.post(
  '/collections',
  verifyFirebaseToken,
  requireRole('USER'),
  requirePermission('collection:write'),
  // validation middleware here
  async (req: AuthenticatedRequest, res: Response) => {
    // Implementation
  }
);

// Frontend Firebase auth integration
const { user, signIn, signOut } = useAuthStore();
```

**Key Files**:

- `backend/src/middleware/auth.middleware.ts` - Firebase token verification
- `frontend/src/store/authStore.ts` - Client auth state with Firebase
- `docs/authorization-system.md` - Complete auth documentation

### 2. Database Operations (Prisma + Cloud SQL)

Always use transactions for multi-step operations and handle errors consistently. Database hosted on
**Cloud SQL (PostgreSQL)**:

```typescript
// Service layer pattern
export class UserService {
  async updateUserProfile(userId: string, data: UpdateProfileData) {
    return await prisma.$transaction(async tx => {
      const user = await tx.user.update({
        where: { id: userId },
        data,
      });
      return user;
    });
  }
}
```

**Key Files**:

- `backend/prisma/schema.prisma` - Database schema
- `backend/src/services/` - Business logic services
- `docs/database-design.md` - Schema documentation

### 3. Frontend State Management

- **Server State**: TanStack Query for API data
- **Client State**: Zustand stores for app state
- **Forms**: React Hook Form + Zod validation

```typescript
// Query pattern
const {
  data: profile,
  isLoading,
  error,
} = useQuery({
  queryKey: ['profile', userId],
  queryFn: () => userService.getProfile(userId),
});

// Store pattern
const useAuthStore = create<AuthState>(set => ({
  user: null,
  login: async credentials => {
    /* implementation */
  },
}));
```

### 4. Component Architecture

Material-UI + TypeScript patterns with strict prop interfaces:

```typescript
interface ProfileFormProps {
  user: User;
  onUpdate: (user: User) => void;
  isLoading?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ user, onUpdate, isLoading }) => {
  // Component implementation
};
```

**Key Directories**:

- `frontend/src/components/` - Reusable UI components
- `frontend/src/pages/` - Page-level components
- `frontend/src/types/` - TypeScript interfaces

### 5. Testing Patterns

Frontend uses **Vitest** (not Jest), Backend uses **Jest**:

```typescript
// Frontend test pattern (Vitest + React Testing Library)
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mockOnChange = vi.fn();
// Test implementation

// Backend test pattern (Jest)
const mockUserService = {
  getProfile: jest.fn(),
} as jest.Mocked<typeof userService>;
```

**Critical**: Material-UI components require specific test patterns - use `vi.fn()` not `jest.fn()`
in frontend tests.

## Common Development Commands

```powershell
# Root level development
npm run dev                    # Start both backend and frontend
npm run test                   # Run all tests
npm run build                  # Build all packages

# Backend specific
cd backend; npm run dev        # Start backend with hot reload
cd backend; npm run db:migrate # Run database migrations
cd backend; npm run db:studio  # Open Prisma Studio

# Frontend specific
cd frontend; npm run dev       # Start frontend dev server
cd frontend; npm run test      # Run Vitest tests
cd frontend; npm run test:watch # Watch mode testing

# Firebase/GCP deployment
firebase deploy                # Deploy to Firebase Hosting
gcloud run deploy             # Deploy backend to Cloud Run
npm run build:prod            # Production build for GCP
```

### Windows PowerShell Environment

This project uses PowerShell as the default terminal. Use semicolons for command chaining:

```powershell
cd backend; npm install; npm run dev
```

## API Integration Patterns

### Service Layer Pattern (Firebase Integration)

```typescript
// Frontend service with Firebase
export const userService = {
  async getProfile(userId: string): Promise<UserProfile> {
    const token = await getIdToken();
    const response = await apiClient.get(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Backend route handler with Firebase Auth
router.get('/users/:id', verifyFirebaseToken, async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({ data: user });
});
```

### File Upload Pattern (Cloud Storage)

```typescript
// Frontend file upload to Cloud Storage
const uploadFile = async (file: File) => {
  const storageRef = ref(storage, `uploads/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// Backend file handling
router.post('/upload', upload.single('file'), async (req, res) => {
  const fileUrl = await uploadToCloudStorage(req.file);
  res.json({ url: fileUrl });
});
```

## Error Handling Standards

### Backend Error Responses

```typescript
// Standardized error format
res.status(400).json({
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input provided',
    details: validationErrors,
  },
});
```

### Frontend Error Handling

```typescript
// Query error handling
const { data, error, isLoading } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => userService.getUser(userId),
  onError: error => {
    console.error('Failed to fetch user:', error);
    // Show user-friendly error message
  },
});
```

## Development Workflow

### Branch Strategy

- `main` - Production branch
- `feature/feature-name` - Feature development
- `hotfix/issue-description` - Emergency fixes

### Commit Conventions

```
feat(auth): implement role-based authorization middleware
fix(api): resolve user profile update validation
docs(readme): add setup instructions
test(user): add comprehensive user service tests
```

## Performance & Security Notes

### Database Optimization (Cloud SQL)

- Use Prisma `include` and `select` to minimize data transfer
- Implement pagination for list endpoints
- Use Cloud SQL connection pooling
- Leverage Firebase Firestore for real-time features where appropriate

### Security Requirements (Firebase/GCP)

- All API endpoints require Firebase Authentication unless explicitly public
- Use Firebase Security Rules for Firestore collections
- Input validation using express-validator on backend, Zod on frontend
- File uploads validated and stored in Cloud Storage with proper IAM
- CSRF protection and rate limiting implemented

## Documentation References

Essential docs for development context:

- **`docs/frontend-implementation-plan.md`** - Current frontend development roadmap
- **`docs/authorization-system.md`** - Auth patterns and permissions
- **`docs/api-specification.md`** - Complete API documentation
- **`docs/testing-guide.md`** - Testing setup and troubleshooting

## Quick Troubleshooting

### Common Issues

1. **EMFILE errors in tests**: Material-UI components can cause file handle issues on Windows - run
   individual test files
2. **Prisma client errors**: Run `npm run db:generate` after schema changes
3. **Frontend build issues**: Check TypeScript errors with `npm run type-check`
4. **Auth failures**: Verify JWT tokens and Redis connection status

### Development Setup

1. **Firebase Configuration**:
   - Copy Firebase config to `.env` files in both `backend/` and `frontend/`
   - Setup Firebase project with Authentication and Storage enabled
2. **GCP Setup**: Configure Cloud SQL instance and connection strings
3. **Local Development**: Run `npm install` in root to install all dependencies
4. **Database Setup**: `cd backend && npm run db:migrate`
5. **Start Development**: `npm run dev`

### Firebase/GCP Environment Variables

```bash
# Firebase config
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key

# Cloud SQL
DATABASE_URL=postgresql://user:password@host:port/database?socket=/cloudsql/instance

# Cloud Storage
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
```

This project is actively under development with comprehensive documentation. Always check existing
docs before implementing new patterns.

- Create migrations: `npx prisma migrate dev --name descriptive-name`
- Follow RESTful conventions with proper HTTP status codes
- Use express-validator for input validation
- Include authentication/authorization middleware
- Implement consistent error responses

#### Example API Route Structure

```typescript
router.post(
  '/collections',
  authenticateToken,
  requirePermission('collection:write'),
  [
    body('name').isLength({ min: 1, max: 100 }),
    body('description').optional().isLength({ max: 500 }),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    // Implementation
  }
);
```

### 3. Authorization System

- **Roles**: USER → MODERATOR → ADMIN → SUPER_ADMIN (hierarchical)
- **Permissions**: Use `resource:action` format (e.g., `content:moderate`, `user:admin`)
- **Middleware**: `requireAdmin`, `requirePermission('permission')`, `requireOwnershipOrAdmin()`
- **Implementation**: Always test authorization with different role levels

### 4. Testing Standards

- **Coverage**: Maintain 90%+ test coverage
- **Structure**: Unit tests for functions, integration tests for APIs, E2E for workflows
- **Requirements**: Test happy path and error scenarios, use proper mocking

### 5. Error Handling

- **Backend**: Use try-catch blocks, standardized error response format
- **Frontend**: Implement error boundaries, user-friendly error messages
- **Logging**: Use appropriate log levels (error, warn, info, debug)

#### Frontend Error Handling

- Use error boundaries for component error handling
- Implement proper loading states
- Show user-friendly error messages
- Log errors appropriately for debugging

### 6. State Management

- **Backend**: Stateless API design, use services for business logic, Redis for caching
- **Frontend**: React hooks for local state, React Query for server state

## Key Services and Patterns

### 1. Database Operations

- Use Prisma transactions for multiple operations
- Always handle NotFoundError appropriately
- Include user role in JWT payload and verify permissions

### 2. File Management

- Use multer for uploads with proper validation
- Generate unique filenames and implement cleanup

### 3. Development Workflow

- Work from GitHub issues with referenced commits
- Use branch strategy: `main`, `feature/*`, `hotfix/*`, `release/*`

```
type(scope): description

feat(auth): implement role-based authorization middleware
fix(api): resolve user profile update validation
docs(readme): add setup instructions
test(user): add comprehensive user service tests
```

### 4. Code Review Process

- All changes require pull requests
- Include comprehensive testing
- Update documentation as needed
- Ensure backward compatibility
- Verify security implications

## Performance & Security

### Performance Guidelines

- **Database**: Use indexes, pagination, connection pooling, Redis for caching
- **API**: Implement caching, compression, rate limiting
- **Frontend**: Code splitting, lazy loading, bundle optimization

### Security Best Practices

- **Authentication**: Validate JWT server-side, use bcrypt, implement rate limiting
- **Input Validation**: Validate all inputs, use parameterized queries, sanitize content
- **Data Protection**: No secrets in logs/commits, use HTTPS, implement audit logging

## Deployment & Quality Standards

### Operations

- Use environment variables for configuration and secrets
- Implement health check endpoints and structured logging
- Always backup before migrations, test on staging first

### Code Quality Requirements

- All tests must pass with 90%+ coverage
- ESLint and TypeScript compilation must succeed
- No security vulnerabilities in dependencies
- Follow standardized error/success response formats

### Documentation

- JSDoc for public APIs, README for components
- Setup guides and troubleshooting documentation

## Development Environment

### Terminal Environment

This project uses **PowerShell** as the default terminal environment on Windows. When using the
`run_in_terminal` tool, always use PowerShell-compatible syntax.

#### PowerShell Best Practices

- Use semicolons (`;`) instead of `&&` for command chaining
- Use PowerShell-native commands when available
- Handle path separators correctly for Windows
- Use proper PowerShell variable syntax when needed

#### Common Command Patterns

```powershell
# Correct: Change directory and run command
cd backend; npm test

# Correct: Multiple commands
cd backend; npm install; npm run build

# Correct: Conditional execution
if ($LASTEXITCODE -eq 0) { npm run deploy }

# Path handling (use forward slashes or escape backslashes)
cd "C:\Users\Project\backend"
# or
cd C:/Users/Project/backend
```

#### Environment Variables

```powershell
# Set environment variable
$env:NODE_ENV = "development"

# Use environment variable
echo $env:NODE_ENV
```

#### File Operations

```powershell
# Create directory
New-Item -ItemType Directory -Path "uploads/profiles" -Force

# Copy files
Copy-Item "source.txt" "destination.txt"

# Remove files/directories
Remove-Item "temp/" -Recurse -Force
```

## Documentation References

### Project Documentation

The following documentation files are available in the repository:

#### Core Documentation (`/docs/`)

- **`api-specification.md`** - Complete API endpoint documentation
- **`database-design.md`** - Database schema and relationship documentation
- **`deployment-guide.md`** - Production deployment instructions
- **`functional-requirements.md`** - Detailed functional requirements (FR-001 to FR-053)
- **`implementation-strategy.md`** - Development phases and implementation approach
- **`security-documentation.md`** - Security guidelines and best practices
- **`technical-architecture.md`** - System architecture and component overview
- **`authorization-system.md`** - Role-based authorization system documentation
- **`testing-guide.md`** - Testing strategies, setup, and troubleshooting

#### Backend Documentation (`/backend/docs/`)

- **`REDIS_CHANGELOG.md`** - Redis integration changes and updates
- **`REDIS_INTEGRATION.md`** - Redis setup and usage documentation

#### Component READMEs

- **`/backend/README.md`** - Backend setup, development, and API documentation
- **`/frontend/README.md`** - Frontend development setup and component guide
- **`/mobile/README.md`** - React Native mobile app setup and development
- **`/shared/README.md`** - Shared utilities and types documentation

### Documentation Guidelines

When referencing or updating documentation:

1. **Always check existing docs first** - Before implementing features, review relevant
   documentation
2. **Update docs with changes** - Any new features or changes must be documented
3. **Link related docs** - Cross-reference related documentation sections
4. **Use consistent formatting** - Follow the established markdown patterns
5. **Include examples** - Provide code examples for complex features

### Quick Reference Links

For common development tasks, reference these key documents:

- **Setting up the project**: `/backend/README.md`, `/frontend/README.md`
- **Database changes**: `/docs/database-design.md`
- **API development**: `/docs/api-specification.md`
- **Authorization**: `/docs/authorization-system.md`
- **Testing**: `/docs/testing-guide.md`
- **Deployment**: `/docs/deployment-guide.md`

### Documentation Standards

- Use clear, descriptive headings
- Include code examples with proper syntax highlighting
- Add table of contents for longer documents
- Update documentation with every feature change
- Include troubleshooting sections where appropriate
- Use consistent terminology throughout the project
