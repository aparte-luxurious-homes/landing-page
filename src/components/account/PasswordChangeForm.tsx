import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { toast } from 'react-toastify';
import CardSection from '../ui/CardSection';
import FormField from '../ui/FormField';
import { passwordChangeSchema, PasswordChangeValues } from '../../lib/schemas/profileSchema';
import { useChangePasswordMutation } from '../../api/profileApi';
import { logout } from '../../features/auth/authSlice';

function getPasswordStrength(pwd: string): { label: string; color: string; value: number } {
  if (!pwd || pwd.length < 8) return { label: 'Weak', color: '#ef4444', value: 25 };
  if (pwd.length < 12) return { label: 'Medium', color: '#f59e0b', value: 60 };
  return { label: 'Strong', color: '#16a34a', value: 100 };
}

export default function PasswordChangeForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [changePassword] = useChangePasswordMutation();
  const [apiError, setApiError] = useState('');
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  const { control, handleSubmit, watch, reset, formState: { isSubmitting } } = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema) as any,
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    } as any,
  });

  const newPwd = watch('new_password');
  const strength = getPasswordStrength(newPwd);

  const toggle = (field: 'current' | 'new' | 'confirm') =>
    setShowPwd((prev) => ({ ...prev, [field]: !prev[field] }));

  const visibilityAdornment = (field: 'current' | 'new' | 'confirm') => (
    <InputAdornment position="end">
      <IconButton onClick={() => toggle(field)} edge="end" size="small" tabIndex={-1}>
        {showPwd[field] ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
      </IconButton>
    </InputAdornment>
  );

  const onSubmit = async (data: PasswordChangeValues) => {
    setApiError('');
    try {
      await changePassword(data).unwrap();
      toast.success('Password changed! Logging out...');
      reset();
      setTimeout(() => {
        dispatch(logout());
        navigate('/login', { state: { message: 'Password changed. Please log in with your new password.' } });
      }, 2000);
    } catch (err: any) {
      const msg = err?.data?.detail || err?.data?.message || 'Failed to change password';
      setApiError(msg);
    }
  };

  return (
    <CardSection title="Change Password" subtitle="You'll be logged out after changing your password">
      <Box component="form" onSubmit={handleSubmit(onSubmit as any)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 420 }}>
        {apiError && <Alert severity="error" onClose={() => setApiError('')}>{apiError}</Alert>}

        <FormField
          name="current_password"
          control={control}
          label="Current Password"
          type={showPwd.current ? 'text' : 'password'}
          InputProps={{ endAdornment: visibilityAdornment('current') }}
        />

        <Box>
          <FormField
            name="new_password"
            control={control}
            label="New Password"
            type={showPwd.new ? 'text' : 'password'}
            InputProps={{ endAdornment: visibilityAdornment('new') }}
          />
          {newPwd && (
            <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={strength.value}
                sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#e5e7eb',
                  '& .MuiLinearProgress-bar': { backgroundColor: strength.color, borderRadius: 2 },
                }}
              />
              <Typography variant="caption" sx={{ color: strength.color, fontWeight: 600, minWidth: 50 }}>
                {strength.label}
              </Typography>
            </Box>
          )}
        </Box>

        <FormField
          name="new_password_confirmation"
          control={control}
          label="Confirm New Password"
          type={showPwd.confirm ? 'text' : 'password'}
          InputProps={{ endAdornment: visibilityAdornment('confirm') }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            backgroundColor: '#028090',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            py: 1.2,
            alignSelf: 'flex-start',
            mt: 1,
            '&:hover': { backgroundColor: '#026d7a' },
          }}
        >
          {isSubmitting ? 'Changing...' : 'Change Password'}
        </Button>
      </Box>
    </CardSection>
  );
}
