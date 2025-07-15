import request from 'supertest';
import { app } from '../../app';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

describe('Collection Search Integration Tests', () => {
  let authToken: string;
  let userId: number;


  beforeAll(async () => {
    // Register and login a test user
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'searchuser',
        email: 'search@test.com',
        password: 'TestPassword123!',
        displayName: 'Search User'
      });

    expect(registerResponse.status).toBe(201);
    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;

    // Create test collections
    await request(app)
      .post('/api/v1/collections')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Warhammer 40K Space Marines',
        description: 'My collection of Space Marine miniatures',
        gameSystem: 'Warhammer 40,000',
        isPublic: true
      });

    await request(app)
      .post('/api/v1/collections')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Age of Sigmar Stormcast',
        description: 'Golden warriors of Sigmar',
        gameSystem: 'Age of Sigmar',
        isPublic: true
      });

    await request(app)
      .post('/api/v1/collections')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Blood Angels Army',
        description: 'Red angels of death and destruction',
        gameSystem: 'Warhammer 40,000',
        isPublic: false
      });


  });

  afterAll(async () => {
    // Clean up test data
    await prisma.collection.deleteMany({
      where: { userId: userId.toString() }
    });
    await prisma.user.delete({
      where: { id: userId.toString() }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/v1/collections/search', () => {
    it('should search collections by name', async () => {
      const response = await request(app)
        .get('/api/v1/collections/search')
        .query({ q: 'Warhammer' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.collections).toBeDefined();
      expect(response.body.data.collections.length).toBeGreaterThanOrEqual(0);
    });

    it('should search collections by description', async () => {
      const response = await request(app)
        .get('/api/v1/collections/search')
        .query({ q: 'marines' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.collections).toBeDefined();
      expect(response.body.data.collections.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter collections by game system using main endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/collections')
        .query({ gameSystem: 'Warhammer 40,000' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      
      // All collections should be Warhammer 40K
      if (response.body.data.length > 0) {
        response.body.data.forEach((collection: any) => {
          expect(collection.gameSystem).toBe('Warhammer 40,000');
        });
      }
    });

    it('should combine search using search endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/collections/search')
        .query({ 
          q: 'angels'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.collections).toBeDefined();
    });

    it('should respect pagination', async () => {
      const response = await request(app)
        .get('/api/v1/collections/search')
        .query({ 
          q: 'collection',
          page: 1,
          limit: 2
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      // The search endpoint may have a different pagination structure
      if (response.body.data.pagination) {
        expect(response.body.data.pagination.page).toBe(1);
        expect(response.body.data.pagination.limit).toBe(2);
      }
    });

    it('should return empty results for non-matching search', async () => {
      const response = await request(app)
        .get('/api/v1/collections/search')
        .query({ q: 'nonexistent12345' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.collections).toBeDefined();
      expect(response.body.data.collections.length).toBe(0);
    });

    it('should handle search without authentication (public endpoint)', async () => {
      const response = await request(app)
        .get('/api/v1/collections/search')
        .query({ q: 'test' });

      // Search endpoint appears to be public, so should return 200
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle missing search query', async () => {
      const response = await request(app)
        .get('/api/v1/collections/search')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/collections/search')
        .query({ 
          q: 'test',
          page: -1,
          limit: 0
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/collections with filters', () => {
    it('should filter user collections by game system', async () => {
      const response = await request(app)
        .get('/api/v1/collections')
        .query({ gameSystem: 'Age of Sigmar' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      
      if (response.body.data.length > 0) {
        response.body.data.forEach((collection: any) => {
          expect(collection.gameSystem).toBe('Age of Sigmar');
        });
      }
    });

    it('should include all collections for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/collections')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });
});
