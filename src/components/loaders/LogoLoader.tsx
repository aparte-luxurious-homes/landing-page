import React from 'react';
import { Box, keyframes } from '@mui/material';
import Logo from '../../assets/images/Logo.png';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;

interface LogoLoaderProps {
    height?: string | number;
}

const LogoLoader: React.FC<LogoLoaderProps> = ({ height = '400px' }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: height,
                minHeight: height,
            }}
        >
            <Box
                component="img"
                src={Logo.src}
                alt="Loading..."
                sx={{
                    width: { xs: '60px', md: '100px' },
                    height: 'auto',
                    animation: `${pulse} 1.5s ease-in-out infinite`,
                }}
            />
        </Box>
    );
};

export default LogoLoader;
