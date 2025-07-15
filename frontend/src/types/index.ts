// User types
export interface User {
  id: string;
  email: string;
  username: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Extended user profile for user management features
export interface UserProfile extends User {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
  isEmailVerified?: boolean;
}

// Public profile view (limited information)
export interface PublicUserProfile {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
  createdAt: string;
  isEmailVerified?: boolean;
}

// Follow-related types
export interface FollowStatus {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

export interface AuthUser extends User {
  accessToken: string;
  refreshToken: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// Model/Collection types
export interface ModelLike {
  id: string;
  userId: string;
  modelId: string;
  createdAt: string;
}

// Model Library types - Available models that users can add to collections
export interface LibraryModel {
  id: string;
  name: string;
  description?: string;
  gameSystemId: string;
  factionId: string;

  // Model Details
  pointsCost?: number;
  officialImageUrl?: string;

  // Metadata
  isOfficial: boolean;
  tags: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  gameSystem?: {
    id: string;
    name: string;
    shortName: string;
  };
  faction?: {
    id: string;
    name: string;
  };
}

// User's collection model instances - instances of library models in user collections
export interface UserModel {
  id: string;
  userId: string;
  modelId: string; // References LibraryModel (renamed from libraryModelId)
  collectionId: string;

  // User customizations
  customName?: string; // User's custom name for this instance
  paintingStatus:
    | 'UNPAINTED'
    | 'PRIMED'
    | 'BASE_COATED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'SHOWCASE';
  notes?: string;
  tags: string[]; // User's custom tags (renamed from userTags)

  // Purchase Information
  purchasePrice?: number;
  purchaseDate?: string;

  // Custom user fields
  customPointsCost?: number; // User's custom point cost override

  // Visibility
  isPublic: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  model?: LibraryModel; // Renamed from libraryModel
  collection?: {
    id: string;
    name: string;
    user?: {
      id: string;
      username: string;
      displayName?: string;
      profileImageUrl?: string;
    };
  };
  photos?: {
    id: string;
    fileName: string;
    originalUrl: string;
    thumbnailUrl?: string;
    description?: string;
    isPrimary: boolean;
  }[];
  likes?: ModelLike[];
  _count?: {
    likes: number;
  };
}

export interface CreateUserModelData {
  modelId: string; // Renamed from libraryModelId
  collectionId: string;
  customName?: string;
  paintingStatus?:
    | 'UNPAINTED'
    | 'PRIMED'
    | 'BASE_COATED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'SHOWCASE';
  notes?: string;
  tags?: string[]; // Renamed from userTags
  purchasePrice?: number;
  purchaseDate?: string;
  customPointsCost?: number;
  isPublic?: boolean;
}

// Backend API expects this structure for creating models
export interface CreateModelRequest {
  name: string;
  description?: string;
  gameSystemId: string;
  factionId?: string;
  collectionId: string;
  paintingStatus?:
    | 'UNPAINTED'
    | 'PRIMED'
    | 'BASE_COATED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'SHOWCASE';
  notes?: string;
  tags?: string[];
  purchasePrice?: number;
  purchaseDate?: string;
  pointsCost?: number;
  isPublic?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  userId: string;
  gameSystemId: string;
  gameSystem?: {
    id: string;
    name: string;
    shortName: string;
    description?: string;
    publisher?: string;
  };
  tags: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    displayName?: string;
    profileImageUrl?: string;
  };
  models?: UserModel[];
  userModels?: UserModel[];
  _count?: {
    models: number;
    userModels: number;
  };
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  isPublic?: boolean;
  gameSystemId: string;
  tags?: string[];
  imageUrl?: string;
}

export interface UpdateCollectionData {
  name?: string;
  description?: string;
  isPublic?: boolean;
  gameSystemId?: string;
  tags?: string[];
  imageUrl?: string;
}

export interface CollectionFilter {
  search?: string;
  isPublic?: boolean;
  tags?: string[];
  userId?: string;
  gameSystem?: string;
}

export interface CollectionStats {
  totalModels: number;
  unpainterModels: number;
  inProgressModels: number;
  completedModels: number;
  totalValue: number;
  averageValue: number;
  mostRecentModel?: UserModel;
}

// Game System and Faction types
export interface GameSystem {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Faction {
  id: string;
  name: string;
  description?: string;
  gameSystemId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  gameSystem?: GameSystem;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Type aliases for backward compatibility
export type CreateModelData = CreateModelRequest;
