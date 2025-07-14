import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';
import { ProfilePrivacyControls } from '../components/profile/ProfilePrivacyControls';
import type { PrivacySettings } from '../components/profile/ProfilePrivacyControls';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
}

export const UserProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    showEmail: false,
    showLocation: true,
    showWebsite: true,
    showBio: true,
    allowFollowers: true,
    showFollowersCount: true,
    showFollowingCount: true,
    showModelsCount: true,
    showCollectionsCount: true,
  });

  const handleInputChange =
    (field: keyof ProfileFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Invalid email format';
    }
    if (formData.bio.length > 500) {
      return 'Bio must be 500 characters or less';
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await userService.updateProfile(formData);
      updateUser(updatedUser);

      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    if (user) {
      // Always populate form with current user data when entering edit mode
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    // Reset form data to current user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('File must be JPEG, PNG, or WebP format');
      return;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await userService.uploadAvatar(file);
      updateUser(updatedUser);
      setSuccess('Avatar updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    const firstName = user.firstName?.trim() || '';
    const lastName = user.lastName?.trim() || '';

    if (!firstName && !lastName) return 'Anonymous User';
    if (!lastName) return firstName;
    if (!firstName) return lastName;

    return `${firstName} ${lastName}`;
  };

  const getInitials = () => {
    if (!user) return '??';
    const firstName = user.firstName?.trim()[0]?.toUpperCase() || '';
    const lastName = user.lastName?.trim()[0]?.toUpperCase() || '';

    if (!firstName && !lastName) return '??';
    if (!lastName) return firstName + firstName;
    if (!firstName) return lastName + lastName;

    return firstName + lastName;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePrivacySettingsChange = (newSettings: PrivacySettings) => {
    setPrivacySettings(newSettings);
    // TODO: Save privacy settings to backend
    setSuccess('Privacy settings updated successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  if (!user) {
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

  return (
    <Box maxWidth='800px' mx='auto' p={3}>
      <Typography variant='h4' component='h1' gutterBottom>
        User Profile
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }} data-testid='error-alert'>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity='success' sx={{ mb: 2 }} data-testid='success-alert'>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          {/* Avatar Section */}
          <Box display='flex' alignItems='center' mb={3}>
            <Box position='relative'>
              <Avatar
                src={user.avatarUrl}
                sx={{ width: 80, height: 80, mr: 2 }}
                data-testid='user-avatar'
              >
                {getInitials()}
              </Avatar>
              <input
                accept='image/jpeg,image/png,image/webp'
                style={{ display: 'none' }}
                id='avatar-upload'
                type='file'
                onChange={handleAvatarUpload}
                data-testid='avatar-upload-input'
              />
              <label htmlFor='avatar-upload'>
                <IconButton
                  component='span'
                  size='small'
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 16,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                  data-testid='avatar-upload-button'
                >
                  <PhotoCameraIcon fontSize='small' />
                </IconButton>
              </label>
            </Box>
            <Box>
              <Typography variant='h6' data-testid='display-name'>
                {getDisplayName()}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Member since{' '}
                {new Date(user.createdAt || Date.now()).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Tabs for Profile and Privacy Settings */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor='primary'
            textColor='primary'
            sx={{ mb: 3 }}
          >
            <Tab label='Profile' icon={<PersonIcon />} />
            <Tab label='Privacy' icon={<SecurityIcon />} />
          </Tabs>

          {/* Profile Form */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <TextField
                  fullWidth
                  label='First Name'
                  value={isEditing ? formData.firstName : user?.firstName || ''}
                  onChange={handleInputChange('firstName')}
                  disabled={!isEditing || isLoading}
                  required={isEditing}
                  data-testid='firstName-input'
                  InputProps={{
                    readOnly: !isEditing,
                  }}
                />
                <TextField
                  fullWidth
                  label='Last Name'
                  value={isEditing ? formData.lastName : user?.lastName || ''}
                  onChange={handleInputChange('lastName')}
                  disabled={!isEditing || isLoading}
                  required={isEditing}
                  data-testid='lastName-input'
                  InputProps={{
                    readOnly: !isEditing,
                  }}
                />
              </Box>
              <TextField
                fullWidth
                label='Email'
                type='email'
                value={isEditing ? formData.email : user?.email || ''}
                onChange={handleInputChange('email')}
                disabled={!isEditing || isLoading}
                required={isEditing}
                data-testid='email-input'
                InputProps={{
                  readOnly: !isEditing,
                }}
              />
              <TextField
                fullWidth
                label='Bio'
                multiline
                rows={4}
                value={isEditing ? formData.bio : user?.bio || ''}
                onChange={handleInputChange('bio')}
                disabled={!isEditing || isLoading}
                helperText={
                  isEditing
                    ? `${formData.bio.length}/500 characters`
                    : undefined
                }
                inputProps={isEditing ? { maxLength: 500 } : undefined}
                data-testid='bio-input'
                InputProps={{
                  readOnly: !isEditing,
                }}
              />
            </Box>
          )}

          {/* Privacy Settings */}
          {activeTab === 1 && (
            <ProfilePrivacyControls
              settings={privacySettings}
              onSettingsChange={handlePrivacySettingsChange}
            />
          )}

          {/* Action Buttons */}
          <Box mt={3} display='flex' gap={2} justifyContent='flex-end'>
            {!isEditing ? (
              <Button
                variant='contained'
                startIcon={<EditIcon />}
                onClick={handleEditClick}
                data-testid='edit-button'
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant='outlined'
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={isLoading}
                  data-testid='cancel-button'
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  startIcon={
                    isLoading ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                  onClick={handleSave}
                  disabled={isLoading}
                  data-testid='save-button'
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
