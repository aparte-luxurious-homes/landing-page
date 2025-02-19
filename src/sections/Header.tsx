import React from 'react';
import { AppBar, Toolbar, Container, Box } from '@mui/material';
import Logo from '../components/header/Logo';
import Navigation from '../components/header/Navigation';
import ActionButtons from '../components/header/ActionButtons';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  return (
    <AppBar
      sx={{
        backgroundColor: '#F3F3F3',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
        zIndex: 1300,
        position: { xs: 'fixed', md: 'fixed' },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          pt: { xs: 1, md: 1 },
          px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            justifyContent: 'space-between',
            pt: { xs: 0.5, sm: 1, md: 1, lg: 1.5 },
            pb: { xs: 0.5, sm: 1, md: 1, lg: 1.5 },
          }}
        >
          {/* Logo: Always visible */}
          <Logo />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Action Buttons: Always visible */}
            <ActionButtons />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
