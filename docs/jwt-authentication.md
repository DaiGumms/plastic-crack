# JWT Authentication System Documentation

## Overview

This document describes the JWT-based authentication system implemented for the Plastic Crack
application. The system provides secure user registration, login, token refresh, and user session
management.

## Features Implemented

### ✅ Completed Features

- **User Registration**: Secure user registration with email and username validation
- **User Login**: JWT token-based authentication with bcrypt password hashing
- **Token Generation**: Unique JWT tokens with proper expiration
- **Token Refresh**: Ability to refresh tokens for extended sessions
- **Password Security**: Strong password validation and bcrypt hashing (12 rounds)
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation for all auth endpoints
- **Error Handling**: Proper error responses and security considerations
- **Comprehensive Testing**: Full test coverage for all auth functionality

### 🔧 Future Enhancements (Structure in Place)

- **Email Verification**: Endpoint structure ready for email verification
- **Password Reset**: Endpoint structure ready for password reset functionality
- **Token Blacklisting**: Infrastructure ready for logout token invalidation

## API Endpoints

### Authentication Routes (`/api/v1/auth`)

#### POST `/register`

Register a new user account.

**Rate Limiting**: 5 requests per 15 minutes per IP

**Request Body**:

```json
{
  "username": "string (3-30 chars, alphanumeric + _ -)",
  "email": "string (valid email)",
  "password": "string (8+ chars, mixed case, number, special char)",
  "displayName": "string (optional, 1-50 chars)"
}
```

**Response (201)**:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "displayName": "string",
    "profilePictureUrl": "string|null",
    "createdAt": "datetime"
  },
  "token": "string (JWT)"
}
```

#### POST `/login`

Authenticate user and receive JWT token.

**Rate Limiting**: 3 requests per 15 minutes per IP

**Request Body**:

```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200)**:

```json
{
  "message": "Login successful",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "displayName": "string",
    "profilePictureUrl": "string|null",
    "createdAt": "datetime"
  },
  "token": "string (JWT)"
}
```

#### GET `/me`

Get current user information (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "displayName": "string",
    "profilePictureUrl": "string|null",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

#### POST `/refresh`

Refresh JWT token for extended session.

**Rate Limiting**: 5 requests per 15 minutes per IP **Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "message": "Token refreshed successfully",
  "token": "string (new JWT)"
}
```

#### POST `/logout`

Logout user (client-side token removal).

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "message": "Logout successful"
}
```

#### GET `/validate-token`

Validate current JWT token.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "valid": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "displayName": "string"
  }
}
```

#### POST `/verify-email` (Future)

Verify user email address.

**Rate Limiting**: 5 requests per 15 minutes per IP

**Request Body**:

```json
{
  "token": "string (verification token)"
}
```

#### POST `/request-password-reset` (Future)

Request password reset email.

**Rate Limiting**: 3 requests per hour per IP

**Request Body**:

```json
{
  "email": "string"
}
```

## Security Features

### Password Security

- **Hashing**: bcrypt with 12 salt rounds
- **Validation**: Minimum 8 characters, uppercase, lowercase, number, special character
- **Timing Attack Protection**: Consistent response times for invalid credentials

### JWT Security

- **Secret Key**: Configurable via environment variable (`JWT_SECRET`)
- **Expiration**: 7 days default (`JWT_EXPIRES_IN`)
- **Unique Tokens**: Each token includes a unique identifier (jti) for revocation capability
- **Proper Verification**: Comprehensive token validation with error handling

### Rate Limiting

- **Authentication**: 5 requests per 15 minutes
- **Login**: 3 requests per 15 minutes (stricter)
- **Password Reset**: 3 requests per hour
- **Test Environment**: Rate limiting disabled for testing

### Input Validation

- **Email**: RFC compliant email validation
- **Username**: Alphanumeric with underscores and hyphens
- **Password**: Strength requirements enforced
- **Sanitization**: Email normalization and input cleaning

## Database Schema

### User Model

```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  username          String   @unique
  displayName       String?
  firstName         String?
  lastName          String?
  profileImageUrl   String?
  bio               String?
  location          String?
  website           String?

  // Authentication
  passwordHash      String
  emailVerified     Boolean  @default(false)
  emailVerifiedAt   DateTime?

  // Account Status
  isActive          Boolean  @default(true)
  lastLoginAt       DateTime?

  // Privacy Settings
  isProfilePublic   Boolean  @default(true)
  allowFollowers    Boolean  @default(true)

  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  collections       Collection[]
  models            Model[]
  modelLikes        ModelLike[]
  followers         UserRelationship[] @relation("UserFollowers")
  following         UserRelationship[] @relation("UserFollowing")

  @@map("users")
}
```

## Error Handling

### Standard Error Response Format

```json
{
  "error": "string (error message)",
  "details": "array (validation errors, optional)"
}
```

### HTTP Status Codes

- **200**: Success
- **201**: Created (registration)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid credentials, missing token)
- **403**: Forbidden (invalid/expired token)
- **409**: Conflict (duplicate email/username)
- **429**: Too Many Requests (rate limiting)
- **500**: Internal Server Error

## Environment Variables

### Required

```env
JWT_SECRET=your-secure-secret-key-here
DATABASE_URL=postgresql://...
```

### Optional

```env
NODE_ENV=development|production|test
JWT_EXPIRES_IN=7d
```

## Testing

### Test Coverage

- ✅ User registration (valid/invalid cases)
- ✅ User login (valid/invalid credentials)
- ✅ Token validation and refresh
- ✅ Password hashing and verification
- ✅ JWT token generation and verification
- ✅ Password strength validation
- ✅ Email verification token generation
- ✅ Error handling and edge cases

### Running Tests

```bash
# Run all auth tests
npm test auth.test.ts

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Usage Examples

### Frontend Integration

#### Registration

```javascript
const response = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'SecurePassword123!',
    displayName: 'John Doe',
  }),
});

const data = await response.json();
if (response.ok) {
  // Store token
  localStorage.setItem('authToken', data.token);
  // Redirect to dashboard
}
```

#### Login

```javascript
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePassword123!',
  }),
});

const data = await response.json();
if (response.ok) {
  localStorage.setItem('authToken', data.token);
}
```

#### Authenticated Requests

```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('/api/v1/auth/me', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

if (response.status === 401) {
  // Token expired, redirect to login
  localStorage.removeItem('authToken');
  window.location.href = '/login';
}
```

#### Token Refresh

```javascript
const refreshToken = async () => {
  const token = localStorage.getItem('authToken');

  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data.token;
  }

  // Refresh failed, redirect to login
  localStorage.removeItem('authToken');
  window.location.href = '/login';
};

// Set up automatic refresh before token expires
setInterval(refreshToken, 6 * 24 * 60 * 60 * 1000); // 6 days
```

## Security Considerations

### Production Deployment

1. **Environment Variables**: Use strong, unique JWT secrets
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Monitor and adjust rate limits based on usage
4. **Token Expiration**: Consider shorter token lifetimes for sensitive applications
5. **Logging**: Implement proper security event logging
6. **Database Security**: Use connection pooling and prepared statements

### Development Best Practices

1. **Secret Management**: Never commit secrets to version control
2. **Token Storage**: Use secure storage mechanisms (httpOnly cookies for web)
3. **CORS**: Configure appropriate CORS policies
4. **Input Validation**: Always validate and sanitize user input
5. **Error Messages**: Avoid exposing sensitive information in error messages

## Troubleshooting

### Common Issues

#### "Invalid or expired token"

- Check token format (Bearer prefix)
- Verify token hasn't expired
- Ensure JWT_SECRET matches between token generation and verification

#### "Too many requests"

- Rate limiting triggered
- Wait for rate limit window to reset
- Consider implementing exponential backoff

#### "Email already registered"

- User attempting to register with existing email
- Implement "forgot password" flow instead

#### "Invalid credentials"

- Incorrect email or password
- Check for typos and case sensitivity
- Verify user account is active

### Debug Mode

In development environment, set `NODE_ENV=development` for additional logging and debug information.

## Migration and Updates

### Database Migrations

```bash
# Generate migration after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset
```

### Backward Compatibility

- Token format changes require user re-authentication
- Database schema changes should use migrations
- API versioning for breaking changes

## Monitoring and Analytics

### Metrics to Track

- Registration success/failure rates
- Login attempt patterns
- Token refresh frequency
- Rate limiting triggers
- Authentication errors

### Security Monitoring

- Failed login attempts
- Unusual access patterns
- Rate limiting violations
- Token validation failures

This JWT authentication system provides a robust, secure foundation for user authentication in the
Plastic Crack application while maintaining flexibility for future enhancements.
