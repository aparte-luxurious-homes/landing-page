import React from 'react';
import { Box, keyframes } from '@mui/material';

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          animation: `${pulse} 1.5s ease-in-out infinite`,
          width: { xs: '130px', md: '150px' },
          height: 'auto',
        }}
      >
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/0c8a9b3dcb186de9d38d0c749f99db9e0969e3f2ccfb601ae3a6213043155bdb?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
          alt="Loading..."
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
    </Box>
  );
};

export default LoadingScreen; 