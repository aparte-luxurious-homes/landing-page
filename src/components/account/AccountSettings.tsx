import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Alert,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useUpdateProfileMutation } from '../../api/profileApi';

const AccountSettings: React.FC = () => {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    bookingReminders: true,
    marketingEmails: false,
  });

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      await updateProfile({
        firstName: '',  // Required field
        lastName: '',   // Required field
        currentPassword,
        newPassword
      }).unwrap();
      setShowSuccessMessage(true);
      setError(null);
      (event.target as HTMLFormElement).reset();
    } catch {
      setError('Failed to update password. Please check your current password and try again.');
    }
  };

  return (
    <Box>
      {showSuccessMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setShowSuccessMessage(false)}>
          Your password has been updated successfully.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Notification Preferences
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={() => handleSettingChange('emailNotifications')}
              />
            }
            label="Email Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.bookingReminders}
                onChange={() => handleSettingChange('bookingReminders')}
              />
            }
            label="Booking Reminders"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.marketingEmails}
                onChange={() => handleSettingChange('marketingEmails')}
              />
            }
            label="Marketing Emails"
          />
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box component="form" onSubmit={handlePasswordChange}>
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="currentPassword"
              label="Current Password"
              type="password"
              autoComplete="current-password"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              autoComplete="new-password"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3 }}>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isLoading}
            sx={{
              bgcolor: '#028090',
              '&:hover': {
                bgcolor: '#026f7a',
              },
            }}
          >
            Update Password
          </LoadingButton>
        </Box>
      </Box>
    </Box>
  );
};

export default AccountSettings; 