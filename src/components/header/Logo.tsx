import React from 'react';
import { Box } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

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
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/0c8a9b3dcb186de9d38d0c749f99db9e0969e3f2ccfb601ae3a6213043155bdb?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
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
