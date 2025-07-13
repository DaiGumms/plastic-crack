import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define our base API URL - this will point to our backend
const baseUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5001/api/v1' // Development - adjust port as needed
    : 'https://your-production-api.com/api/v1'; // Production URL

// Define types for our API responses
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Define a service using a base URL and expected endpoints
export const plasticCrackApi = createApi({
  reducerPath: 'plasticCrackApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: headers => {
      // Add auth token to requests if available
      // TODO: Add token management
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Collection', 'Model'],
  endpoints: builder => ({
    // Authentication endpoints
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: credentials => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: userData => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getProfile: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    // Health check endpoint
    healthCheck: builder.query<{ status: string }, void>({
      query: () => '/health',
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useHealthCheckQuery,
} = plasticCrackApi;
