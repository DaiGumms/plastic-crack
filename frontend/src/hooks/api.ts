import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, modelsApi, healthApi } from '../services/api';
import type { LoginCredentials, RegisterData, CreateModelData } from '../types';

// Query keys
export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  models: {
    all: ['models'] as const,
    list: (page: number, limit: number) => [...queryKeys.models.all, 'list', page, limit] as const,
    detail: (id: string) => [...queryKeys.models.all, 'detail', id] as const,
  },
  health: {
    check: ['health', 'check'] as const,
  },
};

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      queryClient.setQueryData(queryKeys.auth.profile, data);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      queryClient.setQueryData(queryKeys.auth.profile, data);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      queryClient.clear();
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => authApi.getProfile(),
    enabled: !!localStorage.getItem('access_token'),
  });
};

// Models hooks
export const useModels = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.models.list(page, limit),
    queryFn: () => modelsApi.getModels(page, limit),
    enabled: !!localStorage.getItem('access_token'),
  });
};

export const useModel = (id: string) => {
  return useQuery({
    queryKey: queryKeys.models.detail(id),
    queryFn: () => modelsApi.getModel(id),
    enabled: !!id && !!localStorage.getItem('access_token'),
  });
};

export const useCreateModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateModelData) => modelsApi.createModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.models.all });
    },
  });
};

export const useUpdateModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateModelData> }) =>
      modelsApi.updateModel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.models.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.models.all });
    },
  });
};

export const useDeleteModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => modelsApi.deleteModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.models.all });
    },
  });
};

// Health hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: queryKeys.health.check,
    queryFn: () => healthApi.check(),
    refetchInterval: 30000, // Check every 30 seconds
  });
};
