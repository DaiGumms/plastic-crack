# Redis Integration Documentation

## Overview

This document describes the Redis integration implementation for the Plastic Crack backend API,
which provides caching, session management, and performance optimization features.

## Table of Contents

1. [Features Implemented](#features-implemented)
2. [Architecture Overview](#architecture-overview)
3. [Configuration](#configuration)
4. [API Endpoints](#api-endpoints)
5. [Usage Examples](#usage-examples)
6. [Middleware Usage](#middleware-usage)
7. [Session Management](#session-management)
8. [Error Handling](#error-handling)
9. [Performance Considerations](#performance-considerations)
10. [Monitoring and Health Checks](#monitoring-and-health-checks)

## Features Implemented

### ✅ Core Redis Features

- **Redis Client Configuration**: Fully configured Redis client with connection pooling
- **Session Store**: Express session management with Redis persistence
- **Caching Middleware**: HTTP response caching with TTL support
- **Connection Pooling**: Efficient Redis connection management
- **Health Monitoring**: Real-time Redis health checking and diagnostics

### ✅ Advanced Features

- **Cache Invalidation**: Pattern-based cache invalidation
- **User-Specific Caching**: Session-aware caching strategies
- **Graceful Degradation**: Application continues to work when Redis is unavailable
- **Automatic Reconnection**: Built-in reconnection logic with exponential backoff
- **Performance Metrics**: Cache statistics and monitoring

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express App   │────│  Cache Middle   │────│   Redis Client  │
│                 │    │     ware        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│  Session Store  │──────────────┘
                        │                 │
                        └─────────────────┘
```

### Key Components

1. **Redis Client** (`src/lib/redis.ts`)
   - Connection management
   - Health monitoring
   - Cache service factory

2. **Session Management** (`src/lib/session.ts`)
   - Redis-backed session store
   - Secure session configuration

3. **Cache Middleware** (`src/middleware/cache.ts`)
   - HTTP response caching
   - Cache invalidation
   - TTL management

4. **API Routes** (`src/routes/v1/redis.ts`)
   - Redis testing endpoints
   - Cache management APIs

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=plastic-crack:
REDIS_MAX_RETRIES=3
REDIS_RETRY_DELAY=100
REDIS_CONNECT_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-in-production
SESSION_NAME=plastic-crack-session
SESSION_MAX_AGE=86400000
```

### Configuration Object

The configuration is centralized in `src/config/config.ts`:

```typescript
redis: {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'plastic-crack:',
  maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000'),
  commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000'),
}
```

## API Endpoints

### Health and Status

#### `GET /health`

General application health check including Redis status.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-07-12T22:01:20.595Z",
  "version": "0.1.0",
  "environment": "development",
  "uptime": 28.307468,
  "services": {
    "redis": {
      "status": "healthy",
      "message": "Redis is healthy. Ping: PONG"
    }
  }
}
```

#### `GET /api/v1/redis/status`

Redis-specific connection status.

**Response:**

```json
{
  "success": true,
  "data": {
    "connected": true,
    "timestamp": "2025-07-12T22:01:31.847Z"
  }
}
```

### Cache Management

#### `POST /api/v1/redis/test-set`

Set a value in Redis cache.

**Request Body:**

```json
{
  "key": "user:123",
  "value": { "name": "John", "email": "john@example.com" },
  "ttl": 3600
}
```

**Response:**

```json
{
  "success": true,
  "message": "Value set in cache",
  "data": {
    "key": "user:123",
    "value": { "name": "John", "email": "john@example.com" },
    "ttl": 3600
  }
}
```

#### `GET /api/v1/redis/test-get/:key`

Retrieve a value from Redis cache.

**Response:**

```json
{
  "success": true,
  "data": {
    "key": "user:123",
    "value": { "name": "John", "email": "john@example.com" },
    "found": true
  }
}
```

#### `DELETE /api/v1/redis/test-delete/:key`

Delete a value from Redis cache.

**Response:**

```json
{
  "success": true,
  "data": {
    "key": "user:123",
    "deleted": true
  }
}
```

#### `GET /api/v1/redis/test-cached`

Cached endpoint demonstrating HTTP response caching.

**Response:**

```json
{
  "success": true,
  "message": "This response is cached for 60 seconds",
  "data": {
    "timestamp": "2025-07-12T22:01:39.518Z",
    "random": 0.29515441397662645,
    "query": {}
  }
}
```

#### `GET /api/v1/redis/stats`

Get cache statistics and information.

**Response:**

```json
{
  "success": true,
  "data": {
    "connected": true,
    "totalKeys": 5,
    "keyPatterns": [
      "plastic-crack:cache:health:30",
      "plastic-crack:test:user:123",
      "plastic-crack:session:abc123"
    ],
    "timestamp": "2025-07-12T22:01:45.123Z"
  }
}
```

## Usage Examples

### Using the Cache Service Directly

```typescript
import { createCacheService } from '../lib/redis';

// Create cache service instance
const cache = createCacheService('user:');

// Set a value with TTL
await cache.set(
  'profile:123',
  {
    name: 'John Doe',
    email: 'john@example.com',
  },
  3600
); // 1 hour TTL

// Get a value
const userProfile = await cache.get('profile:123');

// Delete a value
await cache.del('profile:123');

// Check if key exists
const exists = await cache.exists('profile:123');

// Set expiration on existing key
await cache.expire('profile:123', 7200);

// Get TTL for a key
const ttl = await cache.ttl('profile:123');

// Delete multiple keys by pattern
await cache.deletePattern('profile:*');

// Get all keys matching pattern
const keys = await cache.getKeys('profile:*');
```

### Using Cache Middleware

```typescript
import { cache } from '../middleware/cache';

// Cache response for 300 seconds (5 minutes)
router.get('/api/users', cache(300), async (req, res) => {
  const users = await getUsersFromDatabase();
  res.json(users);
});

// Cache with custom key based on user ID
router.get(
  '/api/users/:id',
  cache(600, req => `user:${req.params.id}`),
  async (req, res) => {
    const user = await getUserById(req.params.id);
    res.json(user);
  }
);
```

### Session Management

Sessions are automatically managed when you include the session middleware:

```typescript
// Sessions are automatically available in routes
router.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Authenticate user
  const user = await authenticateUser(email, password);

  if (user) {
    // Store user in session
    req.session.userId = user.id;
    req.session.email = user.email;

    res.json({ success: true, user });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Access session data in other routes
router.get('/api/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = await getUserById(req.session.userId);
  res.json(user);
});
```

## Middleware Usage

### Cache Middleware

The cache middleware can be applied to any route:

```typescript
import { cache, invalidateCache } from '../middleware/cache';

// Basic caching with TTL
router.get('/api/data', cache(300), handler);

// Custom cache key generation
router.get(
  '/api/user/:id',
  cache(600, req => `user:${req.params.id}`),
  handler
);

// Cache invalidation on data changes
router.post('/api/users', invalidateCache('user:*'), async (req, res) => {
  // Create user logic
  res.json(newUser);
});
```

### Session Middleware

Sessions are automatically configured in `src/app.ts`:

```typescript
import { initializeSession } from './lib/session';

// Session middleware is automatically applied
app.use(await initializeSession());
```

## Session Management

### Session Configuration

Sessions are configured with the following security features:

- **Secure cookies** in production
- **HttpOnly** flag to prevent XSS
- **SameSite** attribute for CSRF protection
- **Automatic session rotation**
- **Redis persistence** for scalability

### Session Data Access

```typescript
// Store session data
req.session.userId = user.id;
req.session.preferences = userPreferences;

// Access session data
const userId = req.session.userId;

// Destroy session
req.session.destroy(err => {
  if (err) {
    console.error('Session destruction error:', err);
  }
});

// Regenerate session ID
req.session.regenerate(err => {
  if (err) {
    console.error('Session regeneration error:', err);
  }
});
```

## Error Handling

The Redis integration includes comprehensive error handling:

### Connection Errors

```typescript
// Redis connection is automatically managed with reconnection
redisClient.on('error', error => {
  console.error('Redis client error:', error);
  // Application continues to function without Redis
});

redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting...');
  // Automatic reconnection with exponential backoff
});
```

### Graceful Degradation

When Redis is unavailable:

- **Cache middleware** becomes a no-op and requests proceed normally
- **Sessions** fall back to memory store (single instance only)
- **Health checks** report Redis as unhealthy but application continues
- **API endpoints** return appropriate error messages

### Cache Operation Errors

```typescript
try {
  const value = await cache.get('key');
} catch (error) {
  console.error('Cache get error:', error);
  // Continue without cached data
  const value = await fetchFromDatabase();
}
```

## Performance Considerations

### Cache TTL Strategy

- **Short TTL (30-300 seconds)**: Frequently changing data
- **Medium TTL (5-60 minutes)**: Semi-static data
- **Long TTL (1-24 hours)**: Static data or expensive computations

### Key Naming Conventions

Use descriptive, hierarchical key names:

```typescript
// Good key naming
'user:profile:123';
'api:response:users:page:1';
'session:user:456';

// Poor key naming
'u123';
'data';
'temp';
```

### Memory Management

- Monitor Redis memory usage
- Use appropriate TTL values
- Implement cache eviction policies
- Regular cleanup of expired keys

### Connection Pooling

The Redis client automatically manages connections:

- **Connection reuse** for multiple operations
- **Automatic reconnection** with exponential backoff
- **Connection timeout** handling
- **Maximum retry** limits

## Monitoring and Health Checks

### Health Check Endpoints

1. **General Health**: `GET /health`
   - Overall application status
   - Redis connection status
   - System metrics

2. **Redis Status**: `GET /api/v1/redis/status`
   - Redis connection details
   - Connection timestamp

3. **Cache Statistics**: `GET /api/v1/redis/stats`
   - Total cached keys
   - Key patterns
   - Performance metrics

### Logging

Redis operations are logged with appropriate levels:

```typescript
// Connection events
console.log('Redis client connected');
console.log('Redis client ready');
console.log('Redis client reconnecting...');

// Error events
console.error('Redis client error:', error);
console.error('Failed to connect to Redis:', error);

// Cache operations (debug level)
console.debug('Cache hit for key:', key);
console.debug('Cache miss for key:', key);
```

### Metrics to Monitor

- **Connection status**: Up/down status
- **Response times**: Cache operation latency
- **Hit rates**: Cache effectiveness
- **Memory usage**: Redis memory consumption
- **Key counts**: Number of cached items
- **Error rates**: Failed operations

## Best Practices

### Security

1. **Use strong session secrets** in production
2. **Enable Redis AUTH** if required
3. **Use TLS** for Redis connections in production
4. **Implement proper session timeouts**
5. **Sanitize cache keys** to prevent injection

### Performance

1. **Use appropriate TTL values**
2. **Implement cache warming** strategies
3. **Monitor cache hit rates**
4. **Use compression** for large cached values
5. **Implement cache hierarchies**

### Reliability

1. **Handle Redis downtime gracefully**
2. **Implement circuit breakers** for Redis operations
3. **Use Redis clustering** for high availability
4. **Monitor Redis health continuously**
5. **Have fallback strategies** for critical operations

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check Redis server is running
   - Verify connection parameters
   - Check firewall settings

2. **Authentication Failed**
   - Verify Redis password
   - Check Redis AUTH configuration

3. **Slow Performance**
   - Monitor Redis memory usage
   - Check network latency
   - Optimize cache keys and TTL

4. **Session Issues**
   - Verify session secret configuration
   - Check Redis session store connection
   - Monitor session expiration

### Debug Commands

```bash
# Check Redis connection
redis-cli ping

# Monitor Redis operations
redis-cli monitor

# Check Redis info
redis-cli info

# List all keys
redis-cli keys "*"

# Check specific key
redis-cli get "plastic-crack:cache:key"
```

This Redis integration provides a robust foundation for caching and session management in the
Plastic Crack application, with comprehensive error handling, monitoring, and performance
optimization features.
