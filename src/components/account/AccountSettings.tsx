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
  InputAdornment,
  IconButton,
  FormHelperText,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useUpdateProfileMutation } from '../../api/profileApi';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const AccountSettings: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordTouched, setPasswordTouched] = useState(false);

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

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (confirmPassword) {
      setPasswordsMatch(e.target.value === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordsMatch(newPassword === e.target.value);
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    if (newPassword || confirmPassword) {
      setPasswordsMatch(newPassword === confirmPassword);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const currentPassword = formData.get('currentPassword') as string;
    
    try {
      const formData = new FormData();
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
      
      await updateProfile(formData).unwrap();
      
      // Show success message briefly before logout
      setShowSuccessMessage(true);
      setError(null);
      
      // Reset form
      setNewPassword('');
      setConfirmPassword('');
      setPasswordsMatch(true);
      setPasswordTouched(false);
      (event.target as HTMLFormElement).reset();
      
      // Log out user after 2 seconds and redirect to login
      setTimeout(() => {
        dispatch(logout());
        navigate('/login', { 
          state: { 
            message: 'Password updated successfully. Please log in with your new password.' 
          } 
        });
      }, 2000);
      
    } catch (error: any) {
      setError(error?.data?.message || 'Failed to update password. Please check your current password and try again.');
    }
  };

  return (
    <Box>
      {showSuccessMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          action={
            <LoadingButton
              color="inherit"
              size="small"
              onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}
            >
              Logout Now
            </LoadingButton>
          }
        >
          Password updated successfully! You will be logged out in 2 seconds to login with your new password.
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
              type={showCurrentPassword ? 'text' : 'password'}
              autoComplete="current-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle current password visibility"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              onBlur={handlePasswordBlur}
              error={passwordTouched && newPassword.length > 0 && newPassword.length < 8}
              helperText={
                passwordTouched && newPassword.length > 0 && newPassword.length < 8
                  ? 'Password must be at least 8 characters long'
                  : ''
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle new password visibility"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onBlur={handlePasswordBlur}
              error={!passwordsMatch && confirmPassword.length > 0}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {!passwordsMatch && confirmPassword.length > 0 && (
              <FormHelperText error>Passwords do not match</FormHelperText>
            )}
          </Grid>
        </Grid>

        {/* Password strength indicator */}
        {newPassword && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="textSecondary">
              Password strength:{' '}
              {newPassword.length < 8 ? (
                <span style={{ color: '#f44336' }}>Weak</span>
              ) : newPassword.length < 12 ? (
                <span style={{ color: '#ff9800' }}>Medium</span>
              ) : (
                <span style={{ color: '#4caf50' }}>Strong</span>
              )}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isLoading}
            disabled={!passwordsMatch || (newPassword.length > 0 && newPassword.length < 8)}
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
