'use client';

import React from 'react';
import { Box } from '@mui/material';
// import { useNavigate } from '@/lib/router';
import { Link } from '@/lib/router';
import { BRAND_LOGO_URL } from '@/config/brand';

// interface LogoProps {}

const Logo: React.FC = () => {
  // const navigate = useNavigate();
  return (
    <Box 
      component={Link} 
      to="/"
      style={{ 
        display: 'flex', 
        alignItems: 'center',
        cursor: 'pointer',
        textDecoration: 'none'
      }}
    >
      <img
        src={BRAND_LOGO_URL}
        alt="Company Logo"
        style={{
          objectFit: 'contain',
          width: '116px',
        }}
      />
    </Box>
  );
};

export default Logo;
