# Technical Architecture - Plastic Crack

## 1. System Overview

Plastic Crack follows a modern cross-platform architecture supporting mobile apps, web applications,
and AI-powered services. The system is designed for scalability, real-time features, and intelligent
user experiences.

### 1.1 Architecture Principles

- **Cross-Platform First**: Shared codebase where possible, native performance where needed
- **AI-Driven**: Machine learning integration for recommendations and automation
- **Real-Time**: Live price updates, social interactions, and collaborative features
- **Scalability**: Horizontal scaling capability for all components
- **Security First**: Authentication and authorization at every layer
- **API-First**: RESTful APIs with comprehensive documentation
- **Cloud Native**: Containerized deployment with orchestration support

### 1.2 High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   iOS App       │    │   Android App   │    │   Web App       │
│ (React Native)  │    │ (React Native)  │    │ (React PWA)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   CDN + Load    │
                    │   Balancer      │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │   (Express.js)  │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │  Collection     │    │   AI Service    │
│                 │    │  Service        │    │   (ML/NLP)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │  Price Service  │              │
         │              │  (Web Scrapers) │              │
         │              └─────────────────┘              │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │  Social Service │              │
         │              │  (Real-time)    │              │
         │              └─────────────────┘              │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Data Layer    │
                    │   (PostgreSQL   │
                    │   + Redis +     │
                    │   ElasticSearch)│
                    └─────────────────┘
```

## 2. Mobile Application Architecture

### 2.1 React Native Technology Stack

- **Framework**: React Native 0.72+ with TypeScript
- **Navigation**: React Navigation 6+ with deep linking support
- **State Management**: Redux Toolkit + RTK Query for caching
- **UI Framework**: React Native Elements + Custom Design System
- **Storage**: AsyncStorage + SQLite for offline capabilities
- **Camera**: React Native Camera for barcode scanning and photo capture
- **Push Notifications**: Firebase Cloud Messaging (FCM) + Apple Push Notifications (APN)
- **Maps**: React Native Maps for location-based features
- **Analytics**: Firebase Analytics + Crashlytics

### 2.2 Native Module Integration

- **iOS**: Swift modules for platform-specific features
- **Android**: Kotlin modules for platform-specific features
- **Barcode Scanning**: Native camera integration with ML Kit
- **Background Sync**: Background task handling for data synchronization
- **Biometric Auth**: Touch ID, Face ID, and Android Biometric support

### 2.3 Offline-First Architecture

```
┌─────────────────┐
│   UI Layer      │
│   (Components)  │
└─────────────────┘
         │
┌─────────────────┐
│   State Layer   │
│   (Redux)       │
└─────────────────┘
         │
┌─────────────────┐
│   Data Layer    │
│   (RTK Query)   │
└─────────────────┘
         │
┌─────────────────┐
│   Storage Layer │
│   (SQLite +     │
│    AsyncStorage)│
└─────────────────┘
         │
┌─────────────────┐
│   Sync Service  │
│   (Background)  │
└─────────────────┘
```

## 3. Web Application Architecture

### 3.1 Progressive Web App Stack

- **Framework**: React 18+ with TypeScript
- **PWA Features**: Service Workers, App Manifest, Offline Support
- **State Management**: React Query + Zustand for global state
- **Routing**: React Router v6 with lazy loading
- **Styling**: Tailwind CSS + Headless UI
- **Forms**: React Hook Form + Zod validation
- **Testing**: Jest + React Testing Library + Cypress
- **Build Tool**: Vite for fast development and building

### 3.2 Performance Optimization

- **Code Splitting**: Route-based and component-based splitting
- **Image Optimization**: WebP format with fallbacks, lazy loading
- **Caching Strategy**: Stale-while-revalidate for API responses
- **Bundle Analysis**: Bundle size monitoring and optimization
- **CDN Integration**: Static asset delivery via CDN

## 4. AI and Machine Learning Architecture

### 4.1 AI Services Stack

- **ML Framework**: TensorFlow.js for client-side inference
- **NLP Service**: OpenAI GPT-4 API for natural language processing
- **Computer Vision**: Custom CNN models for model recognition
- **Recommendation Engine**: Collaborative filtering + Content-based algorithms
- **Image Processing**: Sharp.js for server-side image manipulation
- **Model Training**: Python with TensorFlow/PyTorch for custom models

### 4.2 AI Feature Implementation

```
┌─────────────────┐
│   Client Apps   │
│   (Inference)   │
└─────────────────┘
         │
┌─────────────────┐
│   AI Gateway    │
│   (Load Balance)│
└─────────────────┘
         │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vision API    │    │   NLP Service   │    │  Recommendation │
│   (Model ID)    │    │   (Color Rec.)  │    │   Engine        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   ML Data Store │
                    │   (Vector DB)   │
                    └─────────────────┘
```

### 4.3 Recommendation Algorithms

- **Purchase Recommendations**: Analysis of collection gaps, army composition, and user preferences
- **Color Scheme Generation**: Lore-based color suggestions using trained models on official paint
  schemes
- **Price Prediction**: Time series analysis for price trend forecasting
- **Skill Assessment**: Image analysis to evaluate painting quality and suggest improvements

## 5. Price Intelligence Service

### 5.1 Web Scraping Architecture

- **Scraper Framework**: Puppeteer + Playwright for dynamic content
- **Data Pipeline**: Apache Kafka for real-time price updates
- **Rate Limiting**: Respectful crawling with distributed rate limiting
- **Data Validation**: Price anomaly detection and validation
- **Proxy Management**: Rotating proxies for reliable data collection

### 5.2 Price Data Processing

```
┌─────────────────┐
│   Retailer      │
│   Websites      │
└─────────────────┘
         │
┌─────────────────┐
│   Web Scrapers  │
│   (Scheduled)   │
└─────────────────┘
         │
┌─────────────────┐
│   Data Pipeline │
│   (Kafka)       │
└─────────────────┘
         │
┌─────────────────┐
│   Price Engine  │
│   (Validation)  │
└─────────────────┘
         │
┌─────────────────┐
│   Price DB      │
│   (Time Series) │
└─────────────────┘
```

### 5.3 Supported Retailers

- **Games Workshop**: Official store pricing
- **Amazon**: Marketplace and direct sales
- **eBay**: Auction and Buy-It-Now prices
- **Local Game Stores**: API integration where available
- **Discount Retailers**: Specialized gaming retailers

## 6. Social and Real-Time Features

### 6.1 Real-Time Communication

- **WebSocket Server**: Socket.io for real-time features
- **Message Queuing**: Redis Pub/Sub for message distribution
- **Notification System**: Firebase FCM for push notifications
- **Live Updates**: Real-time collection sharing and comments
- **Chat System**: Direct messaging and group discussions

### 6.2 Social Feature Architecture

```
┌─────────────────┐
│   Client Apps   │
│   (WebSocket)   │
└─────────────────┘
         │
┌─────────────────┐
│   Socket.io     │
│   Server        │
└─────────────────┘
         │
┌─────────────────┐
│   Social API    │
│   (REST + WS)   │
└─────────────────┘
         │
┌─────────────────┐    ┌─────────────────┐
│   Activity Feed │    │   Notification  │
│   Service       │    │   Service       │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                    │
         ┌─────────────────┐
         │   Social DB     │
         │   (Graph)       │
         └─────────────────┘
```

```
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements (Button, Input, etc.)
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── collection/      # Collection-specific components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── contexts/            # React contexts
└── assets/              # Static assets
```

### 2.3 State Management Strategy

- **Server State**: React Query for API data caching and synchronization
- **Client State**: React Context for global UI state
- **Form State**: React Hook Form for form management
- **URL State**: React Router for navigation state

### 2.4 Performance Optimizations

- Code splitting with React.lazy()
- Image optimization with next/image equivalent
- Memoization with React.memo and useMemo
- Virtual scrolling for large lists
- Progressive Web App (PWA) capabilities

## 3. Backend Architecture

### 3.1 API Design

- **RESTful API**: Following REST principles with clear resource endpoints
- **Versioning**: API versioning in URL path (/api/v1/)
- **Authentication**: JWT-based authentication with refresh tokens
- **Rate Limiting**: Per-user and per-endpoint rate limiting
- **Documentation**: OpenAPI/Swagger documentation

### 3.2 Service Architecture

```
src/
├── controllers/         # Request handlers
├── services/           # Business logic layer
├── models/             # Data models and ORM
├── middleware/         # Express middleware
├── routes/             # Route definitions
├── utils/              # Utility functions
├── config/             # Configuration files
├── types/              # TypeScript interfaces
└── tests/              # Test files
```

### 3.3 Core Services

#### 3.3.1 Authentication Service

- User registration and login
- JWT token generation and validation
- Password hashing with bcrypt
- OAuth integration (Google, Facebook)
- Session management

#### 3.3.2 User Service

- User profile management
- Privacy settings
- User relationships (following/followers)
- Activity tracking

#### 3.3.3 Collection Service

- Model CRUD operations
- Collection organization
- Search and filtering
- Image upload and processing
- Bulk operations

#### 3.3.4 Social Service

- Comments and likes
- Activity feeds
- Notifications
- Community features

### 3.4 Middleware Stack

- **Authentication**: JWT verification
- **Logging**: Winston logger with structured logging
- **Security**: Helmet.js for security headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Express rate limiter
- **Validation**: Joi schema validation

## 4. Database Design

### 4.1 Primary Database (PostgreSQL)

- **ACID Compliance**: Ensuring data consistency
- **Indexing Strategy**: Optimized indexes for common queries
- **Partitioning**: Table partitioning for large datasets
- **Backup Strategy**: Daily automated backups with point-in-time recovery

### 4.2 Caching Layer (Redis)

- **Session Storage**: User sessions and JWT tokens
- **Query Caching**: Frequently accessed data
- **Rate Limiting**: Request counting for rate limits
- **Real-time Features**: Pub/Sub for notifications

### 4.3 File Storage

- **Cloud Storage**: AWS S3 or compatible service
- **CDN**: CloudFront for global image delivery
- **Image Processing**: Automated resizing and optimization
- **Backup**: Cross-region replication

## 5. Security Architecture

### 5.1 Authentication & Authorization

- **JWT Tokens**: Access tokens (15min) + Refresh tokens (7 days)
- **Role-Based Access Control (RBAC)**: User roles and permissions
- **Multi-Factor Authentication**: Optional 2FA support
- **OAuth 2.0**: Third-party authentication

### 5.2 Data Protection

- **Encryption at Rest**: Database and file storage encryption
- **Encryption in Transit**: TLS 1.3 for all communications
- **PII Protection**: Personal data encryption and anonymization
- **GDPR Compliance**: Data portability and right to deletion

### 5.3 API Security

- **Rate Limiting**: Per-user and per-endpoint limits
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: CSRF tokens for state-changing operations

## 6. Infrastructure Architecture

### 6.1 Containerization

```dockerfile
# Example Dockerfile structure
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 6.2 Orchestration (Docker Compose)

```yaml
# docker-compose.yml structure
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - '3000:3000'

  api:
    build: ./backend
    ports:
      - '8000:8000'
    depends_on:
      - database
      - redis

  database:
    image: postgres:15
    environment:
      POSTGRES_DB: plastic_crack
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
```

### 6.3 Deployment Strategy

- **Blue-Green Deployment**: Zero-downtime deployments
- **Health Checks**: Application and database health monitoring
- **Scaling**: Horizontal pod autoscaling based on metrics
- **Load Balancing**: Nginx with upstream server configuration

## 7. Monitoring and Observability

### 7.1 Application Monitoring

- **Metrics**: Response times, error rates, throughput
- **Logging**: Structured logging with correlation IDs
- **Tracing**: Distributed tracing for request flow
- **Alerts**: Automated alerting for critical issues

### 7.2 Infrastructure Monitoring

- **Server Metrics**: CPU, memory, disk, network
- **Database Monitoring**: Query performance, connection pools
- **Cache Monitoring**: Redis performance and hit rates
- **Uptime Monitoring**: External service monitoring

## 8. Development Workflow

### 8.1 CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint
      - name: Build application
        run: npm run build
```

### 8.2 Code Quality

- **Linting**: ESLint for JavaScript/TypeScript
- **Formatting**: Prettier for code formatting
- **Testing**: Unit tests (95% coverage target)
- **Type Checking**: TypeScript strict mode
- **Code Review**: Required PR reviews

### 8.3 Environment Management

- **Development**: Local development with hot reload
- **Staging**: Production-like environment for testing
- **Production**: Optimized build with monitoring
- **Environment Variables**: Secure configuration management

## 9. Scalability Considerations

### 9.1 Horizontal Scaling

- **Stateless Services**: API servers with no local state
- **Database Scaling**: Read replicas and connection pooling
- **Cache Scaling**: Redis cluster for high availability
- **CDN**: Global content delivery network

### 9.2 Performance Optimization

- **Database Indexing**: Query optimization and proper indexing
- **API Optimization**: Response caching and pagination
- **Frontend Optimization**: Code splitting and lazy loading
- **Image Optimization**: Automated compression and resizing

## 10. Disaster Recovery

### 10.1 Backup Strategy

- **Database Backups**: Daily full backups with WAL archiving
- **File Storage Backups**: Cross-region replication
- **Configuration Backups**: Infrastructure as code
- **Recovery Testing**: Regular disaster recovery drills

### 10.2 High Availability

- **Multi-AZ Deployment**: Services across availability zones
- **Database Clustering**: PostgreSQL streaming replication
- **Load Balancer**: Multiple instance health checking
- **Failover**: Automated failover procedures
