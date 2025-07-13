import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/database';

// Ensure rate limiting is enabled for these tests
process.env.SKIP_RATE_LIMIT = 'false';

describe('Rate Limiting', () => {
  beforeEach(async () => {
    // Clean up only rate limiting test data
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: 'ratelimit' } },
          { email: { contains: 'rate-limit-test' } }
        ]
      }
    });
  });

  afterAll(async () => {
    // Clean up only rate limiting test data
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: 'ratelimit' } },
          { email: { contains: 'rate-limit-test' } }
        ]
      }
    });
  });

  describe('Auth endpoints rate limiting', () => {
    it('should enforce rate limiting on registration endpoint', async () => {
      const userData = {
        username: 'ratelimituser',
        email: 'rate-limit-test@plastic-crack-test.com',
        password: 'SecurePassword123!',
        displayName: 'Rate Limit User',
      };

      // Make multiple registration attempts rapidly
      const promises = Array(6).fill(0).map((_, i) => 
        request(app)
          .post('/api/v1/auth/register')
          .send({
            ...userData,
            username: userData.username + i,
            email: userData.email.replace('@', i + '@'),
          })
      );

      const responses = await Promise.all(promises);
      
      // Check if any response was rate limited (should be the 6th one)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      
      const rateLimitedResponse = rateLimitedResponses[0];
      expect(rateLimitedResponse.body.error).toContain('Too many authentication attempts');
    });

    it('should enforce stricter rate limiting on login endpoint', async () => {
      // First create a user to attempt login with
      const testUser = {
        username: 'logintest',
        email: 'login-rate-limit-test@plastic-crack-test.com',
        password: 'TestPassword123!',
        displayName: 'Login Test User',
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      // Make multiple failed login attempts
      const promises = Array(4).fill(0).map(() => 
        request(app)
          .post('/api/v1/auth/login')
          .send({
            email: testUser.email,
            password: 'WrongPassword123!',
          })
      );

      const responses = await Promise.all(promises);
      
      // The 4th attempt should be rate limited (limit is 3 for login)
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      
      const rateLimitedResponse = rateLimitedResponses[0];
      expect(rateLimitedResponse.body.error).toContain('Too many login attempts');
    });
  });
});
