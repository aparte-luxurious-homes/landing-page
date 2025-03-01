import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/system';
import HeroImage from '../components/hero/HeroImage';
import LargeSearchBar from '../components/search/LargeSearchBar';
import MobileSearchBar from '../components/search/mobile/MobileSearchBar';
import '../assets/styles/landing/hero.css';

import heroImage from '../assets/images/headerHero.png';

const Hero: React.FC = () => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 },
        mt: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          width: "100%", 
          maxWidth: { xs: "100%", sm: "960px", md: "1280px", lg: "1536px", xl: "100%" },
          px: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 },
        }}
      >
        <Box position="relative" sx={{ height: { xs: '400px', md: '500px', lg: '600px' } }}>
          <HeroImage 
            src={heroImage} 
            alt="Main content image" 
            sx={{ height: '100%', objectFit: 'cover' }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              flexDirection: 'column',
              padding: { xs: '2rem', md: '4rem', xl: '6rem' },
            }}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'white',
                color: '#028090',
                borderRadius: '50px',
                padding: '0.3rem 2rem',
                textTransform: 'none',
                fontSize: '0.7rem',
                mb: 2,
                ml: { xl: 5 },
              }}
            >
              Start exploring
            </Button>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 'medium',
                textAlign: 'left',
                maxWidth: '60%',
                fontSize: {
                  xs: '18px',
                  sm: '22px',
                  md: '28px',
                  lg: '32px',
                  xl: '38px',
                },
                lineHeight: 1.2,
                mb: 4,
                ml: { xl: 5 },
              }}
            >
              Instant access to just<br />
              another Home away<br />
              from Home
            </Typography>

            {isLargeScreen ? (
              <Box sx={{
                position: 'absolute',
                bottom: -30,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                maxWidth: '90%',
                margin: '0 auto',
                zIndex: 10,
              }}>
                <LargeSearchBar />
              </Box>
            ) : (
              <Box sx={{
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '90%',
                margin: '0 auto',
              }}>
                <MobileSearchBar />
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;