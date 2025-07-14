import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Language as WebsiteIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';
import type { PublicUserProfile } from '../types';

interface PublicProfilePageProps {
  userId?: string; // Optional - if not provided, will use URL param
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
  userId: propUserId,
}) => {
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  const userId = propUserId || urlUserId;

  const [profileUser, setProfileUser] =
    React.useState<PublicUserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [followLoading, setFollowLoading] = React.useState(false);

  // Redirect if trying to view own profile
  React.useEffect(() => {
    if (userId === currentUser?.id) {
      window.location.href = '/profile';
    }
  }, [userId, currentUser?.id]);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('User ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch public profile data
        const profile = await userService.getPublicProfile(userId);
        setProfileUser(profile);

        // Check if current user is following this user (if authenticated)
        if (currentUser) {
          const followStatus = await userService.getFollowStatus(userId);
          setIsFollowing(followStatus.isFollowing);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser || !userId) return;

    try {
      setFollowLoading(true);

      if (isFollowing) {
        await userService.unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await userService.followUser(userId);
        setIsFollowing(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Follow action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  const getDisplayName = (user: PublicUserProfile) => {
    const firstName = user.firstName?.trim() || '';
    const lastName = user.lastName?.trim() || '';

    if (!firstName && !lastName) return user.username || 'Anonymous User';
    if (!lastName) return firstName;
    if (!firstName) return lastName;

    return `${firstName} ${lastName}`;
  };

  const getInitials = (user: PublicUserProfile) => {
    const firstName = user.firstName?.trim()[0]?.toUpperCase() || '';
    const lastName = user.lastName?.trim()[0]?.toUpperCase() || '';

    if (!firstName && !lastName)
      return user.username?.[0]?.toUpperCase() || '?';
    if (!lastName) return firstName + firstName;
    if (!firstName) return lastName + lastName;

    return firstName + lastName;
  };

  const formatMemberSince = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profileUser) {
    return (
      <Box maxWidth='800px' mx='auto' p={3}>
        <Alert severity='error'>{error || 'Profile not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box maxWidth='800px' mx='auto' p={3}>
      <Card>
        <CardContent>
          {/* Header Section */}
          <Box
            display='flex'
            alignItems='flex-start'
            justifyContent='space-between'
            mb={3}
          >
            <Box display='flex' alignItems='center'>
              <Avatar
                src={profileUser.avatarUrl}
                sx={{ width: 80, height: 80, mr: 2 }}
                data-testid='profile-avatar'
              >
                {getInitials(profileUser)}
              </Avatar>
              <Box>
                <Typography
                  variant='h5'
                  component='h1'
                  gutterBottom
                  data-testid='profile-name'
                >
                  {getDisplayName(profileUser)}
                </Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  @{profileUser.username}
                </Typography>
                <Box display='flex' alignItems='center' gap={1}>
                  <CalendarIcon fontSize='small' color='action' />
                  <Typography variant='body2' color='text.secondary'>
                    Member since {formatMemberSince(profileUser.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Follow Button (only show if user is authenticated and not viewing own profile) */}
            {currentUser && currentUser.id !== profileUser.id && (
              <Button
                variant={isFollowing ? 'outlined' : 'contained'}
                startIcon={
                  followLoading ? (
                    <CircularProgress size={16} />
                  ) : isFollowing ? (
                    <PersonRemoveIcon />
                  ) : (
                    <PersonAddIcon />
                  )
                }
                onClick={handleFollowToggle}
                disabled={followLoading}
                data-testid='follow-button'
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Bio Section */}
          {profileUser.bio && (
            <Box mb={3}>
              <Typography variant='h6' gutterBottom>
                About
              </Typography>
              <Typography variant='body1' data-testid='profile-bio'>
                {profileUser.bio}
              </Typography>
            </Box>
          )}

          {/* Contact Information */}
          <Box mb={3}>
            <Typography variant='h6' gutterBottom>
              Information
            </Typography>
            <Box display='flex' flexDirection='column' gap={1}>
              {profileUser.location && (
                <Box display='flex' alignItems='center' gap={1}>
                  <LocationIcon fontSize='small' color='action' />
                  <Typography variant='body2' data-testid='profile-location'>
                    {profileUser.location}
                  </Typography>
                </Box>
              )}

              {profileUser.website && (
                <Box display='flex' alignItems='center' gap={1}>
                  <WebsiteIcon fontSize='small' color='action' />
                  <Typography
                    variant='body2'
                    component='a'
                    href={profileUser.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    sx={{ color: 'primary.main', textDecoration: 'none' }}
                    data-testid='profile-website'
                  >
                    {profileUser.website}
                  </Typography>
                </Box>
              )}

              {/* Only show email if user has made it public (we'll add this privacy setting later) */}
              {profileUser.isEmailVerified && (
                <Box display='flex' alignItems='center' gap={1}>
                  <EmailIcon fontSize='small' color='action' />
                  <Chip
                    label='Email Verified'
                    size='small'
                    color='success'
                    variant='outlined'
                  />
                </Box>
              )}
            </Box>
          </Box>

          {/* Stats Section (placeholder for future features) */}
          <Box>
            <Typography variant='h6' gutterBottom>
              Activity
            </Typography>
            <Box display='flex' gap={2}>
              <Chip label='0 Models' variant='outlined' size='small' />
              <Chip label='0 Collections' variant='outlined' size='small' />
              <Chip label='0 Followers' variant='outlined' size='small' />
              <Chip label='0 Following' variant='outlined' size='small' />
            </Box>
          </Box>

          {/* Privacy Notice */}
          {!currentUser && (
            <Box mt={3}>
              <Alert severity='info'>
                <Typography variant='body2'>
                  Some profile information is only visible to registered users.{' '}
                  <Typography
                    component='span'
                    color='primary'
                    sx={{ cursor: 'pointer' }}
                  >
                    Sign up
                  </Typography>{' '}
                  to see more details.
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
