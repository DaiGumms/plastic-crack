import path from 'path';

import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config/config';
import { isRedisConnected, checkRedisHealth } from './lib/redis';
import { initializeSession } from './lib/session';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestValidator } from './middleware/requestValidator';
import { v1Routes } from './routes/v1';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Trust proxy for correct IP addresses in logs
app.set('trust proxy', 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Session middleware (only if Redis is connected)
try {
  if (isRedisConnected()) {
    app.use(initializeSession());
  }
} catch {
  // Continue without sessions if Redis is not available
}

// Request validation middleware
app.use(requestValidator);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', async (req, res) => {
  const redisHealth = await checkRedisHealth();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: config.nodeEnv,
    uptime: process.uptime(),
    services: {
      redis: redisHealth,
    },
  });
});

// API routes
app.use(`${config.api.baseUrl}/v1`, v1Routes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

export { app };
