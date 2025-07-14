import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
} from '@mui/material';

export interface PrivacySettings {
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

interface ProfilePrivacyControlsProps {
  settings: PrivacySettings;
  onSettingsChange: (settings: PrivacySettings) => void;
  isLoading?: boolean;
}

export const ProfilePrivacyControls: React.FC<ProfilePrivacyControlsProps> = ({
  settings,
  onSettingsChange,
  isLoading = false,
}) => {
  const handleSettingChange =
    (key: keyof PrivacySettings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSettingsChange({
        ...settings,
        [key]: event.target.checked,
      });
    };

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Privacy Controls
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Control what information is visible on your public profile
        </Typography>

        <Alert severity='info' sx={{ mb: 3 }}>
          These settings only affect your public profile. Authenticated users
          may see additional information based on your relationship with them.
        </Alert>

        {/* Profile Information Visibility */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle1' gutterBottom>
            Profile Information
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.showEmail}
                onChange={handleSettingChange('showEmail')}
                disabled={isLoading}
                data-testid='privacy-show-email'
              />
            }
            label='Show email address'
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showLocation}
                onChange={handleSettingChange('showLocation')}
                disabled={isLoading}
                data-testid='privacy-show-location'
              />
            }
            label='Show location'
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showWebsite}
                onChange={handleSettingChange('showWebsite')}
                disabled={isLoading}
                data-testid='privacy-show-website'
              />
            }
            label='Show website'
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showBio}
                onChange={handleSettingChange('showBio')}
                disabled={isLoading}
                data-testid='privacy-show-bio'
              />
            }
            label='Show bio'
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Social Features */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle1' gutterBottom>
            Social Features
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.allowFollowers}
                onChange={handleSettingChange('allowFollowers')}
                disabled={isLoading}
                data-testid='privacy-allow-followers'
              />
            }
            label='Allow others to follow me'
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showFollowersCount}
                onChange={handleSettingChange('showFollowersCount')}
                disabled={isLoading || !settings.allowFollowers}
                data-testid='privacy-show-followers-count'
              />
            }
            label='Show followers count'
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showFollowingCount}
                onChange={handleSettingChange('showFollowingCount')}
                disabled={isLoading}
                data-testid='privacy-show-following-count'
              />
            }
            label='Show following count'
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Collection Visibility */}
        <Box>
          <Typography variant='subtitle1' gutterBottom>
            Collection Information
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.showModelsCount}
                onChange={handleSettingChange('showModelsCount')}
                disabled={isLoading}
                data-testid='privacy-show-models-count'
              />
            }
            label='Show models count'
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showCollectionsCount}
                onChange={handleSettingChange('showCollectionsCount')}
                disabled={isLoading}
                data-testid='privacy-show-collections-count'
              />
            }
            label='Show collections count'
          />
        </Box>
      </CardContent>
    </Card>
  );
};
