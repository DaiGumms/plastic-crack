# Testing Guide for Plastic Crack Backend

## Overview

This document provides comprehensive information about the testing setup, processes, and troubleshooting for the Plastic Crack backend application.

## Test Environment Setup

### Prerequisites

1. **Database Services**
   ```bash
   # Start PostgreSQL and Redis containers
   docker-compose up -d postgres redis
   
   # Verify containers are running
   docker ps
   ```

2. **Database Migration**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Environment Configuration**
   - Ensure `.env` file exists with correct database URLs
   - For testing with rate limiting disabled: `$env:SKIP_RATE_LIMIT="true"`

### Test Structure

```
backend/src/__tests__/
├── setup.ts              # Global test configuration
├── health.test.ts         # Health endpoint tests (3 tests)
├── auth.test.ts           # Authentication system tests (28 tests)
├── rateLimit.test.ts      # Rate limiting tests (2 tests)
└── user.test.ts           # User profile tests (23 tests)
```

## Test Suites Overview

### 1. Health Tests (`health.test.ts`)
- **Purpose**: Verify API health endpoints
- **Count**: 3 tests
- **Status**: ✅ All passing
- **Coverage**:
  - GET `/health`
  - GET `/api/v1/health`
  - GET `/api/v1/health/ping`

### 2. Authentication Tests (`auth.test.ts`)
- **Purpose**: Test user registration, login, token management
- **Count**: 28 tests
- **Status**: ✅ All passing individually
- **Coverage**:
  - User registration with validation
  - User login/logout
  - JWT token generation and validation
  - Password hashing and verification
  - Error handling and edge cases

### 3. Rate Limiting Tests (`rateLimit.test.ts`)
- **Purpose**: Verify rate limiting functionality
- **Count**: 2 tests
- **Status**: ✅ All passing
- **Coverage**:
  - Registration endpoint rate limiting
  - Login endpoint rate limiting

### 4. User Profile Tests (`user.test.ts`)
- **Purpose**: Test complete user profile CRUD operations
- **Count**: 23 tests
- **Status**: ⚠️ 21/23 passing individually, issues when run with other suites
- **Coverage**:
  - Profile retrieval and updates
  - Privacy settings management
  - Profile image uploads
  - Password changes
  - Account deletion
  - Public profile access
  - Input validation
  - Authentication requirements

## Running Tests

### Individual Test Suites
```bash
# All tests (may have conflicts between suites)
npm test

# Individual test files
npm test -- health.test.ts
npm test -- auth.test.ts
npm test -- rateLimit.test.ts
npm test -- user.test.ts

# Specific test patterns
npm test -- --testNamePattern="profile"
npm test -- --testNamePattern="authentication"
```

### With Rate Limiting Disabled
```powershell
# PowerShell
$env:SKIP_RATE_LIMIT="true" ; npm test -- user.test.ts

# Bash
SKIP_RATE_LIMIT=true npm test -- user.test.ts
```

### With Increased Timeouts
```bash
npm test -- user.test.ts --testTimeout=30000
```

## Common Issues and Solutions

### 1. Database Connection Issues

**Problem**: Tests fail with database connection errors

**Solution**:
```bash
# Restart database containers
docker-compose down
docker-compose up -d postgres redis

# Wait for containers to be ready
sleep 5

# Reset database to clean state
npx prisma migrate reset --force
npx prisma generate
```

### 2. Rate Limiting Conflicts

**Problem**: Tests fail with 429 "Too Many Requests" errors

**Solution**:
```bash
# Disable rate limiting for tests
$env:SKIP_RATE_LIMIT="true"

# Or increase delays between tests in user.test.ts
# Add: await new Promise(resolve => setTimeout(resolve, 5000));
```

### 3. Test Data Conflicts

**Problem**: "Email already registered" or "User not found" errors

**Root Cause**: Tests running concurrently or previous test data not cleaned up

**Solution**:
```typescript
// In test files, ensure proper cleanup
beforeAll(async () => {
  // Clean up any existing test data
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: 'test' } },
        { email: { contains: 'profile' } },
        // Add other test patterns
      ]
    }
  });
});

afterAll(async () => {
  // Clean up test data after tests
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: 'test' } },
        { email: { contains: 'profile' } }
      ]
    }
  });
});
```

### 4. File Upload Test Issues

**Problem**: Connection reset errors on file upload tests

**Potential Causes**:
- Missing uploads directory
- Multer configuration issues
- Test environment file handling

**Solution**:
```bash
# Ensure uploads directory exists
mkdir -p backend/uploads/profiles

# Check multer configuration in user.routes.ts
# Verify file path resolution in tests
```

### 5. JWT Token Issues

**Problem**: Tests fail with 401 "Unauthorized" errors

**Root Cause**: User deleted by other tests or token expired

**Solution**:
```typescript
// Ensure user exists before each test that needs authentication
beforeEach(async () => {
  // Verify user still exists or recreate if needed
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });
  
  if (!user) {
    // Recreate user and token
    testUser = await AuthService.register('testuser', 'test@example.com', 'Password123!');
    authToken = (await AuthService.login('test@example.com', 'Password123!')).token;
  }
});
```

## Test Isolation Best Practices

### 1. Database State Management
- Use separate test users for different test suites
- Clean up data before and after test runs
- Use transactions for test isolation when possible

### 2. Unique Test Data
```typescript
// Use unique identifiers to avoid conflicts
const timestamp = Date.now();
const testEmail = `test-${timestamp}@example.com`;
const testUsername = `testuser-${timestamp}`;
```

### 3. Environment Variables
```typescript
// Check for test environment
if (process.env.NODE_ENV !== 'test') {
  throw new Error('Tests should only run in test environment');
}
```

## Performance Considerations

### Test Execution Times
- Health tests: ~1s
- Auth tests: ~8s
- Rate limit tests: ~2s (due to rate limiting delays)
- User profile tests: ~16s (includes password hashing and file operations)

### Optimization Strategies
1. **Parallel Test Execution**: Use Jest's parallel execution carefully
2. **Database Transactions**: Wrap tests in transactions when possible
3. **Mock External Services**: Mock file uploads and external APIs
4. **Shared Test Setup**: Reuse database connections and test data

## Debugging Failed Tests

### 1. Enable Detailed Logging
```typescript
// In test files
console.log('Test user:', testUser);
console.log('Auth token:', authToken);
console.log('Response:', response.body);
```

### 2. Check Database State
```typescript
// Verify database state during tests
const userInDb = await prisma.user.findUnique({
  where: { email: 'test@example.com' }
});
console.log('User in database:', userInDb);
```

### 3. Isolate Failing Tests
```bash
# Run single test
npm test -- --testNamePattern="specific test name"

# Run with verbose output
npm test -- --verbose user.test.ts
```

### 4. Check Test Order Dependencies
- Tests should be independent and not rely on execution order
- Use proper setup/teardown in beforeAll/afterAll
- Avoid shared state between tests

## Test Coverage Goals

### Current Coverage
- Authentication: 100% of core functionality
- User Profiles: 91% (21/23 tests passing)
- Health Endpoints: 100%
- Rate Limiting: 100%

### Target Coverage
- All test suites: 100% passing
- Integration tests: No conflicts between suites
- Edge cases: Complete validation coverage
- Error handling: All error paths tested

## Continuous Integration Considerations

### CI/CD Pipeline Requirements
1. **Database Setup**: Ensure test database is available
2. **Environment Variables**: Set test-specific environment
3. **Service Dependencies**: Start required services (Redis, PostgreSQL)
4. **Test Isolation**: Run tests in isolated environments
5. **Cleanup**: Ensure proper cleanup after test runs

### Recommended CI Commands
```bash
# Setup
docker-compose up -d postgres redis
sleep 10  # Wait for services to be ready

# Migration and generation
npx prisma migrate deploy
npx prisma generate

# Run tests with proper environment
SKIP_RATE_LIMIT=true NODE_ENV=test npm test

# Cleanup
docker-compose down
```

## Future Improvements

### Test Infrastructure
1. **Test Database**: Use separate test database instance
2. **Test Data Factory**: Create test data factories for consistent data generation
3. **Mock Services**: Mock external services (file storage, email, etc.)
4. **Performance Tests**: Add performance and load testing

### Test Organization
1. **Test Categories**: Organize tests by feature/module
2. **Integration Tests**: Add end-to-end integration tests
3. **Contract Tests**: Add API contract testing
4. **Security Tests**: Add security-focused tests

## Key Environment Variables

```bash
# Core environment
NODE_ENV=test
DATABASE_URL="postgresql://postgres:password@localhost:5432/plastic_crack?schema=public"
REDIS_URL=redis://localhost:6379

# Test-specific
SKIP_RATE_LIMIT=true              # Disable rate limiting for tests
JWT_SECRET="test-jwt-secret"      # Test JWT secret
SESSION_SECRET="test-session"     # Test session secret

# Optional debugging
LOG_LEVEL=debug                   # Enable debug logging
```

## Troubleshooting Checklist

When tests fail, check:
- [ ] Database containers are running (`docker ps`)
- [ ] Database is accessible (`npx prisma db pull`)
- [ ] Environment variables are set correctly
- [ ] No conflicting test data exists
- [ ] Rate limiting is disabled if needed (`SKIP_RATE_LIMIT=true`)
- [ ] Proper cleanup in test setup/teardown
- [ ] JWT tokens are valid and not expired
- [ ] File upload directories exist
- [ ] No port conflicts with other services

This guide should help maintain consistent testing practices and quickly resolve common issues encountered during test execution.
