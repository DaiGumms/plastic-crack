import { Router, Request, Response } from 'express';

const router = Router();

// Detailed health check endpoint
router.get('/', (req: Request, res: Response) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'plastic-crack-backend',
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    // Add more health checks as needed
    dependencies: {
      database: 'not-configured', // Will be updated when database is connected
      cache: 'not-configured',    // Will be updated when Redis is connected
    },
  };

  res.json({
    success: true,
    data: healthData,
  });
});

// Simple health check for load balancers
router.get('/ping', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
  });
});

export { router as healthRoutes };
