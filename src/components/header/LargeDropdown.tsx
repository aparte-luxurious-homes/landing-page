import React from 'react';
import {
  Box,
  Button,
  Stack,
  Popover,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import LogoutDialog from './LogoutDialog';

interface LargeDropdownProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  isLoggedIn: boolean;
}

interface MenuItem {
  label: string;
  path: string;
  comingSoon?: boolean;
}

const menuItems: MenuItem[] = [
  // { label: "Home", path: "/" },
  // { label: "About", path: "/about" },
  // { label: "Help Center", path: "/help-center", comingSoon: true },
];

const accountItems: MenuItem[] = [
  { label: 'My Account', path: '/account' },
  { label: 'My Bookings', path: '/account?tab=bookings' },
  { label: 'Notifications', path: '/notifications', comingSoon: true },
  { label: 'Messages', path: '/messages', comingSoon: true },
];

const buttonStyle = {
  justifyContent: 'flex-start',
  textTransform: 'none',
  fontSize: '0.9rem',
  py: 0.5,
  px: 2,
  borderRadius: 1.5,
  display: 'flex',
  gap: 1,
  color: 'text.primary',
  '&:hover': {
    backgroundColor: 'rgba(2, 128, 144, 0.08)',
    color: 'primary.main',
  },
  '&.Mui-disabled': {
    opacity: 0.6,
    color: 'text.primary',
    cursor: 'not-allowed',
  },
};

const comingSoonStyle = {
  color: "primary.main",
  fontSize: "10px",
  px: 1,
  borderRadius: "12px",
  border: "1px solid",
  borderColor: "primary.main",
  display: 'inline-flex',
  alignItems: 'center',
  height: 'fit-content',
  whiteSpace: 'nowrap',
};

const LargeDropdown: React.FC<LargeDropdownProps> = ({ anchorEl, onClose, isLoggedIn }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const open = Boolean(anchorEl);

  const handleActionClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    dispatch(logout());
    setLogoutDialogOpen(false);
    onClose();
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 280,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            p: 1.5,
          },
        }}
      >
        <Stack spacing={0.5}>
          {/* Menu Items */}
          {menuItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              fullWidth
              variant="text"
              disabled={item.comingSoon}
              onClick={onClose}
              sx={buttonStyle}
            >
              {item.label}
              {item.comingSoon && (
                <Box sx={comingSoonStyle}>
                  Coming Soon
                </Box>
              )}
            </Button>
          ))}

          {/* Account Items if Logged In */}
          {isLoggedIn ? (
            <>
              {accountItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  fullWidth
                  variant="text"
                  disabled={item.comingSoon}
                  onClick={onClose}
                  sx={buttonStyle}
                >
                  {item.label}
                  {item.comingSoon && (
                    <Box sx={comingSoonStyle}>
                      Coming Soon
                    </Box>
                  )}
                </Button>
              ))}

              {/* List Your Aparté Button */}
              <Box 
                component={Link} 
                to="/list" 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  textDecoration: 'none',
                  py: 1,
                  px: 2,
                  mt: 1,
                  mb: 1,
                }}
              >
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/327a41b3030b704979745fedf54db7ed08202124f309815c919d67c58a4bf61e"
                  alt=""
                  style={{
                    objectFit: "contain",
                    width: "18px",
                    aspectRatio: "1/1",
                  }}
                />
                <Box sx={{ color: "primary.main", fontWeight: "medium", flexGrow: 1 }}>
                  List your Aparté
                </Box>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/a64d719319f82f60262ecf128d49c2443acec6a32d7465954b6dd95b08e57a57"
                  alt=""
                  style={{
                    objectFit: "contain",
                    width: "17px",
                    aspectRatio: "1.42/1",
                  }}
                />
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={handleLogoutClick}
                sx={{
                  backgroundColor: 'white',
                  color: 'error.main',
                  textTransform: 'none',
                  border: '1px solid',
                  borderColor: 'error.main',
                  borderRadius: 1.5,
                  py: 1,
                  px: 2,
                  fontSize: '0.9rem',
                  '&:hover': {
                    backgroundColor: 'error.main',
                    color: 'white',
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Box 
                component={Link} 
                to="/list" 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  textDecoration: 'none',
                  py: 1,
                  px: 2,
                  mt: 1,
                  mb: 1,
                }}
              >
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/327a41b3030b704979745fedf54db7ed08202124f309815c919d67c58a4bf61e"
                  alt=""
                  style={{
                    objectFit: "contain",
                    width: "18px",
                    aspectRatio: "1/1",
                  }}
                />
                <Box sx={{ color: "primary.main", fontWeight: "medium", flexGrow: 1 }}>
                  List your Aparté
                </Box>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/a64d719319f82f60262ecf128d49c2443acec6a32d7465954b6dd95b08e57a57"
                  alt=""
                  style={{
                    objectFit: "contain",
                    width: "17px",
                    aspectRatio: "1.42/1",
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleActionClick("/login")}
                  sx={{
                    color: "primary.main",
                    borderColor: "primary.main",
                    borderRadius: 1.5,
                    textTransform: "none",
                    py: 1,
                    fontSize: "0.9rem",
                    "&:hover": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleActionClick("/auth/user-type?action=signup")}
                  sx={{
                    backgroundColor: "primary.main",
                    borderRadius: 1.5,
                    textTransform: "none",
                    py: 1,
                    fontSize: "0.9rem",
                    "&:hover": {
                      backgroundColor: "white",
                      color: "primary.main",
                      border: "1px solid",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            </>
          )}
        </Stack>
      </Popover>

      <LogoutDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default LargeDropdown;
