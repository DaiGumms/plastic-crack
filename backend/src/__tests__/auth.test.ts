/* eslint-disable @typescript-eslint/triple-slash-reference */
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/database';
import { AuthService } from '../services/auth.service';

// Disable rate limiting for auth tests to focus on authentication logic
process.env.SKIP_RATE_LIMIT = 'true';

// Test utilities
const createTestUser = async (overrides: Partial<any> = {}) => {
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123!',
    displayName: 'Test User',
    ...overrides,
  };
  
  return AuthService.register(
    userData.username,
    userData.email,
    userData.password,
    userData.displayName
  );
};

describe('Authentication System', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up database after all tests
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        displayName: 'New User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.token).toBeDefined();
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        username: 'newuser2',
        email: 'newuser2@example.com',
        password: 'weak',
        displayName: 'New User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        username: 'newuser3',
        email: 'invalid-email',
        password: 'SecurePassword123!',
        displayName: 'New User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject registration with duplicate email', async () => {
      await createTestUser();

      const duplicateUser = {
        username: 'differentuser',
        email: 'test@example.com', // Same email as test user
        password: 'SecurePassword123!',
        displayName: 'Different User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(duplicateUser);

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('Email already registered');
    });

    it('should reject registration with duplicate username', async () => {
      await createTestUser();

      const duplicateUser = {
        username: 'testuser', // Same username as test user
        email: 'different@example.com',
        password: 'SecurePassword123!',
        displayName: 'Different User',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(duplicateUser);

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('Username already taken');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestUser();

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
    });

    it('should reject login with invalid email', async () => {
      await createTestUser();

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      await createTestUser();

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user data for authenticated user', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.username).toBe('testuser');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token for authenticated user', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.token).not.toBe(token); // Should be a new token (due to jti)
    });

    it('should reject refresh without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully for authenticated user', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout successful');
    });
  });
});

describe('AuthService', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('Password hashing', () => {
    it('should hash passwords correctly', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await AuthService.hashPassword(password);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should verify passwords correctly', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await AuthService.hashPassword(password);

      const isValid = await AuthService.verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await AuthService.verifyPassword('WrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT token management', () => {
    it('should generate valid JWT tokens', () => {
      const payload = {
        userId: 'user123',
        username: 'testuser',
        email: 'test@example.com',
      };

      const token = AuthService.generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should verify JWT tokens correctly', () => {
      const payload = {
        userId: 'user123',
        username: 'testuser',
        email: 'test@example.com',
      };

      const token = AuthService.generateToken(payload);
      const decoded = AuthService.verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.username).toBe(payload.username);
      expect(decoded.email).toBe(payload.email);
    });

    it('should reject invalid JWT tokens', () => {
      expect(() => {
        AuthService.verifyToken('invalid-token');
      }).toThrow();
    });
  });

  describe('Password validation', () => {
    it('should validate strong passwords', () => {
      const result = AuthService.validatePasswordStrength('StrongPassword123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short',
        'nouppercase123!',
        'NOLOWERCASE123!',
        'NoNumbers!',
        'NoSpecialChars123',
      ];

      weakPasswords.forEach(password => {
        const result = AuthService.validatePasswordStrength(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Email verification tokens', () => {
    it('should generate email verification tokens', () => {
      const token = AuthService.generateEmailVerificationToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it('should generate unique tokens', () => {
      const token1 = AuthService.generateEmailVerificationToken();
      const token2 = AuthService.generateEmailVerificationToken();
      expect(token1).not.toBe(token2);
    });
  });
});
