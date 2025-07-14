import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  Typography,
  Button,
  Slide,
  Paper,
} from '@mui/material';
import { WifiOff, Wifi, CloudOff, Refresh } from '@mui/icons-material';
import type { SlideProps } from '@mui/material/Slide';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  showOnlineMessage?: boolean;
  autoHideDelay?: number;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction='up' />;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showOnlineMessage = true,
  autoHideDelay = 3000,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineSnackbar, setShowOnlineSnackbar] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (hasBeenOffline && showOnlineMessage) {
        setShowOnlineSnackbar(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasBeenOffline(true);
      setShowOnlineSnackbar(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasBeenOffline, showOnlineMessage]);

  const handleCloseOnlineSnackbar = () => {
    setShowOnlineSnackbar(false);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: 'error.main',
            color: 'error.contrastText',
            py: 1,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <WifiOff fontSize='small' />
          <Typography variant='body2' fontWeight='medium'>
            You're offline. Some features may not be available.
          </Typography>
          <Button
            size='small'
            variant='outlined'
            startIcon={<Refresh />}
            onClick={handleRetry}
            sx={{
              ml: 2,
              borderColor: 'error.contrastText',
              color: 'error.contrastText',
              '&:hover': {
                borderColor: 'error.contrastText',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Retry
          </Button>
        </Box>
      )}

      {/* Back Online Snackbar */}
      <Snackbar
        open={showOnlineSnackbar}
        autoHideDuration={autoHideDelay}
        onClose={handleCloseOnlineSnackbar}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseOnlineSnackbar}
          severity='success'
          variant='filled'
          icon={<Wifi />}
          sx={{ width: '100%' }}
        >
          <AlertTitle>Back Online</AlertTitle>
          Your connection has been restored.
        </Alert>
      </Snackbar>
    </>
  );
};

// Offline fallback component for critical features
interface OfflineFallbackProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiresConnection?: boolean;
}

export const OfflineFallback: React.FC<OfflineFallbackProps> = ({
  children,
  fallback,
  requiresConnection = true,
}) => {
  const isOnline = useOnlineStatus();

  if (!isOnline && requiresConnection) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Paper
        elevation={1}
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: 'grey.50',
          border: '1px dashed',
          borderColor: 'grey.300',
        }}
      >
        <CloudOff
          sx={{
            fontSize: 48,
            color: 'grey.400',
            mb: 2,
          }}
        />
        <Typography variant='h6' gutterBottom color='text.secondary'>
          This feature requires an internet connection
        </Typography>
        <Typography variant='body2' color='text.disabled'>
          Please check your connection and try again.
        </Typography>
      </Paper>
    );
  }

  return <>{children}</>;
};
