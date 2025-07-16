# File Upload and Image Processing Service Implementation

This document describes the implementation of Issue #25: File upload and image processing service with Firebase Storage integration.

## Overview

The implementation provides a comprehensive file upload system that:
- Uses Firebase Storage for cost-effective cloud storage with built-in CDN
- Maintains existing JWT authentication (no disruption to current auth system)
- Provides image optimization to minimize storage costs
- Supports organized file structure for avatars, collection thumbnails, and model images

## Architecture

### Services Layer

#### 1. Firebase Service (`src/services/firebase.service.ts`)
- Initializes Firebase Admin SDK
- Handles file uploads to Firebase Storage
- Manages file deletion and existence checks
- Provides public URL generation
- Organized file path generation for different use cases

#### 2. Image Processing Service (`src/services/image-processing.service.ts`)
- Image validation and sanitization using Sharp
- Compression and optimization to reduce storage costs
- Format conversion (JPEG, PNG, WebP)
- Responsive image generation
- Metadata extraction

#### 3. Upload Service (`src/services/upload.service.ts`)
- Coordinates Firebase and image processing services
- Multer configuration for file uploads
- Request validation and metadata extraction
- Error handling for upload operations

### API Routes (`src/routes/v1/upload.routes.ts`)

#### POST `/api/v1/upload/image`
Upload a single optimized image:
```json
{
  "type": "avatar|collection-thumbnail|model-image",
  "collectionId": "uuid", // required for collection-thumbnail and model-image
  "modelId": "uuid",      // required for model-image
  "description": "string",
  "tags": "comma,separated,tags"
}
```

#### POST `/api/v1/upload/responsive`
Upload multiple responsive sizes:
- Thumbnail (150x150)
- Medium (800x600) 
- Large (1920x1080)

#### DELETE `/api/v1/upload/{filePath}`
Delete uploaded files (with user ownership validation)

#### GET `/api/v1/upload/limits`
Get upload configuration and limits

## File Organization Structure

```
/users/{userId}/
  ├── avatar/
  │   └── avatar_{timestamp}_{random}.{ext}
  ├── collections/{collectionId}/
  │   ├── thumbnail_{timestamp}_{random}.{ext}
  │   └── models/{modelId}/
  │       ├── image_1_{timestamp}_{random}.{ext}
  │       ├── image_2_{timestamp}_{random}.{ext}
  │       └── ...
```

## Configuration

### Environment Variables
```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Upload Configuration
MAX_FILE_SIZE=10485760     # 10MB
IMAGE_QUALITY=80           # JPEG quality 0-100
IMAGE_MAX_WIDTH=2048       # Max width in pixels
IMAGE_MAX_HEIGHT=2048      # Max height in pixels
```

### Firebase Setup Required

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project or use existing one

2. **Enable Firebase Storage**
   - In Firebase Console, go to Storage
   - Click "Get Started" and set up storage

3. **Generate Service Account Key**
   - Go to Project Settings > Service Accounts
   - Generate new private key (JSON)
   - Extract projectId, privateKey, and clientEmail for .env

4. **Configure Storage Security Rules**
   ```javascript
   // Firebase Storage Rules
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Allow authenticated uploads only
       match /users/{userId}/{allPaths=**} {
         allow read: if true; // Public read for CDN
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

## Features Implemented

### ✅ Multer middleware for file uploads
- Memory storage for processing before upload
- File size limits (10MB default)
- MIME type validation
- Single file upload support

### ✅ Image validation and sanitization
- Format validation (JPEG, PNG, WebP, GIF)
- Dimension limits (max 10k pixels)
- Corruption detection
- Metadata extraction

### ✅ Image resizing and optimization
- Smart compression based on content
- Format optimization (transparency detection)
- Progressive JPEG encoding
- Configurable quality settings

### ✅ Cloud storage integration (Firebase Storage)
- Firebase Storage instead of AWS S3
- Automatic CDN distribution
- Public URL generation
- File deletion and management

### ✅ File metadata storage
- Upload metadata in Firebase Storage
- User ID, type, description, tags
- Original filename preservation
- Processing information

### ✅ Image serving optimization
- Firebase Storage CDN
- Public URL access
- Format optimization
- Responsive image support

## Security Features

- **Authentication Required**: All uploads require valid JWT token
- **User Isolation**: Files organized by user ID, cross-user access prevented
- **File Type Validation**: Only image MIME types allowed
- **Size Limits**: Configurable file size limits
- **Path Validation**: Prevents directory traversal attacks
- **Ownership Validation**: Users can only delete their own files

## Cost Optimization

- **Image Compression**: 80% quality JPEG by default
- **Format Optimization**: WebP for transparency, JPEG for photos
- **Dimension Limits**: Max 2048x2048 pixels default
- **Progressive Encoding**: Faster loading and better compression
- **Firebase Storage**: Cost-effective with generous free tier

## Usage Examples

### Upload Avatar
```bash
curl -X POST http://localhost:3001/api/v1/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@avatar.jpg" \
  -F "type=avatar"
```

### Upload Collection Thumbnail
```bash
curl -X POST http://localhost:3001/api/v1/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@collection.jpg" \
  -F "type=collection-thumbnail" \
  -F "collectionId=123e4567-e89b-12d3-a456-426614174000"
```

### Upload Model Image with Tags
```bash
curl -X POST http://localhost:3001/api/v1/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@model.jpg" \
  -F "type=model-image" \
  -F "collectionId=123e4567-e89b-12d3-a456-426614174000" \
  -F "modelId=456e7890-e89b-12d3-a456-426614174001" \
  -F "description=Finished Space Marine Captain" \
  -F "tags=painted,completed,display"
```

## Next Steps

1. **Frontend Integration**: Create upload components in React frontend
2. **Database Integration**: Store file URLs in Prisma models
3. **Image Gallery**: Display uploaded images in collections and models
4. **Batch Uploads**: Support multiple image uploads
5. **Image Editing**: Basic cropping and rotation features
6. **Progressive Web App**: Offline upload queue

## Testing

The implementation includes comprehensive error handling and validation. To test:

1. Set up Firebase project and configure environment variables
2. Start the backend server
3. Use the provided curl examples or integrate with frontend
4. Verify files appear in Firebase Storage console
5. Test file deletion and access controls

## Dependencies Added

```json
{
  "firebase-admin": "^12.0.0",
  "sharp": "^0.32.0",
  "@types/sharp": "^0.32.0"
}
```
