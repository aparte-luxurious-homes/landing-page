import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface CardSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function CardSection({ title, subtitle, children, action }: CardSectionProps) {
  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        borderLeft: '4px solid #028090',
        p: { xs: 2.5, sm: 3.5 },
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: '#191919' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: '#888', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  );
}
