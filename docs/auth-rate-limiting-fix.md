# Authentication Rate Limiting Fix

## Problem

The production site was experiencing frequent user logouts due to HTTP 429 (Too Many Requests)
errors. Users were getting logged out after short periods of usage.

## Root Causes Identified

1. **Aggressive Rate Limiting**: Auth endpoints (`/auth/me`, `/auth/refresh`) had very restrictive
   rate limits (5 requests per 15 minutes per IP)
2. **No Automatic Token Refresh**: Frontend lacked automatic token refresh interceptors
3. **Frequent Auth Checks**: App was checking authentication status on every component mount
4. **No Token Expiration Handling**: Missing proactive token refresh before expiration
5. **Poor Rate Limit Handling**: No retry logic or exponential backoff for rate-limited requests

## Solutions Implemented

### Backend Changes

1. **Updated Rate Limiters** (`backend/src/middleware/rateLimiter.ts`):
   - Increased `authRateLimit` from 5 to 50 requests per 15 minutes
   - Added `userRateLimit` (100 requests per 15 minutes) for authenticated user endpoints
   - Applied more lenient rate limiting to `/auth/me` and `/auth/refresh` endpoints

2. **Updated Auth Routes** (`backend/src/routes/auth.routes.ts`):
   - Changed `/auth/me` and `/auth/refresh` to use `userRateLimit` instead of `authRateLimit`
   - Maintained strict rate limiting for login attempts to prevent brute force attacks

### Frontend Changes

1. **Enhanced API Service** (`frontend/src/services/apiService.ts`):
   - Added automatic token refresh interceptors
   - Implemented exponential backoff for rate-limited requests (429 errors)
   - Added request queuing during token refresh to prevent multiple refresh attempts
   - Improved error handling and token management

2. **Improved Auth Store** (`frontend/src/store/authStore.ts`):
   - Added token expiration tracking (`tokenExpiresAt`)
   - Implemented smarter auth checking (only check server every 5 minutes instead of every mount)
   - Added `shouldRefreshToken()` helper to proactively refresh tokens
   - Enhanced cleanup methods to handle all auth-related localStorage items

3. **Token Refresh Service** (`frontend/src/services/tokenRefreshService.ts`):
   - Background service that automatically refreshes tokens before expiration
   - Runs every 15 minutes to check if tokens need refreshing
   - Refreshes tokens when they have less than 30 minutes remaining

4. **Layout Integration** (`frontend/src/components/layout/Layout.tsx`):
   - Starts token refresh service on app initialization
   - Ensures proper cleanup when component unmounts

## Key Improvements

### Rate Limiting

- **Before**: 5 requests per 15 minutes for auth endpoints
- **After**: 50 requests for general auth, 100 requests for user endpoints

### Token Management

- **Before**: Reactive token refresh only on 401 errors
- **After**: Proactive token refresh before expiration + automatic retry with exponential backoff

### Auth Checking

- **Before**: Check server on every component mount
- **After**: Cache authentication status for 5 minutes, check token expiration locally

### Error Handling

- **Before**: Immediate logout on any auth error
- **After**: Retry with token refresh, exponential backoff for rate limits, graceful degradation

## Testing Recommendations

1. **Load Testing**: Verify the new rate limits handle normal user activity
2. **Token Expiration**: Test that tokens refresh automatically before expiration
3. **Network Issues**: Test behavior during network interruptions
4. **Multiple Tabs**: Ensure token refresh works correctly across multiple browser tabs
5. **Rate Limiting**: Test that exponential backoff works for 429 errors

## Configuration

### Environment Variables

- `SKIP_RATE_LIMITING=true` - Disables rate limiting (for testing)
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Token expiration time (currently 7 days)

### Frontend Settings

- Token refresh interval: 15 minutes
- Proactive refresh threshold: 30 minutes before expiration
- Auth check cache duration: 5 minutes
- Rate limit retry attempts: 3 with exponential backoff

## Monitoring

Watch for these metrics in production:

- 429 error rates on auth endpoints
- Token refresh success/failure rates
- Average session duration before logout
- Auth check frequency and server load

## Future Enhancements

1. **Sliding Session**: Extend token expiration on user activity
2. **Connection-Based Rate Limiting**: Use user-based instead of IP-based rate limiting
3. **Token Blacklisting**: Implement server-side token revocation
4. **Health Checks**: Monitor auth service performance and automatically adjust rate limits
