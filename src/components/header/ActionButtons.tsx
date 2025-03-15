import React, { useState } from 'react';
import { Box, useMediaQuery, useTheme, Avatar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LargeDropdown from './LargeDropdown';
import MobileDropdown from './MobileDropdown';
import { useAppSelector } from '../../store/hooks';
import { useGetProfileQuery } from '../../api/profileApi';
import type { RootState } from '../../store';

const ActionButtons: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLoggedIn = useAppSelector((state: RootState) => Boolean(state.root.auth.token));
  const { data: profileResponse } = useGetProfileQuery(undefined, {
    skip: !isLoggedIn
  });

  const profileData = profileResponse?.data;
  const walletBalance = (() => {
    const balance = profileData?.wallets?.find(wallet => wallet.currency === 'NGN')?.balance || '0';
    const num = parseFloat(balance);
    if (isMobile) {
      if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  })();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleMobileDropdown = () => {
    setMobileDropdownOpen(!mobileDropdownOpen);
  };

  const buttonStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '28px',
    padding: '4px 4px 4px 12px',
    transition: 'all 0.2s ease-in-out',
    backgroundColor: 'background.paper',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'primary.main',
      backgroundColor: 'rgba(2, 128, 144, 0.04)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
  };

  const walletPillStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '28px',
    padding: '4px 12px',
    backgroundColor: 'background.paper',
    marginRight: '8px',
  };

  const avatarStyles = {
    width: 32,
    height: 32,
    backgroundColor: isLoggedIn ? theme.palette.primary.main : 'transparent',
    border: isLoggedIn ? 'none' : `1px solid ${theme.palette.divider}`,
    transition: 'transform 0.2s ease-in-out',
  };

  const menuIconStyles = {
    color: theme.palette.text.primary,
    fontSize: 20,
    transition: 'transform 0.2s ease-in-out',
    pointerEvents: 'none',
  };

  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: isLoggedIn ? 88 : 44,
  };

  return (
    <Box sx={containerStyles}>
      {isLoggedIn && (
        <Box sx={walletPillStyles}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            Balance:
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
              fontSize: '0.875rem',
            }}
          >
            ₦{walletBalance}
          </Typography>
        </Box>
      )}
      {isMobile ? (
        <>
          <Box 
            sx={buttonStyles}
            onClick={toggleMobileDropdown}
          >
            <MenuIcon sx={menuIconStyles} />
            <Avatar
              src={profileData?.profile?.profileImage || undefined}
              alt={profileData?.email || ''}
              sx={avatarStyles}
            >
              {isLoggedIn ? (
                profileData?.profile?.firstName?.[0]?.toUpperCase() || profileData?.email?.[0]?.toUpperCase()
              ) : (
                <PersonOutlineIcon sx={{ color: theme.palette.text.primary, fontSize: 20 }} />
              )}
            </Avatar>
          </Box>
          <MobileDropdown 
            open={mobileDropdownOpen} 
            onClose={() => setMobileDropdownOpen(false)}
            isLoggedIn={isLoggedIn}
          />
        </>
      ) : (
        <>
          <Box 
            sx={buttonStyles}
            onClick={handleClick}
          >
            <MenuIcon sx={menuIconStyles} />
            <Avatar
              src={profileData?.profile?.profileImage || undefined}
              alt={profileData?.email || ''}
              sx={avatarStyles}
            >
              {isLoggedIn ? (
                profileData?.profile?.firstName?.[0]?.toUpperCase() || profileData?.email?.[0]?.toUpperCase()
              ) : (
                <PersonOutlineIcon sx={{ color: theme.palette.text.primary, fontSize: 20 }} />
              )}
            </Avatar>
          </Box>
          <LargeDropdown 
            anchorEl={anchorEl} 
            onClose={handleClose}
            isLoggedIn={isLoggedIn}
          />
        </>
      )}
    </Box>
  );
};

export default ActionButtons;