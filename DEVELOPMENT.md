# Plastic Crack Development Guide

This comprehensive guide will help you set up and contribute to the Plastic Crack development environment.

## Quick Start 🚀

### One-Command Setup

To set up your entire development environment with a single command:

```bash
npm run setup
```

This command will:

1. **🐳 Start Docker Services**: Automatically starts PostgreSQL and Redis containers
2. **📦 Install Dependencies**: Installs all dependencies for root, backend, frontend, and shared packages
3. **🗄️ Setup Database**: 
   - Waits for database to be ready
   - Generates Prisma client
   - Runs database migrations
   - Seeds the database with sample data
4. **🚀 Start Development Servers**: Runs both backend and frontend in development mode

### What You'll Get

After running the setup command:

- **Backend API**: Available at `http://localhost:3001`
- **Frontend App**: Available at `http://localhost:3000`
- **Database**: PostgreSQL running on `localhost:5432`
- **Redis Cache**: Available on `localhost:6379`
- **Prisma Studio**: Access with `npm run db:studio` (from backend directory)

## Prerequisites

Make sure you have installed:

- **Node.js** (>= 20.0.0) and npm (>= 10.0.0)
- **Git** for version control
- **Docker** and Docker Compose (for database and services)

### Mobile Development (Optional)

- **React Native CLI**: `npm install -g @react-native-community/cli`
- **iOS Development**: Xcode 14+ (macOS only)
- **Android Development**: Android Studio with SDK

## Manual Setup (Alternative)

If you prefer to run steps individually:

### 1. Clone the repository

```bash
git clone https://github.com/DaiGumms/plastic-crack.git
cd plastic-crack
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Start Docker services

```bash
npm run docker:up
```

### 4. Setup database

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start development servers

```bash
npm run dev
```

## Project Structure

```
plastic-crack/
├── backend/           # Express.js API server
├── frontend/          # React web application
├── mobile/            # React Native mobile app
├── shared/            # Shared code and types
├── scripts/           # Development and build scripts
├── docs/              # Documentation
├── .github/           # GitHub workflows and templates
├── docker-compose.yml # Development services
├── package.json       # Root package.json with scripts
└── README.md          # Project overview
```

## Available Scripts

### Root Level Scripts

```bash
# Development
npm run setup          # Complete development environment setup
npm run dev           # Start backend and frontend servers

# Building
npm run build         # Build all packages
npm run build:backend # Build backend only
npm run build:frontend # Build frontend only
npm run build:shared  # Build shared package only

# Testing
npm run test          # Run all tests
npm run test:backend  # Run backend tests
npm run test:frontend # Run frontend tests
npm run test:e2e     # Run end-to-end tests

# Code Quality
npm run lint          # Lint all packages
npm run lint:fix      # Fix linting issues
npm run format        # Format all code
npm run format:check  # Check code formatting
npm run type-check    # TypeScript type checking

# Database
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run database migrations
npm run db:seed       # Seed database with sample data
npm run db:reset      # Reset database
npm run db:studio     # Open Prisma Studio

# Docker
npm run docker:up     # Start Docker services
npm run docker:down   # Stop Docker services
npm run docker:logs   # View Docker logs
npm run docker:clean  # Clean Docker volumes

# Utilities
npm run clean         # Clean all build artifacts
npm run install:all   # Install all dependencies
npm run ci            # Run CI pipeline locally
```

## Development Workflow

### Git Workflow

1. Create feature branch: `git checkout -b feature/issue-number-description`
2. Make changes and commit: `git commit -m "feat: description"`
3. Push branch: `git push origin feature/issue-number-description`
4. Create Pull Request on GitHub
5. After review and approval, merge to main

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks
- `ci:` CI/CD changes

### Code Quality Standards

- **ESLint**: Enforced linting rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking
- **Tests**: Required for new features
- **Documentation**: Update docs for new features

## Environment Configuration

### Backend Environment Variables

Create `backend/.env`:

```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:password@localhost:5432/plastic_crack"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_BUCKET_NAME="plastic-crack-dev"
```

### Frontend Environment Variables

Create `frontend/.env`:

```bash
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_NAME="Plastic Crack"
```

### Mobile Environment Variables

Create `mobile/.env`:

```bash
API_URL=http://localhost:3001/api/v1
APP_NAME="Plastic Crack"
```

## Database Management

### Using Docker (Recommended)

```bash
npm run docker:up     # Start PostgreSQL and Redis
```

### Manual Setup

1. Install PostgreSQL 15+
2. Create database: `createdb plastic_crack`
3. Update DATABASE_URL in .env
4. Run migrations: `npm run db:migrate`

### Common Database Commands

```bash
npm run db:migrate    # Run pending migrations
npm run db:seed       # Populate with sample data
npm run db:reset      # Reset database (destructive)
npm run db:studio     # Open Prisma Studio GUI
```

## Testing

### Unit Tests

```bash
npm run test          # Run all unit tests
npm run test:backend  # Backend tests only
npm run test:frontend # Frontend tests only
npm run test:watch    # Watch mode for tests
```

### End-to-End Tests

```bash
npm run test:e2e      # Run Playwright E2E tests
npm run test:e2e:ui   # Run E2E tests with UI
```

### Test Coverage

```bash
npm run test:coverage # Generate coverage reports
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Backend (3001) or Frontend (3000) ports in use
   - Kill processes: `lsof -i :3000` and `kill -9 <PID>` (macOS/Linux)
   - Use Task Manager on Windows

2. **Docker not running**
   - Make sure Docker Desktop is running
   - Check with: `docker ps`

3. **Database connection errors**
   - Ensure PostgreSQL is running: `npm run docker:up`
   - Check DATABASE_URL format
   - Verify database exists

4. **npm install errors**
   - Clear cache: `npm cache clean --force`
   - Delete node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version (>= 20.0.0)

5. **Prisma issues**
   - Regenerate client: `npm run db:generate`
   - Reset database: `npm run db:reset`

6. **React Native issues** (if developing mobile)
   - Reset Metro cache: `npx react-native start --reset-cache`
   - Clean build: `cd ios && xcodebuild clean` or `cd android && ./gradlew clean`

### Getting Help

- Check existing [GitHub Issues](https://github.com/DaiGumms/plastic-crack/issues)
- Create new issue with detailed description
- Join our development Discord (link coming soon)

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=plastic-crack:* npm run dev:backend

# Frontend
VITE_DEBUG=true npm run dev:frontend
```

## Contributing

### Before Contributing

1. Fork the repository
2. Set up development environment
3. Read the technical architecture documentation
4. Choose an issue from GitHub Issues
5. Follow the Git workflow

### Coding Standards

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure CI passes

### Pull Request Process

1. Create feature branch from `main`
2. Make your changes
3. Add/update tests
4. Update documentation
5. Run `npm run ci` locally
6. Submit pull request
7. Address review feedback
8. Merge after approval

## Continuous Integration

The project uses GitHub Actions for CI/CD:

- **Code Quality**: Linting, formatting, type checking
- **Tests**: Unit, integration, and E2E tests
- **Build**: All packages built and artifacts uploaded
- **Security**: Dependency scanning and security checks
- **Deploy**: Automatic deployment on main branch

### Running CI Locally

```bash
npm run ci  # Run the same checks as CI
```

## Deployment

### Production Build

```bash
npm run build  # Creates production builds
```

### Docker Deployment

Production Docker images are automatically built and pushed to GitHub Container Registry on main branch pushes.

## Next Steps

1. Set up your development environment with `npm run setup`
2. Explore the codebase and documentation
3. Choose your first issue from GitHub Issues
4. Start with infrastructure or bug fix issues
5. Join our development community

## Useful Links

- [GitHub Repository](https://github.com/DaiGumms/plastic-crack)
- [Issue Tracker](https://github.com/DaiGumms/plastic-crack/issues)
- [API Documentation](http://localhost:3001/api/docs) (when running locally)
- [Technical Architecture](./docs/technical-architecture.md)
- [Database Design](./docs/database-design.md)

Happy coding! 🚀
