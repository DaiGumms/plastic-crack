// Common component props
export interface BaseProps {
  testID?: string;
}

// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Collection related types
export interface Collection {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  models?: Model[];
}

// Model related types
export interface Model {
  id: string;
  name: string;
  description?: string;
  collectionId: string;
  armyId?: string;
  paintingStatusId?: string;
  createdAt: string;
  updatedAt: string;
  images?: ModelImage[];
  tags?: Tag[];
}

export interface ModelImage {
  id: string;
  modelId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface Army {
  id: string;
  name: string;
  gameSystem: string;
  description?: string;
}

export interface PaintingStatus {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
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

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CollectionForm {
  name: string;
  description?: string;
}

export interface ModelForm {
  name: string;
  description?: string;
  armyId?: string;
  paintingStatusId?: string;
}
