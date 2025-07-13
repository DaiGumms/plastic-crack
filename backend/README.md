# Backend API

This directory contains the Node.js/Express.js backend API for Plastic Crack.

## Features

✅ Express.js server with TypeScript  
✅ Basic middleware (CORS, helmet, morgan)  
✅ Error handling middleware  
✅ Health check endpoint  
✅ API versioning structure (/api/v1/)  
✅ Environment configuration  
✅ Request validation with Joi

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Type check without building

### API Endpoints

#### Health Check

- `GET /health` - Basic health check
- `GET /api/v1/health` - Detailed health information
- `GET /api/v1/health/ping` - Simple ping endpoint

#### API Info

- `GET /api/v1/` - API information and available endpoints

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3001
API_VERSION=v1
API_BASE_URL=/api
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

## Architecture

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM (to be configured)
- **Authentication**: JWT tokens (to be configured)
- **File Storage**: AWS S3 compatible storage (to be configured)
- **Caching**: Redis (to be configured)

## Testing

```bash
npm test
```

Tests are written using Jest and Supertest.

## Docker

### Development

```bash
docker build -f Dockerfile.dev -t plastic-crack-backend:dev .
docker run -p 3001:3001 plastic-crack-backend:dev
```

### Production

```bash
docker build -f Dockerfile.prod -t plastic-crack-backend:prod .
docker run -p 3001:3001 plastic-crack-backend:prod
```

## API Documentation

API documentation will be available at `/api/docs` when running in development mode (to be
implemented).
