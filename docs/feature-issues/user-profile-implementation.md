# User Profile CRUD Implementation Documentation

## Overview

This document provides comprehensive documentation for the User Profile CRUD operations
implementation (Issue #6) in the Plastic Crack application. The implementation provides a complete
user profile management system with authentication, validation, file uploads, and security features.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client/API    │───▶│   Route Layer    │───▶│  Service Layer  │
│                 │    │                  │    │                 │
│ HTTP Requests   │    │ - Validation     │    │ - Business Logic│
│ JSON Responses  │    │ - Authentication │    │ - Database Ops  │
│ File Uploads    │    │ - Rate Limiting  │    │ - Data Transform│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Middleware      │    │   Database      │
                       │                  │    │                 │
                       │ - Auth Tokens    │    │ - Prisma ORM    │
                       │ - File Upload    │    │ - PostgreSQL    │
                       │ - Error Handling │    │ - User Model    │
                       └──────────────────┘    └─────────────────┘
```

## Feature Implementation

### 1. Core Profile Management

#### Get User Profile (`GET /api/v1/users/profile`)

- **Purpose**: Retrieve authenticated user's complete profile information
- **Authentication**: Required (JWT token)
- **Response**: Full profile including private fields
- **Rate Limiting**: None (read operation)

```typescript
// Returns complete user profile with sensitive data excluded
interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  emailVerified: boolean;
  isProfilePublic: boolean;
  allowFollowers: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}
```

#### Update User Profile (`PUT /api/v1/users/profile`)

- **Purpose**: Update user's profile information
- **Authentication**: Required
- **Rate Limiting**: 10 requests per minute
- **Validation**: Field length limits, URL format validation
- **Fields**: displayName, firstName, lastName, bio, location, website

**Validation Rules:**

- `displayName`: 1-50 characters
- `firstName`: 1-30 characters
- `lastName`: 1-30 characters
- `bio`: max 500 characters
- `location`: max 100 characters
- `website`: valid URL format

### 2. Privacy Management

#### Update Privacy Settings (`PUT /api/v1/users/privacy`)

- **Purpose**: Control profile visibility and follower permissions
- **Authentication**: Required
- **Rate Limiting**: 5 requests per minute
- **Fields**:
  - `isProfilePublic`: Boolean - controls public profile visibility
  - `allowFollowers`: Boolean - controls who can follow the user

#### Public Profile Access (`GET /api/v1/users/profile/:username`)

- **Purpose**: View other users' public profiles
- **Authentication**: Not required
- **Rate Limiting**: 100 requests per 15 minutes
- **Privacy**: Only shows public profiles, excludes sensitive information

```typescript
// Public profile excludes private information
interface PublicUserProfile {
  id: string;
  username: string;
  displayName: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  createdAt: Date;
}
```

### 3. Profile Image Management

#### Upload Profile Image (`POST /api/v1/users/profile-image`)

- **Purpose**: Upload and set user profile image
- **Authentication**: Required
- **Rate Limiting**: 3 uploads per minute
- **File Restrictions**:
  - Max size: 5MB
  - Allowed types: JPEG, PNG, WebP, GIF
  - Automatic filename generation with timestamp
- **Storage**: Local filesystem with static serving
- **Error Handling**: Automatic cleanup of failed uploads

**Multer Configuration:**

```typescript
const upload = multer({
  storage: multer.diskStorage({
    destination: '../../../uploads/profiles',
    filename: 'profile-{timestamp}-{random}.{ext}',
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: allowedImageTypes,
});
```

### 4. Account Security

#### Change Password (`PUT /api/v1/users/password`)

- **Purpose**: Update user account password
- **Authentication**: Required
- **Rate Limiting**: 3 requests per minute
- **Security**:
  - Current password verification required
  - New password strength validation
  - Uses bcrypt for hashing

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%\*?&)

#### Delete Account (`DELETE /api/v1/users/account`)

- **Purpose**: Permanently delete user account
- **Authentication**: Required
- **Rate Limiting**: 1 request per minute
- **Security**: Password confirmation required
- **Data**: Cascaded deletion of related records

### 5. User Statistics

#### Get User Statistics (`GET /api/v1/users/statistics`)

- **Purpose**: Retrieve user activity metrics
- **Authentication**: Required
- **Rate Limiting**: None
- **Metrics**:
  - Total collections count
  - Total model likes count
  - Follower count
  - Following count

## File Structure

```
backend/src/
├── routes/v1/
│   ├── user.routes.ts          # API route definitions
│   └── index.ts                # Route registration
├── services/
│   └── user.service.ts         # Business logic layer
├── middleware/
│   ├── auth.middleware.ts      # JWT authentication
│   └── rateLimiter.ts          # Rate limiting
├── types/
│   └── auth.ts                 # TypeScript interfaces
└── __tests__/
    └── user.test.ts            # Comprehensive test suite
```

## Security Implementation

### Authentication & Authorization

- **JWT Token Validation**: All protected routes validate JWT tokens
- **User Context**: Authenticated requests include user information
- **Type Safety**: `AuthenticatedRequest` interface ensures type safety

### Input Validation

- **Express Validator**: Comprehensive input validation
- **XSS Prevention**: Input sanitization and trimming
- **SQL Injection**: Prisma ORM provides protection
- **File Upload Security**: Type and size restrictions

### Rate Limiting

- **Endpoint-Specific Limits**: Different limits per endpoint based on sensitivity
- **IP-based Tracking**: Rate limits applied per IP address
- **Environment Awareness**: Disabled in test environment

### Error Handling

- **Consistent Responses**: Standardized error message format
- **Information Disclosure**: No sensitive data in error messages
- **File Cleanup**: Automatic cleanup of failed uploads
- **Logging**: Error logging in non-test environments

## Database Schema Integration

### User Model Fields

```prisma
model User {
  id                String    @id @default(cuid())
  username          String    @unique
  email             String    @unique
  passwordHash      String
  displayName       String?
  firstName         String?
  lastName          String?
  profileImageUrl   String?
  bio               String?
  location          String?
  website           String?
  emailVerified     Boolean   @default(false)
  isProfilePublic   Boolean   @default(true)
  allowFollowers    Boolean   @default(true)
  accountStatus     String    @default("active")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastLoginAt       DateTime?

  // Relations for statistics
  collections       Collection[]
  modelLikes        ModelLike[]
  followers         UserRelationship[] @relation("UserFollowers")
  following         UserRelationship[] @relation("UserFollowing")
}
```

## API Endpoints Summary

| Method | Endpoint                          | Purpose            | Auth     | Rate Limit |
| ------ | --------------------------------- | ------------------ | -------- | ---------- |
| GET    | `/api/v1/users/profile`           | Get own profile    | Required | None       |
| PUT    | `/api/v1/users/profile`           | Update profile     | Required | 10/min     |
| GET    | `/api/v1/users/profile/:username` | Get public profile | None     | 100/15min  |
| PUT    | `/api/v1/users/privacy`           | Update privacy     | Required | 5/min      |
| POST   | `/api/v1/users/profile-image`     | Upload image       | Required | 3/min      |
| PUT    | `/api/v1/users/password`          | Change password    | Required | 3/min      |
| GET    | `/api/v1/users/statistics`        | Get statistics     | Required | None       |
| DELETE | `/api/v1/users/account`           | Delete account     | Required | 1/min      |

## Testing Strategy

### Test Coverage

- **Unit Tests**: 23 comprehensive test cases
- **Integration Tests**: Full API endpoint testing
- **Error Scenarios**: Invalid inputs, authentication failures
- **File Upload Tests**: Mock file uploads and validation
- **Security Tests**: Authentication and authorization testing

### Test Categories

1. **Profile Management**: CRUD operations
2. **Privacy Controls**: Public/private profile access
3. **File Uploads**: Image upload validation
4. **Security**: Password changes, account deletion
5. **Validation**: Input validation and error responses
6. **Rate Limiting**: Request throttling verification

## Deployment Considerations

### Environment Variables

```env
BASE_URL=http://localhost:3000          # Base URL for file serving
DATABASE_URL=postgresql://...           # Database connection
JWT_SECRET=your-secret-key              # JWT signing secret
NODE_ENV=production                     # Environment
SKIP_RATE_LIMIT=false                   # Rate limiting control
```

### File Storage

- **Development**: Local filesystem storage
- **Production Recommendation**: Cloud storage (AWS S3, Cloudinary)
- **Static Serving**: Express static middleware configured
- **Upload Directory**: `backend/uploads/profiles/`

### Performance Optimization

- **Database Indexing**: Username and email fields indexed
- **Query Optimization**: Selective field queries
- **File Size Limits**: 5MB upload limit
- **Rate Limiting**: Prevents abuse and DoS

## Error Responses

### Standard Error Format

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `404`: Not Found (user/resource not found)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Future Enhancements

### Recommended Improvements

1. **Cloud Storage Integration**: Replace local file storage
2. **Image Processing**: Automatic resizing and optimization
3. **Email Verification**: Profile update notifications
4. **Audit Logging**: Track profile changes
5. **Bulk Operations**: Batch profile updates
6. **Advanced Privacy**: Granular visibility controls
7. **Profile Validation**: Admin approval workflow
8. **Social Features**: Profile recommendations

### Scalability Considerations

1. **Caching**: Profile data caching with Redis
2. **CDN Integration**: Static asset delivery
3. **Database Optimization**: Query optimization and indexing
4. **Microservices**: Separate user service
5. **Event Streaming**: Profile change events
6. **Load Balancing**: Multiple server instances

## Troubleshooting Guide

### Common Issues

#### Database Connection Errors

```bash
# Check database status
npm run db:status

# Reset database
npm run db:reset
```

#### File Upload Issues

- Check upload directory permissions
- Verify file size limits
- Ensure allowed file types

#### Authentication Failures

- Verify JWT secret configuration
- Check token expiration
- Validate middleware order

#### Rate Limiting Issues

- Set `SKIP_RATE_LIMIT=true` for testing
- Check Redis connection for distributed rate limiting
- Verify IP address detection

## Conclusion

The User Profile CRUD implementation provides a robust, secure, and scalable foundation for user
profile management. The modular architecture allows for easy maintenance and future enhancements
while maintaining security and performance standards.

**Key Strengths:**

- Comprehensive input validation
- Strong security measures
- Flexible privacy controls
- Thorough error handling
- Complete test coverage
- TypeScript type safety
- Production-ready design

This implementation successfully addresses all requirements of Issue #6 and provides a solid
foundation for future user management features.
