import Box from '@mui/material/Box';
import NotificationPreferences from './NotificationPreferences';
import PasswordChangeForm from './PasswordChangeForm';

export default function AccountSettings() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <NotificationPreferences />
      <PasswordChangeForm />
    </Box>
  );
}
