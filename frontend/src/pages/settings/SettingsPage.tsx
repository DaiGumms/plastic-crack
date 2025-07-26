import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Paper,
  TextField,
  Avatar,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  ArrowBack,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as DataIcon,
  VpnKey as PasswordIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/userService';
import { UploadDialog } from '../../components/ui/UploadDialog';
import type { UploadFile } from '../../components/ui/DragDropUpload';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
}

interface PrivacySettings {
  showEmail: boolean;
  showLocation: boolean;
  showWebsite: boolean;
  showBio: boolean;
  allowFollowers: boolean;
  showFollowersCount: boolean;
  showFollowingCount: boolean;
  showModelsCount: boolean;
  showCollectionsCount: boolean;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  // Profile form state
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
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  // Privacy settings state (disabled for now)
  const [privacySettings] = useState<PrivacySettings>({
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Profile form handlers
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

  const handleAvatarUploadComplete = async (results: UploadFile[]) => {
    const successfulUploads = results.filter(
      file => file.status === 'success' && file.result?.url
    );

    if (successfulUploads.length > 0) {
      const avatarUrl = successfulUploads[0].result!.url;

      try {
        const updatedUser = await userService.updateAvatar(avatarUrl);
        updateUser(updatedUser);
        setSuccess('Avatar updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
        setAvatarDialogOpen(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update avatar'
        );
      }
    }
  };

  const handleAvatarUploadError = (error: string) => {
    setError(error);
    setTimeout(() => setError(null), 5000);
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

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>

        <Typography variant='h4' component='h1' gutterBottom>
          Account Settings
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Manage your account preferences and security settings
        </Typography>
      </Box>

      {/* Global Error/Success Messages */}
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity='success' sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label='account settings tabs'
            variant='scrollable'
            scrollButtons='auto'
          >
            <Tab
              label='Account'
              icon={<PersonIcon />}
              iconPosition='start'
              sx={{ minHeight: 64 }}
            />
            <Tab
              label='Security'
              icon={<SecurityIcon />}
              iconPosition='start'
              sx={{ minHeight: 64 }}
            />
            <Tab
              label='Notifications'
              icon={<NotificationsIcon />}
              iconPosition='start'
              sx={{ minHeight: 64 }}
            />
            <Tab
              label='Data & Privacy'
              icon={<DataIcon />}
              iconPosition='start'
              sx={{ minHeight: 64 }}
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {/* Account Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ p: 3 }}>
              <Typography variant='h6' gutterBottom>
                Profile Information
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Manage your basic account information and profile details.
              </Typography>

              {/* Avatar Section */}
              <Box display='flex' alignItems='center' mb={3}>
                <Box position='relative'>
                  <Avatar
                    src={user?.avatarUrl}
                    sx={{ width: 80, height: 80, mr: 2 }}
                  >
                    {getInitials()}
                  </Avatar>
                  <IconButton
                    size='small'
                    onClick={() => setAvatarDialogOpen(true)}
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
                  >
                    <PhotoCameraIcon fontSize='small' />
                  </IconButton>
                </Box>
                <Box>
                  <Typography variant='h6'>{getDisplayName()}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Member since{' '}
                    {new Date(
                      user?.createdAt || Date.now()
                    ).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Profile Form */}
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
                    value={
                      isEditing ? formData.firstName : user?.firstName || ''
                    }
                    onChange={handleInputChange('firstName')}
                    disabled={!isEditing || isLoading}
                    required={isEditing}
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
                  InputProps={{
                    readOnly: !isEditing,
                  }}
                />
              </Box>

              {/* Action Buttons */}
              <Box mt={3} display='flex' gap={2} justifyContent='flex-end'>
                {!isEditing ? (
                  <Button
                    variant='contained'
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
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
                    >
                      Cancel
                    </Button>
                    <Button
                      variant='contained'
                      startIcon={
                        isLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                )}
              </Box>

              <Alert severity='info' sx={{ mt: 3 }}>
                <Typography variant='body2'>
                  <strong>Coming in Phase 3:</strong> Username changes and
                  additional account management features.
                </Typography>
              </Alert>
            </Box>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography variant='h6' gutterBottom>
                Security Settings
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Manage your account security and privacy preferences.
              </Typography>

              {/* Password & Authentication */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='subtitle1' gutterBottom>
                  Authentication
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PasswordIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Password'
                      secondary='Change your account password'
                    />
                    <Button variant='outlined' size='small' disabled>
                      Change Password
                    </Button>
                  </ListItem>

                  <Divider />

                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Two-Factor Authentication'
                      secondary='Add an extra layer of security to your account'
                    />
                    <Chip label='Not Available' size='small' color='default' />
                  </ListItem>

                  <Divider />

                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary='Login History'
                      secondary='View recent login activity'
                    />
                    <Button variant='outlined' size='small' disabled>
                      View History
                    </Button>
                  </ListItem>
                </List>
              </Box>

              {/* Privacy Controls */}
              <Box sx={{ mb: 4 }}>
                <Typography variant='subtitle1' gutterBottom>
                  Privacy Controls
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}
                >
                  Control what information is visible on your public profile
                </Typography>

                <Alert severity='info' sx={{ mb: 3 }}>
                  Privacy settings are currently disabled during the beta
                  period. These controls will be activated in the next update.
                </Alert>

                {/* Profile Information Visibility */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant='body2' fontWeight='medium' gutterBottom>
                    Profile Information
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacySettings.showEmail}
                        disabled={true}
                      />
                    }
                    label='Show email address'
                    sx={{ opacity: 0.6 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacySettings.showLocation}
                        disabled={true}
                      />
                    }
                    label='Show location'
                    sx={{ opacity: 0.6 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacySettings.showWebsite}
                        disabled={true}
                      />
                    }
                    label='Show website'
                    sx={{ opacity: 0.6 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacySettings.showBio}
                        disabled={true}
                      />
                    }
                    label='Show bio'
                    sx={{ opacity: 0.6 }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Social Features */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant='body2' fontWeight='medium' gutterBottom>
                    Social Features
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacySettings.allowFollowers}
                        disabled={true}
                      />
                    }
                    label='Allow users to follow you'
                    sx={{ opacity: 0.6 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacySettings.showFollowersCount}
                        disabled={true}
                      />
                    }
                    label='Show followers count'
                    sx={{ opacity: 0.6 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacySettings.showFollowingCount}
                        disabled={true}
                      />
                    }
                    label='Show following count'
                    sx={{ opacity: 0.6 }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Collection Visibility */}
                <Box>
                  <Typography variant='body2' fontWeight='medium' gutterBottom>
                    Collection Statistics
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacySettings.showModelsCount}
                        disabled={true}
                      />
                    }
                    label='Show models count'
                    sx={{ opacity: 0.6 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={privacySettings.showCollectionsCount}
                        disabled={true}
                      />
                    }
                    label='Show collections count'
                    sx={{ opacity: 0.6 }}
                  />
                </Box>
              </Box>

              <Alert severity='warning' sx={{ mt: 3 }}>
                <Typography variant='body2'>
                  <strong>Phase 3 Implementation:</strong> Password change,
                  two-factor authentication, login history, and active privacy
                  controls will be available in the next major update.
                </Typography>
              </Alert>
            </Box>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant='h6' gutterBottom>
                Notification Preferences
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Control how and when you receive notifications.
              </Typography>

              <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
                <Typography variant='h6' gutterBottom color='text.secondary'>
                  Notification Categories
                </Typography>

                <List>
                  <ListItem>
                    <ListItemText
                      primary='Account Activity'
                      secondary='Login alerts, password changes, and security notifications'
                    />
                    <Chip label='System Default' size='small' />
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary='Collection Updates'
                      secondary='New models, collection changes, and inventory alerts'
                    />
                    <Chip label='Future Feature' size='small' color='default' />
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary='Social Activity'
                      secondary='Follows, likes, comments, and community interactions'
                    />
                    <Chip label='Future Feature' size='small' color='default' />
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary='Marketing & Updates'
                      secondary='Product updates, feature announcements, and newsletters'
                    />
                    <Chip label='Future Feature' size='small' color='default' />
                  </ListItem>
                </List>
              </Paper>

              <Alert severity='info' sx={{ mt: 3 }}>
                <Typography variant='body2'>
                  <strong>Beta Period:</strong> During the closed beta,
                  notification settings will use system defaults. Full
                  customization will be available at public launch.
                </Typography>
              </Alert>
            </Box>
          </TabPanel>

          {/* Data & Privacy Tab */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ p: 3 }}>
              <Typography variant='h6' gutterBottom>
                Data & Privacy
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Manage your data and privacy settings.
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <DataIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary='Data Export'
                    secondary='Download a copy of your data'
                  />
                  <Button variant='outlined' size='small' disabled>
                    Export Data
                  </Button>
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemIcon>
                    <DeleteIcon color='error' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Delete Account'
                    secondary='Permanently delete your account and all data'
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'error.main',
                      },
                    }}
                  />
                  <Button
                    variant='outlined'
                    color='error'
                    size='small'
                    disabled
                  >
                    Delete Account
                  </Button>
                </ListItem>
              </List>

              <Alert severity='error' sx={{ mt: 3 }}>
                <Typography variant='body2'>
                  <strong>Important:</strong> Data export and account deletion
                  features will be implemented before public launch to ensure
                  full GDPR compliance.
                </Typography>
              </Alert>

              <Alert severity='info' sx={{ mt: 2 }}>
                <Typography variant='body2'>
                  <strong>Beta Testing:</strong> During the beta period, if you
                  need to delete your account or export your data, please
                  contact our support team directly.
                </Typography>
              </Alert>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant='body2' color='text.secondary'>
          Need help? Contact us at{' '}
          <Link
            to='mailto:support@plasticcrack.com'
            style={{ color: 'inherit' }}
          >
            support@plasticcrack.com
          </Link>
        </Typography>
      </Box>

      {/* Avatar Upload Dialog */}
      <UploadDialog
        open={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
        uploadType='avatar'
        onUploadComplete={handleAvatarUploadComplete}
        onUploadError={handleAvatarUploadError}
      />
    </Container>
  );
};
