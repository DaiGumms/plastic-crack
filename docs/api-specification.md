# API Specification - Plastic Crack

## 1. API Overview

The Plastic Crack API follows RESTful principles and provides comprehensive endpoints for managing
Warhammer collections across mobile and web platforms. The API includes AI-powered features,
real-time pricing, and social functionality.

### 1.1 Base Configuration

- **Base URL**: `https://api.plasticcrack.com/v1`
- **Content Type**: `application/json`
- **Authentication**: Bearer JWT tokens + OAuth2
- **Rate Limiting**: 1000 requests per hour per user (5000 for premium users)
- **WebSocket**: `wss://api.plasticcrack.com/ws` for real-time features
- **Mobile SDK**: Native SDKs for iOS and Android with offline sync

### 1.2 Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2025-07-12T16:30:00Z",
  "version": "1.0.0",
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "hasNext": true
    }
  }
}
```

### 1.3 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2025-07-12T16:30:00Z",
  "requestId": "req_abc123"
}
```

### 1.4 Mobile-Specific Headers

```http
X-Platform: ios|android|web
X-App-Version: 1.2.3
X-Device-ID: unique-device-identifier
X-Offline-Sync: true|false
```

## 2. Authentication Endpoints

### 2.1 User Registration

```http
POST /auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "hobbyist123",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "platform": "ios|android|web",
  "deviceId": "unique-device-id",
  "marketingConsent": true
}
```

### 2.2 User Login

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "username": "warhammer_fan",
      "firstName": "John",
      "lastName": "Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_abc123..."
  }
}
```

### 2.3 OAuth Login

```http
POST /auth/oauth/{provider}
```

**Supported Providers**: `google`, `facebook`, `apple`

**Request Body:**

```json
{
  "accessToken": "oauth_access_token",
  "platform": "ios|android|web",
  "deviceId": "unique-device-id"
}
```

### 2.4 Token Refresh

```http
POST /auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "rt_abc123..."
}
```

### 2.5 Logout

```http
POST /auth/logout
Authorization: Bearer <access_token>
```

## 3. User Management Endpoints

### 3.1 Get Current User Profile

```http
GET /users/me
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "warhammer_fan",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Passionate Warhammer 40K collector",
    "location": "London, UK",
    "avatar": "https://cdn.plasticcrack.com/avatars/user_123.jpg",
    "stats": {
      "totalModels": 156,
      "paintedModels": 89,
      "armies": 3,
      "followers": 42,
      "following": 15
    },
    "settings": {
      "privacy": "public",
      "notifications": true,
      "newsletter": false
    },
    "createdAt": "2025-01-15T10:20:30Z",
    "updatedAt": "2025-07-12T16:30:00Z"
  }
}
```

### 3.2 Update User Profile

```http
PUT /users/me
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "bio": "Updated bio text",
  "location": "Manchester, UK",
  "settings": {
    "privacy": "friends",
    "notifications": false
  }
}
```

### 3.3 Get User by ID

```http
GET /users/{userId}
```

### 3.4 Follow/Unfollow User

```http
POST /users/{userId}/follow
DELETE /users/{userId}/follow
Authorization: Bearer <access_token>
```

## 4. Collection Management Endpoints

### 4.1 Get User Collections

```http
GET /collections
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `faction` (string): Filter by faction
- `gameSystem` (string): Filter by game system
- `status` (string): Filter by painting status
- `search` (string): Search term

**Response (200):**

```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "model_456",
        "name": "Space Marine Tactical Squad",
        "faction": "Space Marines",
        "gameSystem": "Warhammer 40,000",
        "pointsValue": 100,
        "paintingStatus": "finished",
        "quantity": 10,
        "photos": ["https://cdn.plasticcrack.com/models/model_456_1.jpg"],
        "tags": ["troops", "firstborn"],
        "notes": "Blue and gold color scheme",
        "purchaseDate": "2025-03-15",
        "purchasePrice": 35.0,
        "currency": "GBP",
        "createdAt": "2025-03-20T14:30:00Z",
        "updatedAt": "2025-07-01T09:15:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    },
    "filters": {
      "factions": ["Space Marines", "Chaos", "Orks"],
      "gameSystems": ["Warhammer 40,000", "Kill Team"],
      "statuses": ["unpainted", "basecoated", "detailed", "finished"]
    }
  }
}
```

### 4.2 Add New Model

```http
POST /collections/models
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**

```json
{
  "name": "Space Marine Captain",
  "faction": "Space Marines",
  "gameSystem": "Warhammer 40,000",
  "pointsValue": 90,
  "paintingStatus": "unpainted",
  "quantity": 1,
  "tags": ["hq", "character"],
  "notes": "Alternative build with power sword",
  "purchaseDate": "2025-07-12",
  "purchasePrice": 22.5,
  "currency": "GBP"
}
```

### 4.3 Update Model

```http
PUT /collections/models/{modelId}
Authorization: Bearer <access_token>
```

### 4.4 Delete Model

```http
DELETE /collections/models/{modelId}
Authorization: Bearer <access_token>
```

### 4.5 Upload Model Photos

```http
POST /collections/models/{modelId}/photos
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**

- `photos[]` (files): Image files (max 5MB each, max 10 photos per model)

### 4.6 Bulk Operations

```http
POST /collections/models/bulk
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "action": "update_status",
  "modelIds": ["model_456", "model_789"],
  "data": {
    "paintingStatus": "basecoated"
  }
}
```

## 5. Army Management Endpoints

### 5.1 Get User Armies

```http
GET /armies
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "armies": [
      {
        "id": "army_123",
        "name": "Ultramarines 3rd Company",
        "faction": "Space Marines",
        "gameSystem": "Warhammer 40,000",
        "totalPoints": 2000,
        "modelCount": 45,
        "description": "Battle-ready company for competitive play",
        "models": [
          {
            "modelId": "model_456",
            "name": "Space Marine Tactical Squad",
            "quantity": 10,
            "pointsValue": 100
          }
        ],
        "createdAt": "2025-02-01T12:00:00Z"
      }
    ]
  }
}
```

### 5.2 Create Army

```http
POST /armies
Authorization: Bearer <access_token>
```

### 5.3 Add Models to Army

```http
POST /armies/{armyId}/models
Authorization: Bearer <access_token>
```

## 6. Search and Discovery Endpoints

### 6.1 Global Model Search

```http
GET /search/models
```

**Query Parameters:**

- `q` (string): Search query
- `faction` (string): Filter by faction
- `gameSystem` (string): Filter by game system
- `public` (boolean): Only public collections (default: true)

### 6.2 User Search

```http
GET /search/users
```

### 6.3 Collection Search

```http
GET /search/collections
```

## 7. Social Features Endpoints

### 7.1 Get Activity Feed

```http
GET /feed
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity_789",
        "type": "model_added",
        "user": {
          "id": "user_456",
          "username": "chaos_lord",
          "avatar": "https://cdn.plasticcrack.com/avatars/user_456.jpg"
        },
        "data": {
          "modelName": "Chaos Space Marine Squad",
          "modelId": "model_999"
        },
        "timestamp": "2025-07-12T15:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150
    }
  }
}
```

### 7.2 Like/Unlike Model

```http
POST /collections/models/{modelId}/like
DELETE /collections/models/{modelId}/like
Authorization: Bearer <access_token>
```

### 7.3 Comment on Model

```http
POST /collections/models/{modelId}/comments
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "content": "Amazing paint job! What colors did you use?"
}
```

### 7.4 Get Model Comments

```http
GET /collections/models/{modelId}/comments
```

## 8. Wishlist Endpoints

### 8.1 Get Wishlist

```http
GET /wishlist
Authorization: Bearer <access_token>
```

### 8.2 Add to Wishlist

```http
POST /wishlist
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "Imperial Knight Questoris",
  "faction": "Imperial Knights",
  "gameSystem": "Warhammer 40,000",
  "estimatedPrice": 120.0,
  "currency": "GBP",
  "priority": "high",
  "notes": "For upcoming tournament"
}
```

## 9. Statistics and Analytics Endpoints

### 9.1 Get User Statistics

```http
GET /users/me/stats
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalModels": 156,
      "paintedModels": 89,
      "paintingProgress": 57.1,
      "totalValue": 2340.5,
      "currency": "GBP"
    },
    "byFaction": [
      {
        "faction": "Space Marines",
        "modelCount": 78,
        "painted": 45,
        "value": 1200.0
      }
    ],
    "byGameSystem": [
      {
        "gameSystem": "Warhammer 40,000",
        "modelCount": 120,
        "painted": 70
      }
    ],
    "paintingProgress": {
      "thisMonth": 12,
      "lastMonth": 8,
      "thisYear": 89
    },
    "spending": {
      "thisMonth": 85.0,
      "thisYear": 890.5,
      "currency": "GBP"
    }
  }
}
```

## 10. File Upload Endpoints

### 10.1 Upload Avatar

```http
POST /users/me/avatar
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

### 10.2 Get Upload URL (for large files)

```http
POST /upload/presigned-url
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "fileName": "space_marine_squad.jpg",
  "fileType": "image/jpeg",
  "fileSize": 2048576
}
```

## 11. Admin Endpoints

### 11.1 Get All Users (Admin Only)

```http
GET /admin/users
Authorization: Bearer <admin_access_token>
```

### 11.2 Product Database Management

```http
GET /admin/products
POST /admin/products
PUT /admin/products/{productId}
DELETE /admin/products/{productId}
Authorization: Bearer <admin_access_token>
```

## 12. Data Export Endpoints

### 12.1 Export User Data

```http
GET /export/user-data
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `format` (string): Export format (json, csv, xml)

### 12.2 Export Collection

```http
GET /export/collection
Authorization: Bearer <access_token>
```

## 13. Error Codes

| Code                | HTTP Status | Description                     |
| ------------------- | ----------- | ------------------------------- |
| VALIDATION_ERROR    | 400         | Request validation failed       |
| UNAUTHORIZED        | 401         | Authentication required         |
| FORBIDDEN           | 403         | Insufficient permissions        |
| NOT_FOUND           | 404         | Resource not found              |
| CONFLICT            | 409         | Resource conflict               |
| RATE_LIMITED        | 429         | Rate limit exceeded             |
| SERVER_ERROR        | 500         | Internal server error           |
| SERVICE_UNAVAILABLE | 503         | Service temporarily unavailable |

## 14. Rate Limiting

### 14.1 Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1625151600
```

### 14.2 Rate Limit Tiers

- **Anonymous**: 100 requests/hour
- **Authenticated**: 1000 requests/hour
- **Premium**: 5000 requests/hour
- **Admin**: Unlimited
