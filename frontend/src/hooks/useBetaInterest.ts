import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

// Types
export interface BetaInterestData {
  email: string;
  name?: string;
  interests?: string[];
  acceptUpdates?: boolean;
}

export interface BetaInterestResponse {
  success: boolean;
  message: string;
  queuePosition?: number;
}

// API service
const betaService = {
  async submitInterest(data: BetaInterestData): Promise<BetaInterestResponse> {
    const response = await fetch('/api/beta/interest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register interest');
    }

    return response.json();
  },

  async checkStatus(
    email: string
  ): Promise<{ position: number; total: number }> {
    const response = await fetch(
      `/api/beta/status?email=${encodeURIComponent(email)}`
    );

    if (!response.ok) {
      throw new Error('Failed to check beta status');
    }

    return response.json();
  },
};

// Query keys
export const betaQueryKeys = {
  interest: ['beta', 'interest'] as const,
  status: (email: string) => ['beta', 'status', email] as const,
} as const;

// Hooks
export const useBetaInterest = () => {
  const queryClient = useQueryClient();

  const submitInterest = useMutation({
    mutationFn: betaService.submitInterest,
    onSuccess: () => {
      // Invalidate any beta-related queries
      queryClient.invalidateQueries({ queryKey: betaQueryKeys.interest });
    },
    onError: error => {
      console.error('Beta interest submission error:', error);
    },
  });

  const checkStatus = useMutation({
    mutationFn: (email: string) => betaService.checkStatus(email),
    onError: error => {
      console.error('Beta status check error:', error);
    },
  });

  return {
    submitInterest: submitInterest.mutate,
    isSubmitting: submitInterest.isPending,
    submitError: submitInterest.error,
    submitSuccess: submitInterest.isSuccess,
    submitData: submitInterest.data,

    checkStatus: checkStatus.mutate,
    isCheckingStatus: checkStatus.isPending,
    statusError: checkStatus.error,
    statusData: checkStatus.data,
  };
};

// Utility functions
export const validateEmail = (email: string): boolean => {
  const emailSchema = z.string().email();
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};

export const formatQueuePosition = (
  position: number,
  total: number
): string => {
  const percentage = Math.round((position / total) * 100);
  return `You're #${position} in the queue (${percentage}% through)`;
};
