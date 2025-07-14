import React from 'react';
import {
  Box,
  Skeleton,
  CircularProgress,
  LinearProgress,
  Typography,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

// Generic loading spinner
interface LoadingSpinnerProps {
  size?: number | string;
  message?: string;
  sx?: SxProps<Theme>;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message,
  sx,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 4,
        ...sx,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant='body2' color='text.secondary'>
          {message}
        </Typography>
      )}
    </Box>
  );
};

// Loading overlay for forms
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  children,
}) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            borderRadius: 'inherit',
          }}
        >
          <LoadingSpinner message={message} />
        </Box>
      )}
    </Box>
  );
};

// Skeleton loaders for different content types
export const ProfileSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          {/* Avatar and name */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant='circular' width={64} height={64} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant='text' width='60%' height={24} />
              <Skeleton variant='text' width='40%' height={20} />
            </Box>
          </Box>

          {/* Bio */}
          <Box>
            <Skeleton variant='text' width='100%' />
            <Skeleton variant='text' width='80%' />
            <Skeleton variant='text' width='60%' />
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Skeleton variant='text' width={60} height={20} />
              <Skeleton variant='text' width={40} height={16} />
            </Box>
            <Box>
              <Skeleton variant='text' width={60} height={20} />
              <Skeleton variant='text' width={40} height={16} />
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box>
        <Skeleton variant='text' width='30%' height={32} />
        <Skeleton variant='text' width='60%' height={20} />
      </Box>

      {/* Stats cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2,
        }}
      >
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent>
              <Skeleton variant='text' width='70%' height={20} />
              <Skeleton variant='text' width='40%' height={32} />
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Main content */}
      <Card>
        <CardContent>
          <Skeleton variant='text' width='25%' height={24} />
          <Stack spacing={1} sx={{ mt: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <Box
                key={i}
                sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
              >
                <Skeleton variant='rectangular' width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant='text' width='60%' />
                  <Skeleton variant='text' width='40%' />
                </Box>
                <Skeleton variant='text' width={80} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <Stack spacing={3}>
      <Skeleton variant='text' width='30%' height={32} />

      {[1, 2, 3, 4].map(i => (
        <Box key={i}>
          <Skeleton variant='text' width='20%' height={20} sx={{ mb: 1 }} />
          <Skeleton variant='rectangular' width='100%' height={56} />
        </Box>
      ))}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Skeleton variant='rectangular' width={100} height={36} />
        <Skeleton variant='rectangular' width={100} height={36} />
      </Box>
    </Stack>
  );
};

// Progress indicator for multi-step processes
interface ProgressIndicatorProps {
  progress: number; // 0-100
  message?: string;
  variant?: 'linear' | 'circular';
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  message,
  variant = 'linear',
}) => {
  if (variant === 'circular') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress variant='determinate' value={progress} size={60} />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant='caption'
              component='div'
              color='text.secondary'
            >
              {`${Math.round(progress)}%`}
            </Typography>
          </Box>
        </Box>
        {message && (
          <Typography variant='body2' color='text.secondary'>
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {message && (
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
          {message}
        </Typography>
      )}
      <LinearProgress variant='determinate' value={progress} />
      <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
        {Math.round(progress)}% complete
      </Typography>
    </Box>
  );
};
