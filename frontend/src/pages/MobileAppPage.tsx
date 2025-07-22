import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Paper,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PhoneAndroid as AndroidIcon,
  PhoneIphone as IosIcon,
  NotificationsActive as NotifyIcon,
  Check as CheckIcon,
  CloudSync as SyncIcon,
  CameraAlt as CameraIcon,
  Inventory as CollectionIcon,
  Group as CommunityIcon,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';

export const MobileAppPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();

  const [email, setEmail] = useState(user?.email || '');
  const [subscribed, setSubscribed] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: (email: string) =>
      notificationService.subscribeToMobileAppNotifications(email),
    onSuccess: () => {
      setSubscribed(true);
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      subscribeMutation.mutate(email.trim());
    }
  };

  const features = [
    {
      icon: <CameraIcon sx={{ fontSize: 40 }} />,
      title: 'Photo Capture',
      description:
        'Take photos of your models directly in the app with automatic organization',
    },
    {
      icon: <SyncIcon sx={{ fontSize: 40 }} />,
      title: 'Cloud Sync',
      description:
        'Your collections sync seamlessly between web and mobile devices',
    },
    {
      icon: <CollectionIcon sx={{ fontSize: 40 }} />,
      title: 'Offline Access',
      description: "View your collections and models even when you're offline",
    },
    {
      icon: <CommunityIcon sx={{ fontSize: 40 }} />,
      title: 'Social Features',
      description:
        'Share your latest projects and connect with other collectors on the go',
    },
  ];

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant='h2'
          component='h1'
          sx={{
            fontWeight: 'bold',
            mb: 2,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Plastic Crack Mobile
        </Typography>
        <Typography
          variant='h5'
          color='text.secondary'
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          Your miniature collection, everywhere you go. Coming soon to Android
          and iOS.
        </Typography>

        {/* Platform Badges */}
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={2}
          justifyContent='center'
          alignItems='center'
          sx={{ mb: 4 }}
        >
          <Chip
            icon={<AndroidIcon />}
            label='Coming to Android'
            variant='outlined'
            sx={{
              fontSize: '1.1rem',
              py: 3,
              px: 2,
              borderColor: 'success.main',
              color: 'success.main',
            }}
          />
          <Chip
            icon={<IosIcon />}
            label='Coming to iOS'
            variant='outlined'
            sx={{
              fontSize: '1.1rem',
              py: 3,
              px: 2,
              borderColor: 'info.main',
              color: 'info.main',
            }}
          />
        </Stack>

        {/* Notification Signup */}
        <Card sx={{ maxWidth: 500, mx: 'auto', mb: 6 }}>
          <CardContent sx={{ p: 4 }}>
            {subscribed ? (
              <Box sx={{ textAlign: 'center' }}>
                <CheckIcon
                  sx={{ fontSize: 48, color: 'success.main', mb: 2 }}
                />
                <Typography variant='h6' color='success.main' sx={{ mb: 1 }}>
                  You're All Set!
                </Typography>
                <Typography color='text.secondary'>
                  We'll notify you as soon as the mobile app is available for
                  download.
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    justifyContent: 'center',
                  }}
                >
                  <NotifyIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant='h6'>Get Notified</Typography>
                </Box>
                <Typography
                  color='text.secondary'
                  sx={{ mb: 3, textAlign: 'center' }}
                >
                  Be the first to know when the mobile app launches
                </Typography>
                <Box component='form' onSubmit={handleSubscribe}>
                  <TextField
                    fullWidth
                    label='Email Address'
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                    disabled={subscribeMutation.isPending}
                  />
                  <Button
                    type='submit'
                    variant='contained'
                    fullWidth
                    size='large'
                    disabled={subscribeMutation.isPending || !email.trim()}
                    sx={{ py: 1.5 }}
                  >
                    {subscribeMutation.isPending
                      ? 'Subscribing...'
                      : 'Notify Me'}
                  </Button>
                </Box>
                {subscribeMutation.error && (
                  <Alert severity='error' sx={{ mt: 2 }}>
                    Failed to subscribe. Please try again.
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant='h4'
          component='h2'
          sx={{ textAlign: 'center', mb: 1, fontWeight: 'bold' }}
        >
          Built for Mobile
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ textAlign: 'center', mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          Experience all the power of Plastic Crack optimized for your mobile
          device
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {features.map((feature, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
              <Typography variant='h6' sx={{ mb: 1, fontWeight: 'medium' }}>
                {feature.title}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {feature.description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Timeline Section */}
      <Card sx={{ mb: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant='h4'
            component='h2'
            sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold' }}
          >
            Development Timeline
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)',
              },
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Chip
                label='Q3 2025'
                color='primary'
                variant='filled'
                sx={{ mb: 2, fontSize: '1rem', py: 2 }}
              />
              <Typography variant='h6' sx={{ mb: 1 }}>
                Beta Testing
              </Typography>
              <Typography color='text.secondary'>
                Limited beta release for early adopters and community feedback
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Chip
                label='Q4 2025'
                color='secondary'
                variant='outlined'
                sx={{ mb: 2, fontSize: '1rem', py: 2 }}
              />
              <Typography variant='h6' sx={{ mb: 1 }}>
                Public Launch
              </Typography>
              <Typography color='text.secondary'>
                Full release on Google Play Store and Apple App Store
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Chip
                label='2026'
                color='info'
                variant='outlined'
                sx={{ mb: 2, fontSize: '1rem', py: 2 }}
              />
              <Typography variant='h6' sx={{ mb: 1 }}>
                Advanced Features
              </Typography>
              <Typography color='text.secondary'>
                AR model viewing, advanced photo editing, and more
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Current Features */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant='h4'
            component='h2'
            sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}
          >
            Available Now on Web
          </Typography>
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ textAlign: 'center', mb: 4 }}
          >
            While you wait for the mobile app, explore all the features
            available on our web platform
          </Typography>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant='contained'
              size='large'
              href={isAuthenticated ? '/dashboard' : '/register'}
              sx={{ mr: 2, mb: 2 }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Sign Up Now'}
            </Button>
            <Button
              variant='outlined'
              size='large'
              href='/collections'
              sx={{ mb: 2 }}
            >
              Browse Collections
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MobileAppPage;
