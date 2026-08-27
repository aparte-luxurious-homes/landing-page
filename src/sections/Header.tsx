import React from 'react';
import { AppBar, Toolbar, Container, Box } from '@mui/material';
import Logo from '../components/header/Logo';
import ActionButtons from '../components/header/ActionButtons';
import HeaderSearchPill from '../components/home/HeaderSearchPill';

type HeaderProps = object

/**
 * Height is now explicit — 64px mobile, 80px desktop.
 *
 * It used to be whatever a default MUI Toolbar plus four responsive padding
 * values added up to, which every other route then guessed at with its own
 * `pt`. Four places depend on this number: the homepage spacer, the sticky
 * offset on the mobile search row, the expanded panel's `top`, and the
 * IntersectionObserver rootMargin. Change them together.
 */
const Header: React.FC<HeaderProps> = () => {
  return (
    <AppBar
      sx={{
        backgroundColor: '#ffffff',
        color: 'inherit',
        boxShadow: 'none',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 1300,
        position: 'fixed',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{ px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 } }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 64, md: 80 },
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Logo />

          {/*
            The middle cell is a Box, not the pill itself.
            <HeaderSearchPill> renders null off the homepage and on it until
            the search bar scrolls away, and a null child occupies no grid
            cell — so the account controls slid from the third column into
            the second and sat dead centre on every route, at every width.
          */}
          <Box sx={{ justifySelf: 'center', minWidth: 0 }}>
            <HeaderSearchPill />
          </Box>

          <Box sx={{ justifySelf: 'end' }}>
            <ActionButtons />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
