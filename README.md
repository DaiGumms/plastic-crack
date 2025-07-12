# Plastic Crack - Warhammer Collection Management Platform

Plastic Crack is a comprehensive cross-platform application designed for Warhammer enthusiasts to
catalog, manage, and showcase their miniature collections. Available as both a mobile app
(iOS/Android) and web application, the platform provides tools for inventory management, collection
tracking, AI-powered recommendations, price comparison, and rich social community features.

## Project Overview

Plastic Crack enables users to:

- Create detailed inventories of their Warhammer miniatures across all platforms
- Track painting progress and completion status with photo documentation
- Organize collections by armies, factions, and game systems
- Get AI-powered painting scheme recommendations based on model descriptions and lore
- Receive intelligent purchase recommendations based on current collection and playstyle
- Compare prices and find the best deals on models from multiple retailers
- Share collections, battle reports, and painting achievements with the community
- Get help and advice from experienced players and painters
- Browse and discover other users' collections and achievements
- Manage wishlists with real-time price tracking and availability alerts

## Architecture Components

- **Mobile Apps**: Native iOS and Android applications built with React Native
- **Web Application**: Progressive Web App (PWA) accessible on all modern browsers
- **Backend API**: RESTful API for data management and business logic
- **AI Services**: Machine learning models for recommendations and image recognition
- **Price Intelligence**: Real-time price comparison and deal tracking system
- **Database**: Persistent storage for user data, collections, and community content
- **Admin Panel**: Administrative interface for platform management
- **Social Engine**: Community features, sharing, and user interaction systems
- **Middleware**: Authentication, logging, request processing, and rate limiting

## Documentation Structure

- `docs/functional-requirements.md` - Detailed functional specifications
- `docs/technical-architecture.md` - System architecture and design
- `docs/api-specification.md` - API endpoints and data contracts
- `docs/database-design.md` - Database schema and relationships
- `docs/deployment-guide.md` - Deployment and infrastructure setup

## Technology Stack

### Mobile Applications

- React Native for cross-platform mobile development
- Expo for development workflow and app distribution
- React Navigation for mobile navigation
- AsyncStorage for local data persistence
- React Native Camera for barcode scanning and photo capture

### Web Application

- React 18+ with TypeScript
- Progressive Web App (PWA) capabilities
- Tailwind CSS for styling
- React Router for navigation
- React Query for state management
- Axios for API communication

### AI & Machine Learning

- TensorFlow.js for client-side model inference
- OpenAI GPT API for natural language processing
- Custom recommendation engine for purchase suggestions
- Computer vision for model recognition and categorization

### Backend Services

- Node.js with Express.js
- TypeScript
- JWT for authentication
- Helmet for security
- CORS for cross-origin requests
- WebSocket support for real-time features

### Price Intelligence

- Web scraping services for retailer price monitoring
- Price history tracking and trend analysis
- Deal aggregation and alert systems
- Affiliate link management

### Database & Storage

- PostgreSQL for primary data storage
- Redis for caching and sessions
- Amazon S3 for image and file storage
- ElasticSearch for search functionality

### Infrastructure

- Docker for containerization
- Nginx as reverse proxy
- GitHub Actions for CI/CD

## Getting Started

Refer to the documentation in the `docs/` directory for detailed setup and development instructions.
