import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import CardSection from '../ui/CardSection';

interface Pref {
  key: string;
  label: string;
  description: string;
}

const PREFS: Pref[] = [
  { key: 'email', label: 'Email Notifications', description: 'Receive updates about your account via email' },
  { key: 'bookings', label: 'Booking Reminders', description: 'Get notified about upcoming check-ins and check-outs' },
  { key: 'marketing', label: 'Marketing Emails', description: 'Receive promotions, deals, and new property alerts' },
];

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('notif_prefs');
      return saved ? JSON.parse(saved) : { email: true, bookings: true, marketing: false };
    } catch {
      return { email: true, bookings: true, marketing: false };
    }
  });

  const toggle = (key: string) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try { localStorage.setItem('notif_prefs', JSON.stringify(updated)); } catch {}
  };

  return (
    <CardSection title="Notification Preferences" subtitle="Preferences are saved locally">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {PREFS.map((p) => (
          <Box
            key={p.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
              borderBottom: '1px solid #f3f4f6',
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#191919' }}>{p.label}</Typography>
              <Typography variant="caption" sx={{ color: '#888' }}>{p.description}</Typography>
            </Box>
            <Switch
              checked={!!prefs[p.key]}
              onChange={() => toggle(p.key)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: '#028090' },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#028090' },
              }}
            />
          </Box>
        ))}
      </Box>
    </CardSection>
  );
}
