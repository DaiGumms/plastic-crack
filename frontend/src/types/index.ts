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

export interface UserModel {
  id: string;
  userId: string;
  name: string;
  description?: string;
  gameSystemId: string;
  factionId?: string;
  collectionId: string;
  
  // Model Details
  paintingStatus: 'UNPAINTED' | 'IN_PROGRESS' | 'COMPLETED';
  pointsCost?: number;
  notes?: string;
  tags: string[];
  
  // Purchase Information
  purchasePrice?: number;
  purchaseDate?: string;
  
  // Visibility and Status
  isPublic: boolean;
  
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

export interface CreateModelData {
  name: string;
  description?: string;
  gameSystemId: string;
  factionId?: string;
  collectionId: string;
  paintingStatus?: 'UNPAINTED' | 'IN_PROGRESS' | 'COMPLETED';
  pointsCost?: number;
  notes?: string;
  tags?: string[];
  purchasePrice?: number;
  purchaseDate?: string;
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
  _count?: {
    models: number;
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
