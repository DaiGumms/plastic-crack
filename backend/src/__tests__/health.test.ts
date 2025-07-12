import request from 'supertest';
import { app } from '../app';

describe('Health Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        version: expect.any(String),
        environment: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return detailed health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: 'ok',
          timestamp: expect.any(String),
          service: 'plastic-crack-backend',
          version: expect.any(String),
          environment: expect.any(String),
          uptime: expect.any(Number),
          memory: expect.any(Object),
          dependencies: expect.any(Object),
        },
      });
    });
  });

  describe('GET /api/v1/health/ping', () => {
    it('should return pong', async () => {
      const response = await request(app)
        .get('/api/v1/health/ping')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'pong',
        timestamp: expect.any(String),
      });
    });
  });
});
