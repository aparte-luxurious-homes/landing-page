import React from 'react';
import { Box, Typography } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

interface PropertyHostInfoProps {
  agent:
    | {
        name: string;
        image?: string;
        profile?: {
          firstName: string;
          lastName: string;
        };
      }
    | undefined;
}

/** Flat host row: sits between two dividers instead of floating in a card. */
const PropertyHostInfo: React.FC<PropertyHostInfoProps> = ({ agent }) => {
  const name = agent?.profile?.firstName
    ? `${agent.profile.firstName} ${agent.profile.lastName || ''}`.trim()
    : 'Aparte';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.75,
        p: 1.5,
        pr: 2.5,
        borderRadius: 999,
        bgcolor: '#fff',
        boxShadow: '0 1px 2px rgba(25,25,25,0.06)',
        width: 'fit-content',
        maxWidth: '100%',
      }}
    >
      {agent?.image ? (
        <Box
          component="img"
          src={agent.image}
          alt=""
          sx={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '1px solid #4d4d4d',
            color: "lightgray",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <PersonIcon />
        </Box>
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.3 }} noWrap>
          {name}
        </Typography>
        {/* <Typography variant="body2" sx={{ color: 'rgba(25,25,25,0.6)' }}>
          Your host · payment held until check-in
        </Typography> */}
      </Box>
    </Box>
  );
};

export default PropertyHostInfo;
