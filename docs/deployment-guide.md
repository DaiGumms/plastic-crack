# Deployment Guide - Plastic Crack

## 1. Overview

This guide covers the deployment and infrastructure setup for the Plastic Crack cross-platform application using Google Cloud Platform and Firebase, including mobile apps (iOS/Android), web application, AI services, price intelligence, and real-time social features.

### 1.1 Google Cloud Firebase Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   App Store     │    │  Google Play    │    │  Firebase       │
│   (iOS App)     │    │  (Android App)  │    │  Hosting (PWA)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Firebase Auth  │
                    │  + Cloud CDN    │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Cloud Run      │    │  Cloud Run      │    │  Cloud Run      │
│  (Main API)     │    │  (AI Services)  │    │ (Price Intel)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Cloud SQL      │    │  Firebase       │    │  Cloud         │
│  (PostgreSQL)   │    │  Realtime DB    │    │  Firestore     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Memorystore    │    │  Cloud Storage  │    │  BigQuery       │
│  (Redis)        │    │  (Files/Images) │    │  (Analytics)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 Environment Requirements
- **Development**: Firebase Emulator Suite with local development
- **Staging**: Firebase projects with Cloud Run staging instances
- **Production**: Multi-region Firebase deployment with global CDN
- **Mobile**: Firebase App Distribution for testing, App Store/Play Store for production

## 2. Prerequisites

### 2.1 Google Cloud Setup
- **Google Cloud Project**: Create a new GCP project with billing enabled
- **Firebase Project**: Initialize Firebase for the same GCP project
- **Service Account**: Create service account with appropriate permissions
- **gcloud CLI**: Install and configure Google Cloud CLI
- **Firebase CLI**: Install Firebase CLI for deployment

### 2.2 Required Google Cloud Services
- **Firebase Hosting**: For web application (PWA) hosting
- **Firebase Authentication**: User management and OAuth
- **Cloud Run**: Serverless containers for API services
- **Cloud SQL**: Managed PostgreSQL database
- **Cloud Firestore**: NoSQL database for real-time features
- **Firebase Realtime Database**: Real-time synchronization
- **Memorystore (Redis)**: Caching and session management
- **Cloud Storage**: File and image storage
- **Cloud Build**: CI/CD pipeline
- **Cloud Functions**: Serverless functions for triggers
- **Vertex AI**: Machine learning and AI services
- **BigQuery**: Analytics and data warehousing

### 2.3 Mobile Development Tools
- **iOS**: Xcode 14+, iOS Simulator, Apple Developer account
- **Android**: Android Studio, Android SDK 33+, Google Play Console
- **React Native**: React Native CLI, Expo CLI
- **Firebase SDKs**: iOS and Android Firebase SDKs

### 2.4 Development Tools
- **Node.js 18+**: For local development and Cloud Functions
- **Python 3.9+**: For AI services and data processing
- **Firebase CLI**: Project management and deployment
- **gcloud CLI**: Google Cloud resource management
- **Docker**: For local development and Cloud Run containers

## 3. Firebase Project Setup

### 3.1 Initialize Firebase Project
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select features:
# - Hosting (for web app)
# - Functions (for serverless functions)
# - Firestore (for real-time database)
# - Authentication (for user management)
# - Storage (for file uploads)
# - Emulators (for local development)
```

### 3.2 Firebase Configuration Files

#### firebase.json
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "plastic-crack-api",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/service-worker.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=86400"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "auth": {
      "port": 9099
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true
    }
  }
}
```

#### .firebaserc
```json
{
  "projects": {
    "default": "plastic-crack-prod",
    "staging": "plastic-crack-staging",
    "development": "plastic-crack-dev"
  },
  "targets": {
    "plastic-crack-prod": {
      "hosting": {
        "web": ["plastic-crack-web"],
        "admin": ["plastic-crack-admin"]
      }
    }
  }
}
```

### 3.3 Environment Configuration

#### Development (.env.development)
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=plastic-crack-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=plastic-crack-dev
VITE_FIREBASE_STORAGE_BUCKET=plastic-crack-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_dev_app_id

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=plastic-crack-dev
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json

# API Configuration
API_BASE_URL=http://localhost:5001/plastic-crack-dev/us-central1/api
CLOUD_RUN_SERVICE_URL=https://plastic-crack-api-dev-abc123-uc.a.run.app

# Database
CLOUD_SQL_CONNECTION_NAME=plastic-crack-dev:us-central1:main-db
DB_HOST=/cloudsql/plastic-crack-dev:us-central1:main-db
DB_NAME=plastic_crack_dev
DB_USER=plastic_crack_user
DB_PASSWORD=${DB_PASSWORD_SECRET}

# Firebase Features
FIREBASE_EMULATOR_HUB=localhost:4400
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

#### Production (.env.production)
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=${FIREBASE_API_KEY}
VITE_FIREBASE_AUTH_DOMAIN=plastic-crack-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=plastic-crack-prod
VITE_FIREBASE_STORAGE_BUCKET=plastic-crack-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
VITE_FIREBASE_APP_ID=${FIREBASE_APP_ID}

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=plastic-crack-prod
GOOGLE_APPLICATION_CREDENTIALS=${SERVICE_ACCOUNT_KEY}

# API Configuration
API_BASE_URL=https://api.plasticcrack.com
CLOUD_RUN_SERVICE_URL=https://plastic-crack-api-xyz789-uc.a.run.app

# Database
CLOUD_SQL_CONNECTION_NAME=plastic-crack-prod:us-central1:main-db
DB_HOST=/cloudsql/plastic-crack-prod:us-central1:main-db
DB_NAME=plastic_crack_prod
DB_USER=plastic_crack_user
DB_PASSWORD=${DB_PASSWORD_SECRET}

# AI Services
VERTEX_AI_PROJECT=${GOOGLE_CLOUD_PROJECT}
VERTEX_AI_LOCATION=us-central1
OPENAI_API_KEY=${OPENAI_API_KEY}

# External APIs
GOOGLE_OAUTH_CLIENT_ID=${GOOGLE_OAUTH_CLIENT_ID}
GOOGLE_OAUTH_CLIENT_SECRET=${GOOGLE_OAUTH_CLIENT_SECRET}
FACEBOOK_APP_ID=${FACEBOOK_APP_ID}
FACEBOOK_APP_SECRET=${FACEBOOK_APP_SECRET}
```

## 4. Cloud Run Configuration

### 4.1 Main API Service Dockerfile
```dockerfile
# /backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime

# Install Cloud SQL Proxy
RUN apk add --no-cache curl
RUN curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
RUN chmod +x cloud_sql_proxy

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

USER nextjs

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["npm", "start"]
```

### 4.2 AI Services Dockerfile
```dockerfile
# /ai-services/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Google Cloud libraries
RUN pip install google-cloud-aiplatform google-cloud-storage

# Copy source code
COPY . .

EXPOSE 8080

ENV PORT=8080
ENV PYTHONPATH=/app

CMD ["python", "main.py"]
```

### 4.3 Cloud Run Service Configuration

#### cloudbuild.yaml
```yaml
steps:
  # Build main API
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/plastic-crack-api:$COMMIT_SHA', './backend']
  
  # Build AI services
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/plastic-crack-ai:$COMMIT_SHA', './ai-services']
  
  # Build price intelligence service
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/plastic-crack-price:$COMMIT_SHA', './price-service']

  # Push images
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/plastic-crack-api:$COMMIT_SHA']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/plastic-crack-ai:$COMMIT_SHA']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/plastic-crack-price:$COMMIT_SHA']

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'plastic-crack-api'
      - '--image'
      - 'gcr.io/$PROJECT_ID/plastic-crack-api:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--set-env-vars'
      - 'GOOGLE_CLOUD_PROJECT=$PROJECT_ID'

images:
  - 'gcr.io/$PROJECT_ID/plastic-crack-api:$COMMIT_SHA'
  - 'gcr.io/$PROJECT_ID/plastic-crack-ai:$COMMIT_SHA'
  - 'gcr.io/$PROJECT_ID/plastic-crack-price:$COMMIT_SHA'
```

### 4.4 Cloud Run Deployment Scripts

#### deploy-services.sh
```bash
#!/bin/bash

PROJECT_ID="plastic-crack-prod"
REGION="us-central1"

# Deploy main API service
gcloud run deploy plastic-crack-api \
  --image gcr.io/$PROJECT_ID/plastic-crack-api:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID \
  --set-cloudsql-instances $PROJECT_ID:$REGION:main-db \
  --memory 2Gi \
  --cpu 2 \
  --concurrency 100 \
  --min-instances 1 \
  --max-instances 10

# Deploy AI services
gcloud run deploy plastic-crack-ai \
  --image gcr.io/$PROJECT_ID/plastic-crack-ai:latest \
  --platform managed \
  --region $REGION \
  --no-allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID \
  --memory 4Gi \
  --cpu 2 \
  --concurrency 10 \
  --min-instances 0 \
  --max-instances 5 \
  --timeout 300

# Deploy price intelligence service
gcloud run deploy plastic-crack-price \
  --image gcr.io/$PROJECT_ID/plastic-crack-price:latest \
  --platform managed \
  --region $REGION \
  --no-allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID \
  --memory 1Gi \
  --cpu 1 \
  --concurrency 50 \
  --min-instances 0 \
  --max-instances 3
```

## 5. Nginx Configuration

### 5.1 Development Configuration
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream api {
        server api:8000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 5.2 Production Configuration
```nginx
# nginx/nginx.prod.conf
events {
    worker_connections 2048;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    upstream frontend {
        server frontend:80;
    }

    upstream api {
        server api:8000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name plasticcrack.com www.plasticcrack.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name plasticcrack.com www.plasticcrack.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/plasticcrack.com.crt;
        ssl_certificate_key /etc/nginx/ssl/plasticcrack.com.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-Frame-Options DENY always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # API routes
        location /api {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Auth endpoints with stricter rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
    }
}
```

## 6. Firebase Functions

### 6.1 Cloud Functions Configuration

#### functions/package.json
```json
{
  "name": "plastic-crack-functions",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.3.1",
    "@google-cloud/sql": "^2.0.0",
    "@google-cloud/storage": "^6.10.1",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "typescript": "^4.9.0",
    "@typescript-eslint/eslint-plugin": "^5.12.0",
    "@typescript-eslint/parser": "^5.12.0",
    "eslint": "^8.9.0",
    "eslint-plugin-import": "^2.25.4"
  }
}
```

#### functions/src/index.ts
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';

admin.initializeApp();

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Price alert trigger
export const priceAlertTrigger = functions.firestore
  .document('price_alerts/{alertId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (!before.triggered && after.triggered) {
      // Send notification
      const userId = after.user_id;
      const tokens = await getUserFCMTokens(userId);
      
      if (tokens.length > 0) {
        const message = {
          notification: {
            title: 'Price Alert!',
            body: `${after.model_name} is now ${after.current_price}!`
          },
          tokens: tokens
        };
        
        await admin.messaging().sendMulticast(message);
      }
    }
  });

// Real-time messaging
export const sendMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { conversationId, message } = data;
  const userId = context.auth.uid;
  
  // Add message to Firestore
  const messageRef = await admin.firestore()
    .collection('messages')
    .add({
      conversation_id: conversationId,
      user_id: userId,
      content: message,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
  
  // Notify conversation participants
  const conversation = await admin.firestore()
    .collection('conversations')
    .doc(conversationId)
    .get();
    
  if (conversation.exists) {
    const participants = conversation.data()?.participants || [];
    const otherParticipants = participants.filter((p: string) => p !== userId);
    
    for (const participantId of otherParticipants) {
      const tokens = await getUserFCMTokens(participantId);
      if (tokens.length > 0) {
        await admin.messaging().sendMulticast({
          notification: {
            title: 'New Message',
            body: message
          },
          tokens: tokens
        });
      }
    }
  }
  
  return { messageId: messageRef.id };
});

async function getUserFCMTokens(userId: string): Promise<string[]> {
  const devicesSnapshot = await admin.firestore()
    .collection('user_devices')
    .where('user_id', '==', userId)
    .where('push_enabled', '==', true)
    .get();
    
  return devicesSnapshot.docs
    .map(doc => doc.data().push_token)
    .filter(token => token);
}

// Export the Express app as a Cloud Function
export const api = functions.https.onRequest(app);
```

### 6.2 AI Integration Functions

#### functions/src/ai-functions.ts
```typescript
import * as functions from 'firebase-functions';
import { aiplatform } from '@google-cloud/aiplatform';

const { PredictionServiceClient } = aiplatform.v1;

export const generateColorScheme = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { modelDescription, faction, gameSystem } = data;
  
  try {
    // Call Vertex AI model for color scheme generation
    const client = new PredictionServiceClient();
    const projectId = functions.config().google.project_id;
    const location = 'us-central1';
    const endpoint = `projects/${projectId}/locations/${location}/endpoints/color-scheme-model`;
    
    const instances = [{
      description: modelDescription,
      faction: faction,
      game_system: gameSystem
    }];
    
    const request = {
      endpoint,
      instances,
    };
    
    const [response] = await client.predict(request);
    
    return {
      success: true,
      colorScheme: response.predictions?.[0]
    };
  } catch (error) {
    console.error('AI color scheme generation error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate color scheme');
  }
});

export const analyzeModelImage = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const bucket = object.bucket;
  
  if (!filePath?.includes('/models/') || !filePath.includes('.jpg')) {
    return;
  }
  
  // Extract user ID and model ID from path
  const pathParts = filePath.split('/');
  const userId = pathParts[1];
  const modelId = pathParts[2];
  
  try {
    // Use Vision API to analyze the image
    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();
    
    const [result] = await client.objectLocalization(`gs://${bucket}/${filePath}`);
    const objects = result.localizedObjectAnnotations;
    
    // Update model document with AI analysis
    await admin.firestore()
      .collection('user_models')
      .doc(userId)
      .collection('models')
      .doc(modelId)
      .update({
        ai_analysis: {
          detected_objects: objects,
          analyzed_at: admin.firestore.FieldValue.serverTimestamp()
        }
      });
      
  } catch (error) {
    console.error('Image analysis error:', error);
  }
});
```

## 7. Firebase Hosting Configuration

### 7.1 Web App Build Configuration

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.plasticcrack\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Plastic Crack',
        short_name: 'PlasticCrack',
        description: 'Warhammer Collection Management Platform',
        theme_color: '#1a202c',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

### 7.2 Firebase Hosting Headers

#### firebase.json (hosting section)
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "plastic-crack-api",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/service-worker.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=86400"
          }
        ]
      }
    ]
  }
}
```

## 8. CI/CD with Google Cloud Build

### 8.1 Cloud Build Configuration

#### cloudbuild.yaml
```yaml
steps:
  # Install dependencies
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['ci']
    dir: 'frontend'

  # Build React app
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['run', 'build']
    dir: 'frontend'
    env:
      - 'VITE_FIREBASE_API_KEY=${_FIREBASE_API_KEY}'
      - 'VITE_FIREBASE_AUTH_DOMAIN=${_FIREBASE_AUTH_DOMAIN}'
      - 'VITE_FIREBASE_PROJECT_ID=${_FIREBASE_PROJECT_ID}'

  # Deploy to Firebase Hosting
  - name: 'gcr.io/plastic-crack-prod/firebase'
    args: ['deploy', '--only=hosting', '--project=${_FIREBASE_PROJECT_ID}']
    dir: 'frontend'

  # Build and deploy Cloud Run services
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'build',
      '-t', 'gcr.io/${_FIREBASE_PROJECT_ID}/plastic-crack-api:${SHORT_SHA}',
      './backend'
    ]

  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/${_FIREBASE_PROJECT_ID}/plastic-crack-api:${SHORT_SHA}']

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args: [
      'run', 'deploy', 'plastic-crack-api',
      '--image=gcr.io/${_FIREBASE_PROJECT_ID}/plastic-crack-api:${SHORT_SHA}',
      '--region=us-central1',
      '--platform=managed',
      '--allow-unauthenticated'
    ]

  # Deploy Firebase Functions
  - name: 'gcr.io/plastic-crack-prod/firebase'
    args: ['deploy', '--only=functions', '--project=${_FIREBASE_PROJECT_ID}']
    dir: 'functions'

substitutions:
  _FIREBASE_PROJECT_ID: 'plastic-crack-prod'
  _FIREBASE_API_KEY: 'your-api-key'
  _FIREBASE_AUTH_DOMAIN: 'plastic-crack-prod.firebaseapp.com'

options:
  logging: CLOUD_LOGGING_ONLY
```

### 8.2 GitHub Actions Integration

#### .github/workflows/deploy-firebase.yml
```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main
      - staging
  pull_request:
    branches:
      - main

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: |
            frontend/package-lock.json
            functions/package-lock.json
      
      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../functions && npm ci
      
      - name: Run tests
        run: |
          cd frontend && npm test -- --coverage --watchAll=false
          cd ../functions && npm test

  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    needs: test
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install Firebase CLI
        run: npm install -g firebase-tools
      
      - name: Build frontend
        run: |
          cd frontend
          npm ci
          npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.STAGING_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.STAGING_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.STAGING_FIREBASE_PROJECT_ID }}
      
      - name: Deploy to Firebase Staging
        run: |
          firebase use staging
          firebase deploy --only hosting,functions
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Setup Google Cloud
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Trigger Cloud Build
        run: |
          gcloud builds submit --config=cloudbuild.yaml \
            --substitutions=_FIREBASE_PROJECT_ID=${{ secrets.GCP_PROJECT_ID }}
```

## 9. Mobile App Configuration

### 9.1 React Native Firebase Setup

#### ios/PlasticCrack/GoogleService-Info.plist
```xml
<!-- Download from Firebase Console for iOS -->
```

#### android/app/google-services.json
```json
// Download from Firebase Console for Android
```

#### firebase-config.js
```javascript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (__DEV__) {
  const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  
  connectAuthEmulator(auth, `http://${localhost}:9099`);
  connectFirestoreEmulator(firestore, localhost, 8080);
  connectStorageEmulator(storage, localhost, 9199);
  connectFunctionsEmulator(functions, localhost, 5001);
}

export default app;
```

### 9.2 Expo Configuration

#### app.json
```json
{
  "expo": {
    "name": "Plastic Crack",
    "slug": "plastic-crack",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a202c"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.plasticcrack.app",
      "googleServicesFile": "./ios/GoogleService-Info.plist"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1a202c"
      },
      "package": "com.plasticcrack.app",
      "googleServicesFile": "./android/google-services.json"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/firestore",
      "@react-native-firebase/storage",
      "@react-native-firebase/functions",
      "@react-native-firebase/messaging",
      "expo-camera",
      "expo-barcode-scanner"
    ],
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

## 10. Monitoring and Analytics

### 10.1 Firebase Analytics & Crashlytics

#### Mobile Analytics Setup
```javascript
// mobile/src/analytics.js
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

export const logEvent = async (eventName, parameters = {}) => {
  try {
    await analytics().logEvent(eventName, parameters);
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export const logScreenView = async (screenName, screenClass) => {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass,
    });
  } catch (error) {
    console.error('Screen view logging error:', error);
  }
};

export const setCrashlyticUserId = async (userId) => {
  try {
    await crashlytics().setUserId(userId);
  } catch (error) {
    console.error('Crashlytics user ID error:', error);
  }
};

export const logCrashlytics = (error, context = {}) => {
  crashlytics().recordError(error);
  crashlytics().log(JSON.stringify(context));
};
```

### 10.2 Google Cloud Monitoring

#### Cloud Monitoring Dashboard
```yaml
# monitoring-dashboard.yaml
displayName: "Plastic Crack Dashboard"
mosaicLayout:
  tiles:
    - width: 6
      height: 4
      widget:
        title: "Cloud Run Request Count"
        xyChart:
          dataSets:
            - timeSeriesQuery:
                timeSeriesFilter:
                  filter: 'resource.type="cloud_run_revision"'
                  aggregation:
                    alignmentPeriod: "60s"
                    perSeriesAligner: ALIGN_RATE
    - width: 6
      height: 4
      widget:
        title: "Cloud SQL Connections"
        xyChart:
          dataSets:
            - timeSeriesQuery:
                timeSeriesFilter:
                  filter: 'resource.type="cloudsql_database"'
    - width: 12
      height: 4
      widget:
        title: "Firebase Hosting Traffic"
        xyChart:
          dataSets:
            - timeSeriesQuery:
                timeSeriesFilter:
                  filter: 'resource.type="firebase_hosting"'
```

### 10.3 Custom Metrics

#### Cloud Function for Custom Metrics
```typescript
// functions/src/metrics.ts
import * as functions from 'firebase-functions';
import { Monitoring } from '@google-cloud/monitoring';

const monitoring = new Monitoring.MetricServiceClient();

export const recordCustomMetric = functions.https.onCall(async (data, context) => {
  const projectId = functions.config().google.project_id;
  
  try {
    const request = {
      name: monitoring.projectPath(projectId),
      timeSeries: [
        {
          metric: {
            type: 'custom.googleapis.com/plastic_crack/user_actions',
            labels: {
              action_type: data.actionType,
              user_tier: data.userTier || 'free'
            }
          },
          resource: {
            type: 'global',
            labels: {
              project_id: projectId
            }
          },
          points: [
            {
              interval: {
                endTime: {
                  seconds: Date.now() / 1000
                }
              },
              value: {
                int64Value: 1
              }
            }
          ]
        }
      ]
    };
    
    await monitoring.createTimeSeries(request);
    return { success: true };
  } catch (error) {
    console.error('Custom metrics error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to record metric');
  }
});
```

## 11. Security Configuration

### 11.1 Cloud Armor Security Policies

#### security-policy.yaml
```yaml
name: "plastic-crack-security-policy"
description: "Security policy for Plastic Crack application"
rules:
  - priority: 1000
    match:
      versionedExpr: SRC_IPS_V1
      config:
        srcIpRanges:
          - "192.0.2.0/24"  # Example blocked IP range
    action: "deny-403"
    description: "Block known malicious IPs"
  
  - priority: 2000
    match:
      expr:
        expression: "origin.region_code == 'CN'"
    action: "deny-403"
    description: "Block traffic from specific regions"
    
  - priority: 3000
    match:
      expr:
        expression: "request.headers['user-agent'].contains('bot')"
    action: "rate_based_ban"
    rateLimitOptions:
      rateLimitThreshold:
        count: 100
        intervalSec: 60
    description: "Rate limit bots"

  - priority: 10000
    match:
      versionedExpr: SRC_IPS_V1
      config:
        srcIpRanges:
          - "*"
    action: "allow"
    description: "Allow all other traffic"
```

### 11.2 IAM Configuration

#### Cloud Run Service Account
```bash
# Create service account for Cloud Run
gcloud iam service-accounts create plastic-crack-api \
  --display-name="Plastic Crack API Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:plastic-crack-api@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:plastic-crack-api@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:plastic-crack-api@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/redis.editor"
```

## 12. Backup and Disaster Recovery

### 12.1 Automated Backups

#### Cloud SQL Backup Configuration
```bash
# Configure automated backups
gcloud sql instances patch plastic-crack-main-db \
  --backup-start-time=03:00 \
  --backup-location=us \
  --retained-backups-count=30 \
  --retained-transaction-log-days=7
```

#### Cloud Storage Backup Script
```bash
#!/bin/bash
# backup-firestore.sh

PROJECT_ID="plastic-crack-prod"
BACKUP_BUCKET="plastic-crack-backups"
DATE=$(date +"%Y%m%d_%H%M%S")

# Export Firestore data
gcloud firestore export gs://${BACKUP_BUCKET}/firestore-backups/${DATE} \
  --project=${PROJECT_ID}

# Export Cloud Storage data
gsutil -m cp -r gs://plastic-crack-prod.appspot.com \
  gs://${BACKUP_BUCKET}/storage-backups/${DATE}/

echo "Backup completed: ${DATE}"
```

### 12.2 Disaster Recovery Plan

#### Recovery Scripts
```bash
#!/bin/bash
# disaster-recovery.sh

PROJECT_ID="plastic-crack-prod"
BACKUP_DATE="20250712_030000"

# Restore Cloud SQL
gcloud sql backups restore ${BACKUP_DATE} \
  --restore-instance=plastic-crack-main-db-restore \
  --backup-instance=plastic-crack-main-db

# Restore Firestore
gcloud firestore import gs://plastic-crack-backups/firestore-backups/${BACKUP_DATE} \
  --project=${PROJECT_ID}

# Restore Cloud Storage
gsutil -m cp -r gs://plastic-crack-backups/storage-backups/${BACKUP_DATE}/* \
  gs://plastic-crack-prod.appspot.com/

echo "Disaster recovery completed"
```

## 13. Deployment Commands

### 13.1 Initial Firebase Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init

# Set up projects
firebase use --add plastic-crack-dev --alias development
firebase use --add plastic-crack-staging --alias staging  
firebase use --add plastic-crack-prod --alias production

# Deploy to development
firebase use development
firebase deploy

# Deploy to staging
firebase use staging
firebase deploy

# Deploy to production
firebase use production
firebase deploy --only hosting,functions
```

### 13.2 Cloud Run Deployment
```bash
# Build and deploy API service
gcloud builds submit --config cloudbuild.yaml

# Deploy specific service
gcloud run deploy plastic-crack-api \
  --image gcr.io/plastic-crack-prod/plastic-crack-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Update service configuration
gcloud run services update plastic-crack-api \
  --region us-central1 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=plastic-crack-prod
```

### 13.3 Mobile App Deployment
```bash
# Build iOS app
cd mobile
eas build --platform ios --profile production

# Build Android app  
eas build --platform android --profile production

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## 14. Troubleshooting

### 14.1 Common Firebase Issues

#### Authentication Problems
```bash
# Check Firebase Auth configuration
firebase auth:export users.json --project plastic-crack-prod

# Reset user password
firebase auth:import users.json --hash-algo=SCRYPT --project plastic-crack-prod
```

#### Firestore Permission Issues
```bash
# Test Firestore rules
firebase firestore:rules:test --project plastic-crack-prod

# Deploy updated rules
firebase deploy --only firestore:rules
```

### 14.2 Cloud Run Debugging
```bash
# View service logs
gcloud logs tail /services/plastic-crack-api --project plastic-crack-prod

# Check service configuration  
gcloud run services describe plastic-crack-api \
  --region us-central1 --project plastic-crack-prod

# Debug local container
docker run -p 8080:8080 -e PORT=8080 \
  gcr.io/plastic-crack-prod/plastic-crack-api:latest
```

### 14.3 Performance Optimization
```bash
# Analyze Cloud SQL performance
gcloud sql operations list --instance plastic-crack-main-db

# Monitor Cloud Run metrics
gcloud run services replace service.yaml --region us-central1

# Optimize Firestore queries
firebase firestore:indexes --project plastic-crack-prod
```

This comprehensive Firebase and Google Cloud deployment guide provides everything needed to host the Plastic Crack platform with enterprise-grade scalability, security, and reliability. The Firebase ecosystem offers seamless integration between web, mobile, and backend services while providing real-time capabilities perfect for the social features of the application.
