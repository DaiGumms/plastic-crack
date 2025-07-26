import path from 'path';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config/config';
import { isRedisConnected, checkRedisHealth } from './lib/redis';
import { initializeSession } from './lib/session';
import {
  createCSRFMiddleware,
  getCSRFToken,
} from './middleware/csrf.middleware';
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
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
    ],
  })
);

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CSRF protection middleware (for web requests)
app.use(createCSRFMiddleware());

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

// Simple health check endpoint (no dependencies)
app.get('/ping', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
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
  } catch (error) {
    // Return healthy status even if Redis fails - app can work without Redis
    // eslint-disable-next-line no-console
    console.warn(
      'Health check Redis error:',
      error instanceof Error ? error.message : String(error)
    );
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      environment: config.nodeEnv,
      uptime: process.uptime(),
      services: {
        redis: {
          status: 'unhealthy',
          message: 'Redis unavailable - app running without cache',
        },
      },
    });
  }
});

// CSRF token endpoint
app.get('/csrf-token', getCSRFToken);

// API routes
app.use(`${config.api.baseUrl}/v1`, v1Routes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

export { app };
