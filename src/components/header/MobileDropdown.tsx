import React from "react";
import { Box, Button, Divider, IconButton, Typography, Stack, Drawer } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import LogoutDialog from './LogoutDialog';

interface MobileDropdownProps {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}

const menuItems = [
  { label: "Home", path: "/" },
];

const afterLoginMenuItems = [
  { label: "About", path: "/about"},
  { label: "Help Center", path: "/help-center", comingSoon: true },
];

const accountItems = [
  { label: 'My Account', path: '/account' },
  { label: 'Manage My Bookings', path: '/manage-bookings', comingSoon: false },
  { label: 'Notifications', path: '/notifications', comingSoon: false },
  { label: 'Messages', path: '/messages', comingSoon: false },
];

const MobileDropdown: React.FC<MobileDropdownProps> = ({ open, onClose, isLoggedIn }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  const handleActionClick = (actionType: "login" | "signup") => {
    if (actionType === 'login') {
      navigate('/login');
      onClose();
      return;
    }
    navigate(`/auth/user-type?action=${actionType}`);
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

  const buttonStyle = {
    justifyContent: 'flex-start',
    textTransform: 'none',
    fontSize: '0.9rem',
    py: 1.5,
    borderRadius: 1.5,
    '&:hover': {
      backgroundColor: 'rgba(2, 128, 144, 0.05)',
      color: 'primary.main',
    },
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "370px",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            marginTop: { xs: "56px", sm: "64px" },
            height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
          },
        }}
      >
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column", 
          height: "100%" 
        }}>
          {/* Header */}
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            p: 3,
            pb: 0,
          }}>
            <Typography variant="h6" sx={{ fontWeight: "medium" }}>
              Menu
            </Typography>
            <IconButton onClick={onClose} sx={{ color: "text.primary" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Main Content */}
          <Box sx={{ p: 3, flex: 1, overflow: "auto" }}>
            <Stack spacing={1}>
              {/* Home Menu Item */}
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  fullWidth
                  variant="text"
                  onClick={onClose}
                  sx={{
                    ...buttonStyle,
                    color: location.pathname === item.path ? "primary.main" : "text.primary",
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {/* Account Items if Logged In */}
              {isLoggedIn && (
                <>
                  <Divider sx={{ my: 1 }} />
                  {accountItems.map((item) => (
                    <Button
                      key={item.path}
                      component={Link}
                      to={item.path}
                      fullWidth
                      variant="text"
                      disabled={item.comingSoon}
                      onClick={onClose}
                      sx={{
                        ...buttonStyle,
                        color: location.pathname === item.path ? "primary.main" : "text.primary",
                        display: 'flex',
                        justifyContent: 'flex-start',
                        gap: 1,
                      }}
                    >
                      {item.label}
                      {item.comingSoon && (
                        <Box
                          sx={{
                            color: "primary.main",
                            fontSize: "10px",
                            px: 1,
                            borderRadius: "12px",
                            border: "1px solid",
                            borderColor: "primary.main",
                            display: 'inline-flex',
                            alignItems: 'center',
                            height: 'fit-content',
                          }}
                        >
                          Coming Soon
                        </Box>
                      )}
                    </Button>
                  ))}
                </>
              )}

              {/* After Login Menu Items */}
              <Divider sx={{ my: 1 }} />
              {afterLoginMenuItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  fullWidth
                  variant="text"
                  disabled={item.comingSoon}
                  onClick={onClose}
                  sx={{
                    ...buttonStyle,
                    color: location.pathname === item.path ? "primary.main" : "text.primary",
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: 1,
                  }}
                >
                  {item.label}
                  {item.comingSoon && (
                    <Box
                      sx={{
                        color: "primary.main",
                        fontSize: "10px",
                        px: 1,
                        borderRadius: "12px",
                        border: "1px solid",
                        borderColor: "primary.main",
                        display: 'inline-flex',
                        alignItems: 'center',
                        height: 'fit-content',
                      }}
                    >
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
                  py: 1.5,
                  mt: 2,
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
                <Typography
                  variant="body1"
                  sx={{
                    color: "primary.main",
                    fontWeight: "medium",
                    flexGrow: 1,
                  }}
                >
                  List your Aparté
                </Typography>
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
            </Stack>
          </Box>

          {/* Footer - Auth Buttons */}
          <Box sx={{ 
            p: 3
          }}>
            {isLoggedIn ? (
              <Button
                fullWidth
                variant="contained"
                onClick={handleLogoutClick}
                sx={{
                  backgroundColor: 'white',
                  color: 'error.main',
                  border: '1px solid',
                  borderColor: 'error.main',
                  borderRadius: 1.5,
                  textTransform: 'none',
                  py: 1,
                  fontSize: '0.9rem',
                  '&:hover': {
                    backgroundColor: 'error.main',
                    color: 'white',
                  },
                }}
              >
                Logout
              </Button>
            ) : (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleActionClick("login")}
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
                  onClick={() => handleActionClick("signup")}
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
            )}
          </Box>
        </Box>
      </Drawer>

      <LogoutDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default MobileDropdown;