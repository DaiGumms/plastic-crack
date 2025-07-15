import { it, expect, describe, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../lib/database';

describe('Collection Search and Filtering - Issue #23', () => {
  let userToken: string;
  let gameSystem1Id: string;
  let gameSystem2Id: string;

  beforeAll(async () => {
    // Clean up database
    await prisma.model.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.user.deleteMany();

    // Create test game systems
    const warhammer40k = await prisma.gameSystem.upsert({
      where: { shortName: 'W40K' },
      update: {},
      create: {
        name: 'Warhammer 40,000',
        shortName: 'W40K',
        description:
          'The grim darkness of the far future where there is only war',
        publisher: 'Games Workshop',
        sortOrder: 1,
      },
    });

    const ageOfSigmar = await prisma.gameSystem.upsert({
      where: { shortName: 'AOS' },
      update: {},
      create: {
        name: 'Age of Sigmar',
        shortName: 'AOS',
        description: 'Fantasy battles in the Mortal Realms',
        publisher: 'Games Workshop',
        sortOrder: 2,
      },
    });

    gameSystem1Id = warhammer40k.id;
    gameSystem2Id = ageOfSigmar.id;

    // Create test user
    const userResponse = await request(app).post('/api/v1/auth/register').send({
      email: 'search-test@example.com',
      password: 'Test123!@#',
      username: 'searchuser',
      displayName: 'Search Test User',
    });

    expect(userResponse.status).toBe(201);
    userToken = userResponse.body.token;

    // Create test collections
    await request(app)
      .post('/api/v1/collections')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Ultramarines Army',
        description: 'Space Marine collection focused on Ultramarines chapter',
        gameSystemId: gameSystem1Id,
        isPublic: true,
        tags: ['space-marines', 'ultramarines'],
      });

    await request(app)
      .post('/api/v1/collections')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Stormcast Eternals',
        description: 'Age of Sigmar golden warriors collection',
        gameSystemId: gameSystem2Id,
        isPublic: true,
        tags: ['stormcast', 'order'],
      });

    await request(app)
      .post('/api/v1/collections')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Chaos Space Marines',
        description: 'Traitor legions and chaos warbands',
        gameSystemId: gameSystem1Id,
        isPublic: false,
        tags: ['chaos', 'space-marines'],
      });
  });

  afterAll(async () => {
    // Clean up in proper order to handle foreign key constraints
    await prisma.model.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.faction.deleteMany();
    await prisma.gameSystem.deleteMany({
      where: { shortName: { in: ['W40K', 'AOS'] } },
    });
    await prisma.user.deleteMany();
  });

  describe('GET /api/v1/collections/my - Search Functionality', () => {
    it('should return collections matching search term in name', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?search=Ultramarines')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Ultramarines Army');
    });

    it('should return collections matching search term in description', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?search=warriors')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Stormcast Eternals');
    });

    it('should return case-insensitive search results', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?search=CHAOS')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Chaos Space Marines');
    });

    it('should return partial match results', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?search=Space')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      const names = response.body.data.map((c: any) => c.name);
      expect(names).toContain('Ultramarines Army');
      expect(names).toContain('Chaos Space Marines');
    });

    it('should return empty array for non-matching search', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?search=Tyranids')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return all collections when search is empty', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?search=')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
    });
  });

  describe('GET /api/v1/collections/my - Game System Filtering', () => {
    it('should filter collections by W40K game system', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?gameSystem=W40K')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      const names = response.body.data.map((c: any) => c.name);
      expect(names).toContain('Ultramarines Army');
      expect(names).toContain('Chaos Space Marines');
    });

    it('should filter collections by AOS game system', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?gameSystem=AOS')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Stormcast Eternals');
    });

    it('should return empty array for non-existent game system', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?gameSystem=INVALID')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return all collections when gameSystem filter is not provided', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
    });
  });

  describe('GET /api/v1/collections/my - Combined Search and Filtering', () => {
    it('should combine search and game system filter', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?search=Space&gameSystem=W40K')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      const names = response.body.data.map((c: any) => c.name);
      expect(names).toContain('Ultramarines Army');
      expect(names).toContain('Chaos Space Marines');
    });

    it('should return empty result when search and filter have no matches', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?search=Stormcast&gameSystem=W40K')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should work with search and filter that have matches', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?search=warriors&gameSystem=AOS')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Stormcast Eternals');
    });
  });

  describe('GET /api/v1/collections/my - Pagination with Search and Filters', () => {
    it('should respect pagination parameters with search', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?search=Space&page=1&limit=1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.total).toBe(2);
      expect(response.body.pagination.totalPages).toBe(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });

    it('should work with page 2 of search results', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?search=Space&page=2&limit=1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(2);
    });
  });

  describe('GET /api/v1/collections - Public Collections Search and Filter', () => {
    it('should search public collections only', async () => {
      const response = await request(app).get(
        '/api/v1/collections?search=Space&isPublic=true'
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Ultramarines Army');
      expect(response.body.data[0].isPublic).toBe(true);
    });

    it('should filter public collections by game system', async () => {
      const response = await request(app).get(
        '/api/v1/collections?gameSystem=W40K&isPublic=true'
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Ultramarines Army');
    });

    it('should not include private collections in public search', async () => {
      const response = await request(app).get(
        '/api/v1/collections?search=Chaos&isPublic=true'
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should require authentication for /my endpoint', async () => {
      const response = await request(app).get(
        '/api/v1/collections/my?search=test'
      );

      expect(response.status).toBe(401);
    });

    it('should handle invalid pagination parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?page=invalid&limit=invalid')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      // Should default to page 1, limit 10
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should handle very long search terms', async () => {
      const longSearch = 'a'.repeat(1000);
      const response = await request(app)
        .get(`/api/v1/collections/my?search=${longSearch}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('Response Format Validation', () => {
    it('should return correct response structure', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?search=Ultra')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');

      if (response.body.data.length > 0) {
        const collection = response.body.data[0];
        expect(collection).toHaveProperty('id');
        expect(collection).toHaveProperty('name');
        expect(collection).toHaveProperty('description');
        expect(collection).toHaveProperty('gameSystem');
        expect(collection).toHaveProperty('user');
        expect(collection).toHaveProperty('_count');
      }
    });

    it('should include game system information in results', async () => {
      const response = await request(app)
        .get('/api/v1/collections/my?gameSystem=W40K')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);

      const collection = response.body.data[0];
      expect(collection.gameSystem).toHaveProperty('shortName', 'W40K');
      expect(collection.gameSystem).toHaveProperty('name');
    });
  });
});
