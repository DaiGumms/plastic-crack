# User Profile API Reference

## Base URL
```
/api/v1/users
```

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get Current User Profile

**GET** `/profile`

Get the authenticated user's complete profile information.

#### Headers
- `Authorization: Bearer <token>` (required)

#### Response
```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "profileImageUrl": "https://example.com/uploads/profiles/profile-123.jpg",
    "bio": "Software developer and 3D printing enthusiast",
    "location": "San Francisco, CA",
    "website": "https://johndoe.dev",
    "emailVerified": true,
    "isProfilePublic": true,
    "allowFollowers": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z",
    "lastLoginAt": "2025-01-02T12:00:00.000Z"
  }
}
```

#### Error Responses
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Server error

---

### 2. Update User Profile

**PUT** `/profile`

Update the authenticated user's profile information.

#### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

#### Request Body
```json
{
  "displayName": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Software developer and 3D printing enthusiast",
  "location": "San Francisco, CA",
  "website": "https://johndoe.dev"
}
```

#### Field Validation
- `displayName`: 1-50 characters (optional)
- `firstName`: 1-30 characters (optional)
- `lastName`: 1-30 characters (optional)
- `bio`: max 500 characters (optional)
- `location`: max 100 characters (optional)
- `website`: valid URL format (optional)

#### Rate Limiting
- 10 requests per minute per IP

#### Response
```json
{
  "message": "Profile updated successfully",
  "data": {
    // Updated user profile object
  }
}
```

#### Error Responses
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required
- `429 Too Many Requests`: Rate limit exceeded

---

### 3. Get Public User Profile

**GET** `/profile/:username`

Get a user's public profile by username.

#### Parameters
- `username`: User's username (3-30 characters, alphanumeric, underscore, hyphen)

#### Rate Limiting
- 100 requests per 15 minutes per IP

#### Response
```json
{
  "message": "Public profile retrieved successfully",
  "data": {
    "id": "user_id",
    "username": "johndoe",
    "displayName": "John Doe",
    "profileImageUrl": "https://example.com/uploads/profiles/profile-123.jpg",
    "bio": "Software developer and 3D printing enthusiast",
    "location": "San Francisco, CA",
    "website": "https://johndoe.dev",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Error Responses
- `400 Bad Request`: Invalid username format
- `404 Not Found`: User not found or profile is private
- `429 Too Many Requests`: Rate limit exceeded

---

### 4. Update Privacy Settings

**PUT** `/privacy`

Update the authenticated user's privacy settings.

#### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

#### Request Body
```json
{
  "isProfilePublic": true,
  "allowFollowers": true
}
```

#### Field Validation
- `isProfilePublic`: boolean (optional)
- `allowFollowers`: boolean (optional)

#### Rate Limiting
- 5 requests per minute per IP

#### Response
```json
{
  "message": "Privacy settings updated successfully",
  "data": {
    // Updated user profile object
  }
}
```

#### Error Responses
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required
- `429 Too Many Requests`: Rate limit exceeded

---

### 5. Upload Profile Image

**POST** `/profile-image`

Upload a new profile image for the authenticated user.

#### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: multipart/form-data`

#### Request Body (Form Data)
- `profileImage`: Image file (required)

#### File Restrictions
- **Max Size**: 5MB
- **Allowed Types**: JPEG, PNG, WebP, GIF
- **Processing**: Automatic filename generation

#### Rate Limiting
- 3 uploads per minute per IP

#### Response
```json
{
  "message": "Profile image updated successfully",
  "data": {
    // Updated user profile object with new profileImageUrl
  }
}
```

#### Error Responses
- `400 Bad Request`: No file provided or invalid file type
- `401 Unauthorized`: Authentication required
- `413 Payload Too Large`: File size exceeds limit
- `429 Too Many Requests`: Rate limit exceeded

#### Example using curl
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "profileImage=@/path/to/image.jpg" \
  http://localhost:3000/api/v1/users/profile-image
```

---

### 6. Change Password

**PUT** `/password`

Change the authenticated user's password.

#### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

#### Request Body
```json
{
  "currentPassword": "current_password",
  "newPassword": "new_secure_password123!"
}
```

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

#### Rate Limiting
- 3 requests per minute per IP

#### Response
```json
{
  "message": "Password changed successfully"
}
```

#### Error Responses
- `400 Bad Request`: Validation errors or incorrect current password
- `401 Unauthorized`: Authentication required
- `429 Too Many Requests`: Rate limit exceeded

---

### 7. Get User Statistics

**GET** `/statistics`

Get statistics for the authenticated user.

#### Headers
- `Authorization: Bearer <token>` (required)

#### Response
```json
{
  "message": "User statistics retrieved successfully",
  "data": {
    "totalCollections": 5,
    "totalModelLikes": 23,
    "followerCount": 15,
    "followingCount": 8
  }
}
```

#### Error Responses
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

---

### 8. Delete Account

**DELETE** `/account`

Permanently delete the authenticated user's account.

#### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

#### Request Body
```json
{
  "password": "user_password"
}
```

#### Rate Limiting
- 1 request per minute per IP

#### Response
```json
{
  "message": "Account deleted successfully"
}
```

#### Error Responses
- `400 Bad Request`: Missing password or incorrect password
- `401 Unauthorized`: Authentication required
- `429 Too Many Requests`: Rate limit exceeded

#### ⚠️ Warning
This action is irreversible and will permanently delete all user data.

---

## Error Response Format

All error responses follow this standard format:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific validation error"
    }
  ]
}
```

## Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `404 Not Found`: Resource not found
- `413 Payload Too Large`: File size exceeds limit
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

Rate limits are applied per IP address and reset at the specified intervals:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `GET /profile/:username` | 100 requests | 15 minutes |
| `PUT /profile` | 10 requests | 1 minute |
| `PUT /privacy` | 5 requests | 1 minute |
| `POST /profile-image` | 3 requests | 1 minute |
| `PUT /password` | 3 requests | 1 minute |
| `DELETE /account` | 1 request | 1 minute |

When rate limit is exceeded, the response includes:
```json
{
  "error": "Too many requests, please try again later.",
  "retryAfter": "1 minutes"
}
```

## Examples

### JavaScript/Fetch Example
```javascript
// Get user profile
const response = await fetch('/api/v1/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Update profile
const updateResponse = await fetch('/api/v1/users/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    displayName: 'New Display Name',
    bio: 'Updated bio'
  })
});

// Upload profile image
const formData = new FormData();
formData.append('profileImage', fileInput.files[0]);

const uploadResponse = await fetch('/api/v1/users/profile-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Python/Requests Example
```python
import requests

# Get user profile
response = requests.get(
    'http://localhost:3000/api/v1/users/profile',
    headers={'Authorization': f'Bearer {token}'}
)

# Update profile
update_data = {
    'displayName': 'New Display Name',
    'bio': 'Updated bio'
}
update_response = requests.put(
    'http://localhost:3000/api/v1/users/profile',
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    },
    json=update_data
)

# Upload profile image
with open('profile.jpg', 'rb') as f:
    files = {'profileImage': f}
    upload_response = requests.post(
        'http://localhost:3000/api/v1/users/profile-image',
        headers={'Authorization': f'Bearer {token}'},
        files=files
    )
```
