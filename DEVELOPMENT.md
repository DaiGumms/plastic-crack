# Plastic Crack Development Setup

This guide will help you set up the development environment for Plastic Crack.

## Prerequisites

- **Node.js** 18.0+ and npm
- **Git** for version control
- **Docker** and Docker Compose (for database and services)
- **PostgreSQL** 15+ (or use Docker)
- **Redis** (or use Docker)

### Mobile Development (Optional)
- **React Native CLI**: `npm install -g @react-native-community/cli`
- **iOS Development**: Xcode 14+ (macOS only)
- **Android Development**: Android Studio with SDK

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/plastic-crack.git
   cd plastic-crack
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development services**
   ```bash
   docker-compose up -d  # Start database and Redis
   npm run dev           # Start all applications
   ```

4. **Access the applications**
   - Backend API: http://localhost:8000
   - Web App: http://localhost:3000
   - API Documentation: http://localhost:8000/api/docs

## Environment Variables

Create `.env` files in each application directory:

### Backend (.env)
```bash
NODE_ENV=development
PORT=8000
DATABASE_URL="postgresql://postgres:password@localhost:5432/plastic_crack"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_BUCKET_NAME="plastic-crack-dev"
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME="Plastic Crack"
```

### Mobile (.env)
```bash
API_URL=http://localhost:8000/api/v1
APP_NAME="Plastic Crack"
```

## Development Workflow

### Git Workflow
1. Create feature branch: `git checkout -b feature/issue-number-description`
2. Make changes and commit: `git commit -m "feat: description"`
3. Push branch: `git push origin feature/issue-number-description`
4. Create Pull Request on GitHub
5. After review and approval, merge to main

### Commit Message Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Code Quality
- Run linting: `npm run lint`
- Run tests: `npm run test`
- Format code: `npm run format`

## Database Setup

### Using Docker (Recommended)
```bash
docker-compose up -d postgres redis
```

### Manual Setup
1. Install PostgreSQL 15+
2. Create database: `createdb plastic_crack`
3. Update DATABASE_URL in .env
4. Run migrations: `cd backend && npm run migrate`

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change ports in environment variables
   - Kill processes: `lsof -i :3000` and `kill -9 <PID>`

2. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL format
   - Verify database exists

3. **npm install errors**
   - Clear cache: `npm cache clean --force`
   - Delete node_modules: `rm -rf node_modules && npm install`

4. **React Native issues**
   - Reset Metro cache: `npx react-native start --reset-cache`
   - Clean build: `cd ios && xcodebuild clean` or `cd android && ./gradlew clean`

### Getting Help

- Check existing GitHub issues
- Create new issue with detailed description
- Join our development Discord (link coming soon)

## Contributing

1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests for new features
5. Update documentation
6. Submit pull request

## Project Structure

```
plastic-crack/
├── backend/           # Express.js API
├── frontend/          # React web app
├── mobile/            # React Native app
├── shared/            # Shared code and types
├── docs/              # Documentation
├── .github/           # GitHub workflows and templates
├── docker-compose.yml # Development services
├── package.json       # Root package.json with scripts
└── README.md          # This file
```

## Next Steps

1. Set up your development environment
2. Choose your first issue from the GitHub Issues
3. Read the technical architecture documentation
4. Start with infrastructure setup issues (#1-7)
5. Join our development community

Happy coding! 🚀
